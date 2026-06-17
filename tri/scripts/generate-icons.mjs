// Dependency-free PNG icon generator for Tri.
// Draws the "Tri" mark: a brand gradient with three connected white nodes
// (a tiny tree). Content is kept in the central ~80% so it survives maskable
// cropping on Android. Run with: node scripts/generate-icons.mjs
import zlib from "node:zlib";
import fs from "node:fs";
import path from "node:path";

// --- CRC32 ---------------------------------------------------------------
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

function encodePNG(width, height, rgb) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type: truecolor RGB
  // 10,11,12 = compression/filter/interlace = 0
  // Add filter byte (0) per scanline.
  const stride = width * 3;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0;
    rgb.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// --- drawing -------------------------------------------------------------
const lerp = (a, b, t) => a + (b - a) * t;
const BRAND = [192, 132, 252]; // #c084fc
const BRAND2 = [244, 114, 182]; // #f472b6
const WHITE = [255, 255, 255];

function distToSegment(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const len2 = dx * dx + dy * dy || 1;
  let t = ((px - ax) * dx + (py - ay) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  const cx = ax + t * dx;
  const cy = ay + t * dy;
  return Math.hypot(px - cx, py - cy);
}

function render(size) {
  const rgb = Buffer.alloc(size * size * 3);
  const S = size;
  // node positions (centered, within safe area)
  const nodes = [
    [0.5 * S, 0.32 * S],
    [0.3 * S, 0.7 * S],
    [0.7 * S, 0.7 * S],
  ];
  const nodeR = 0.11 * S;
  const lineW = 0.035 * S;
  const aa = Math.max(1, S * 0.004);

  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      // diagonal brand gradient background
      const t = (x + y) / (2 * S);
      let r = lerp(BRAND[0], BRAND2[0], t);
      let g = lerp(BRAND[1], BRAND2[1], t);
      let b = lerp(BRAND[2], BRAND2[2], t);

      // connecting lines (drawn under nodes)
      let lineCov = 0;
      for (let i = 1; i < nodes.length; i++) {
        const d = distToSegment(x, y, nodes[0][0], nodes[0][1], nodes[i][0], nodes[i][1]);
        lineCov = Math.max(lineCov, 1 - smooth(d - lineW / 2, aa));
      }
      // nodes (white discs)
      let nodeCov = 0;
      for (const [nx, ny] of nodes) {
        const d = Math.hypot(x - nx, y - ny);
        nodeCov = Math.max(nodeCov, 1 - smooth(d - nodeR, aa));
      }
      const cov = Math.max(lineCov * 0.9, nodeCov);
      r = lerp(r, WHITE[0], cov);
      g = lerp(g, WHITE[1], cov);
      b = lerp(b, WHITE[2], cov);

      const o = (y * S + x) * 3;
      rgb[o] = Math.round(r);
      rgb[o + 1] = Math.round(g);
      rgb[o + 2] = Math.round(b);
    }
  }
  return encodePNG(S, S, rgb);
}
// smoothstep edge: 0 inside, 1 fully outside, ramp over `aa` px
function smooth(d, aa) {
  if (d <= -aa) return 0;
  if (d >= aa) return 1;
  const t = (d + aa) / (2 * aa);
  return t * t * (3 - 2 * t);
}

const outDir = path.join(process.cwd(), "public");
fs.mkdirSync(outDir, { recursive: true });
const targets = [
  ["icon-192.png", 192],
  ["icon-512.png", 512],
  ["apple-icon-180.png", 180],
];
for (const [name, size] of targets) {
  fs.writeFileSync(path.join(outDir, name), render(size));
  console.log("wrote", name, `(${size}x${size})`);
}
