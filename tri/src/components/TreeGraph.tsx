"use client";

import { useMemo, useRef, useState } from "react";
import { avatarColor, avatarInitials } from "@/lib/avatar";

export interface TreeNode {
  username: string;
  label: string;
  avatarUrl?: string | null;
  onTri: boolean;
}

interface Placed extends TreeNode {
  x: number;
  y: number;
}

const CENTER_R = 44;
const NODE_R = 26;

function layout(nodes: TreeNode[]): Placed[] {
  // On-Tri friends sit on the inner rings so reconnections read first.
  const sorted = [...nodes].sort(
    (a, b) => Number(b.onTri) - Number(a.onTri) || a.label.localeCompare(b.label)
  );

  const placed: Placed[] = [];
  let index = 0;
  let ring = 1;
  const baseRadius = 150;
  const ringGap = 120;

  while (index < sorted.length) {
    const radius = baseRadius + (ring - 1) * ringGap;
    const circumference = 2 * Math.PI * radius;
    const capacity = Math.max(6, Math.floor(circumference / 78));
    const count = Math.min(capacity, sorted.length - index);
    // Offset every other ring so nodes don't line up radially.
    const offset = ring % 2 === 0 ? Math.PI / count : 0;

    for (let i = 0; i < count; i++) {
      const angle = offset + (i / count) * Math.PI * 2;
      const node = sorted[index++];
      placed.push({
        ...node,
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
      });
    }
    ring++;
  }

  return placed;
}

function NodeAvatar({
  node,
  r,
  onClick,
}: {
  node: Placed;
  r: number;
  onClick?: () => void;
}) {
  const clipId = `clip-${node.username}`;
  return (
    <g
      transform={`translate(${node.x}, ${node.y})`}
      className="cursor-pointer"
      onClick={onClick}
    >
      {node.avatarUrl ? (
        <>
          <clipPath id={clipId}>
            <circle r={r} />
          </clipPath>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <image
            href={node.avatarUrl}
            x={-r}
            y={-r}
            width={r * 2}
            height={r * 2}
            clipPath={`url(#${clipId})`}
            preserveAspectRatio="xMidYMid slice"
          />
        </>
      ) : (
        <>
          <circle r={r} fill={avatarColor(node.username)} />
          <text
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={r * 0.7}
            fontWeight={700}
            fill="#fff"
          >
            {avatarInitials(node.username)}
          </text>
        </>
      )}
      <circle
        r={r}
        fill="none"
        strokeWidth={node.onTri ? 3 : 1.5}
        stroke={node.onTri ? "var(--brand)" : "var(--border)"}
        className={node.onTri ? "tri-pulse" : ""}
      />
      <text
        y={r + 16}
        textAnchor="middle"
        fontSize={12}
        fill={node.onTri ? "var(--foreground)" : "var(--muted)"}
      >
        @{node.username.length > 16 ? node.username.slice(0, 15) + "…" : node.username}
      </text>
    </g>
  );
}

export function TreeGraph({
  center,
  nodes,
}: {
  center: { username: string; label: string; avatarUrl?: string | null };
  nodes: TreeNode[];
}) {
  const [onlyTri, setOnlyTri] = useState(false);
  const [selected, setSelected] = useState<Placed | null>(null);
  const [view, setView] = useState({ x: 0, y: 0, scale: 1 });
  // Active pointers (for one-finger pan and two-finger pinch).
  const pointers = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchDist = useRef<number | null>(null);

  const visible = useMemo(
    () => (onlyTri ? nodes.filter((n) => n.onTri) : nodes),
    [nodes, onlyTri]
  );
  const placed = useMemo(() => layout(visible), [visible]);

  const clampScale = (s: number) => Math.min(3, Math.max(0.25, s));

  function onWheel(e: React.WheelEvent) {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    setView((v) => ({ ...v, scale: clampScale(v.scale * factor) }));
  }

  function onPointerDown(e: React.PointerEvent) {
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;
    const next = { x: e.clientX, y: e.clientY };
    pointers.current.set(e.pointerId, next);
    const pts = [...pointers.current.values()];

    if (pts.length >= 2) {
      // Pinch: scale by the change in finger distance.
      const [a, b] = pts;
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinchDist.current != null) {
        const factor = dist / pinchDist.current;
        setView((v) => ({ ...v, scale: clampScale(v.scale * factor) }));
      }
      pinchDist.current = dist;
    } else {
      // Pan: follow the single finger / cursor.
      pinchDist.current = null;
      setView((v) => ({ ...v, x: v.x + (next.x - prev.x), y: v.y + (next.y - prev.y) }));
    }
  }

  function onPointerUp(e: React.PointerEvent) {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinchDist.current = null;
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-surface">
      {/* Controls */}
      <div className="absolute left-4 top-4 z-10 flex items-center gap-2">
        <button
          onClick={() => setOnlyTri((s) => !s)}
          className={`rounded-full border px-3 py-1.5 text-sm ${
            onlyTri
              ? "border-brand bg-brand/15 text-brand"
              : "border-border bg-surface-2 text-muted hover:text-foreground"
          }`}
        >
          {onlyTri ? "Showing only Tri friends" : "Show only Tri friends"}
        </button>
      </div>
      <div className="absolute right-4 top-4 z-10 flex gap-1">
        {[
          ["−", () => setView((v) => ({ ...v, scale: Math.max(0.25, v.scale * 0.9) }))],
          ["+", () => setView((v) => ({ ...v, scale: Math.min(3, v.scale * 1.1) }))],
          ["⟲", () => setView({ x: 0, y: 0, scale: 1 })],
        ].map(([label, fn], i) => (
          <button
            key={i}
            onClick={fn as () => void}
            className="h-8 w-8 rounded-lg border border-border bg-surface-2 text-muted hover:text-foreground"
          >
            {label as string}
          </button>
        ))}
      </div>

      <svg
        className="h-[68dvh] w-full touch-none select-none md:h-[72vh]"
        viewBox="-600 -400 1200 800"
        preserveAspectRatio="xMidYMid meet"
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        {/* viewBox is centered on (0,0); pan/zoom is applied here. */}
        <g transform={`translate(${view.x} ${view.y}) scale(${view.scale})`}>
          <CenteredContent center={center} placed={placed} onSelect={setSelected} />
        </g>
      </svg>

      {/* Detail panel */}
      {selected && (
        <div className="absolute bottom-4 left-4 z-10 w-64 rounded-2xl border border-border bg-surface-2 p-4 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="font-semibold">@{selected.username}</span>
            <button
              onClick={() => setSelected(null)}
              className="text-muted hover:text-foreground"
            >
              ✕
            </button>
          </div>
          <p className="mt-1 text-sm text-muted">
            {selected.onTri
              ? "🎉 They're on Tri — you've reconnected!"
              : "Not on Tri yet. They'll light up here when they join."}
          </p>
          {selected.onTri && (
            <a
              href={`/u/${selected.username}`}
              className="mt-3 inline-block rounded-lg bg-gradient-to-r from-brand to-brand-2 px-3 py-1.5 text-sm font-semibold text-background"
            >
              View profile
            </a>
          )}
        </div>
      )}
    </div>
  );
}

// Rendered inside an SVG <g> that we keep at the visual center via CSS.
function CenteredContent({
  center,
  placed,
  onSelect,
}: {
  center: { username: string; label: string; avatarUrl?: string | null };
  placed: Placed[];
  onSelect: (n: Placed) => void;
}) {
  return (
    <g transform="translate(0,0)" className="tri-center-layer">
      {/* edges */}
      {placed.map((n) => (
        <line
          key={`e-${n.username}`}
          x1={0}
          y1={0}
          x2={n.x}
          y2={n.y}
          stroke={n.onTri ? "var(--brand)" : "var(--border)"}
          strokeOpacity={n.onTri ? 0.5 : 0.3}
          strokeWidth={1}
        />
      ))}
      {/* nodes */}
      {placed.map((n) => (
        <NodeAvatar key={n.username} node={n} r={NODE_R} onClick={() => onSelect(n)} />
      ))}
      {/* center (you) */}
      <g>
        {center.avatarUrl ? (
          <>
            <clipPath id="clip-center">
              <circle r={CENTER_R} />
            </clipPath>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <image
              href={center.avatarUrl}
              x={-CENTER_R}
              y={-CENTER_R}
              width={CENTER_R * 2}
              height={CENTER_R * 2}
              clipPath="url(#clip-center)"
              preserveAspectRatio="xMidYMid slice"
            />
          </>
        ) : (
          <>
            <circle r={CENTER_R} fill={avatarColor(center.username)} />
            <text
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={CENTER_R * 0.6}
              fontWeight={800}
              fill="#fff"
            >
              {avatarInitials(center.username)}
            </text>
          </>
        )}
        <circle r={CENTER_R} fill="none" stroke="var(--brand-2)" strokeWidth={4} />
        <text y={CENTER_R + 20} textAnchor="middle" fontSize={14} fontWeight={700} fill="var(--foreground)">
          You
        </text>
      </g>
    </g>
  );
}
