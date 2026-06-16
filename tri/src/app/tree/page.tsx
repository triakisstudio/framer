import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { TreeGraph, type TreeNode } from "@/components/TreeGraph";

export default async function TreePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const follows = await prisma.follow.findMany({
    where: { ownerId: user.id },
    orderBy: { targetUsername: "asc" },
  });

  // Empty state — nothing imported yet.
  if (follows.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-20 text-center">
        <div className="text-5xl">🌱</div>
        <h1 className="mt-4 text-3xl font-bold">Your tree is empty</h1>
        <p className="mx-auto mt-2 max-w-md text-muted">
          Import the accounts you follow on Instagram to grow your tree and start
          finding your people on Tri.
        </p>
        <Link
          href="/import"
          className="mt-6 inline-block rounded-full bg-gradient-to-r from-brand to-brand-2 px-6 py-3 font-semibold text-background hover:opacity-90"
        >
          Import my following
        </Link>
      </div>
    );
  }

  // Which of the people I follow are already on Tri?
  const targetUsernames = follows.map((f) => f.targetUsername);
  const onTriUsers = await prisma.user.findMany({
    where: { igUsername: { in: targetUsernames } },
    select: { igUsername: true, displayName: true, avatarUrl: true },
  });
  const onTri = new Map(onTriUsers.map((u) => [u.igUsername, u]));

  // People already on Tri who followed me back on Instagram.
  const followersOnTri = await prisma.follow.count({
    where: {
      targetUsername: user.igUsername,
      owner: { id: { not: user.id } },
    },
  });

  const nodes: TreeNode[] = follows.map((f) => {
    const match = onTri.get(f.targetUsername);
    return {
      username: f.targetUsername,
      label: match?.displayName ?? f.targetUsername,
      avatarUrl: match?.avatarUrl ?? null,
      onTri: Boolean(match),
    };
  });

  const reconnected = nodes.filter((n) => n.onTri).length;

  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{user.displayName}&apos;s tree</h1>
          <p className="text-muted">@{user.igUsername}</p>
        </div>
        <div className="flex gap-3">
          <Stat label="You follow" value={follows.length} />
          <Stat label="On Tri now" value={reconnected} accent />
          <Stat label="Followed you" value={followersOnTri} />
        </div>
      </div>

      {reconnected > 0 && (
        <p className="mb-4 rounded-xl border border-brand/40 bg-brand/10 px-4 py-2 text-sm text-foreground">
          🎉 {reconnected} {reconnected === 1 ? "person" : "people"} you follow{" "}
          {reconnected === 1 ? "is" : "are"} already on Tri — they glow in your
          tree.
        </p>
      )}

      <TreeGraph
        center={{
          username: user.igUsername,
          label: user.displayName,
          avatarUrl: user.avatarUrl,
        }}
        nodes={nodes}
      />

      <p className="mt-3 text-center text-xs text-muted">
        Drag to pan · scroll to zoom · tap a face for details
      </p>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border px-4 py-2 text-center ${
        accent ? "border-brand bg-brand/10" : "border-border bg-surface"
      }`}
    >
      <div className={`text-2xl font-bold ${accent ? "tri-gradient-text" : ""}`}>
        {value}
      </div>
      <div className="text-xs text-muted">{label}</div>
    </div>
  );
}
