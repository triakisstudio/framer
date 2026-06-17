import { avatarColor, avatarInitials } from "@/lib/avatar";

export function Avatar({
  username,
  avatarUrl,
  size = 48,
  ring,
}: {
  username: string;
  avatarUrl?: string | null;
  size?: number;
  ring?: "brand" | "muted" | "none";
}) {
  const ringClass =
    ring === "brand"
      ? "ring-2 ring-brand"
      : ring === "muted"
        ? "ring-1 ring-border"
        : "";

  if (avatarUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={avatarUrl}
        alt={username}
        width={size}
        height={size}
        className={`rounded-full object-cover ${ringClass}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center rounded-full font-semibold text-white ${ringClass}`}
      style={{
        width: size,
        height: size,
        background: avatarColor(username),
        fontSize: size * 0.38,
      }}
      aria-label={username}
    >
      {avatarInitials(username)}
    </div>
  );
}
