// Deterministic fallback avatars.
//
// For people who are already on Tri we show their uploaded avatar. For accounts
// that a user followed but who haven't joined yet, we cannot (and must not) pull
// their Instagram photo — so we render a stable, colorful placeholder derived
// from their handle. Same handle always yields the same color + initials.

const PALETTE = [
  "#f43f5e", // rose
  "#ec4899", // pink
  "#d946ef", // fuchsia
  "#a855f7", // purple
  "#8b5cf6", // violet
  "#6366f1", // indigo
  "#3b82f6", // blue
  "#0ea5e9", // sky
  "#06b6d4", // cyan
  "#14b8a6", // teal
  "#10b981", // emerald
  "#f59e0b", // amber
  "#f97316", // orange
];

function hash(str: string): number {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = (h * 33) ^ str.charCodeAt(i);
  }
  return h >>> 0;
}

export function avatarColor(username: string): string {
  return PALETTE[hash(username) % PALETTE.length];
}

export function avatarInitials(username: string): string {
  const cleaned = username.replace(/[^a-zA-Z0-9]/g, "");
  return (cleaned.slice(0, 2) || "?").toUpperCase();
}
