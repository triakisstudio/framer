import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { Avatar } from "@/components/Avatar";
import { normalizeUsername } from "@/lib/instagram";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const handle = normalizeUsername(username);

  const profile = await prisma.user.findUnique({
    where: { igUsername: handle },
  });
  if (!profile) notFound();

  const me = await getCurrentUser();

  // Do I follow them, and do they follow me? (Mutual reconnection signal.)
  let iFollowThem = false;
  let theyFollowMe = false;
  if (me && me.id !== profile.id) {
    const [a, b] = await Promise.all([
      prisma.follow.findUnique({
        where: {
          ownerId_targetUsername: {
            ownerId: me.id,
            targetUsername: profile.igUsername,
          },
        },
      }),
      prisma.follow.findUnique({
        where: {
          ownerId_targetUsername: {
            ownerId: profile.id,
            targetUsername: me.igUsername,
          },
        },
      }),
    ]);
    iFollowThem = Boolean(a);
    theyFollowMe = Boolean(b);
  }

  const followerCount = await prisma.follow.count({
    where: { targetUsername: profile.igUsername },
  });

  return (
    <div className="mx-auto max-w-xl px-5 py-14">
      <Link href="/tree" className="text-sm text-muted hover:text-foreground">
        ← Back to my tree
      </Link>

      <div className="mt-6 flex flex-col items-center rounded-3xl border border-border bg-surface p-8 text-center">
        <Avatar
          username={profile.igUsername}
          avatarUrl={profile.avatarUrl}
          size={96}
          ring="brand"
        />
        <h1 className="mt-4 text-2xl font-bold">{profile.displayName}</h1>
        <p className="text-muted">@{profile.igUsername}</p>
        {profile.bio && <p className="mt-3 text-muted">{profile.bio}</p>}

        <p className="mt-4 text-sm text-muted">
          {followerCount} {followerCount === 1 ? "person" : "people"} on Tri
          followed them on Instagram
        </p>

        {me && me.id !== profile.id && (
          <div className="mt-5 flex flex-wrap justify-center gap-2 text-sm">
            {iFollowThem && theyFollowMe ? (
              <span className="rounded-full border border-brand bg-brand/10 px-3 py-1 text-brand">
                🤝 You followed each other on Instagram
              </span>
            ) : iFollowThem ? (
              <span className="rounded-full border border-border px-3 py-1 text-muted">
                You followed them on Instagram
              </span>
            ) : theyFollowMe ? (
              <span className="rounded-full border border-border px-3 py-1 text-muted">
                They followed you on Instagram
              </span>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
