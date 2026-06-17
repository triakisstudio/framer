import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ImportForm } from "@/components/ImportForm";

export default async function ImportPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const existing = await prisma.follow.count({ where: { ownerId: user.id } });

  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      <h1 className="text-3xl font-bold">Import who you follow</h1>
      <p className="mt-2 text-muted">
        {existing > 0
          ? `You've already imported ${existing} accounts. Uploading again replaces them.`
          : "Upload your Instagram data export to plant your tree."}
      </p>

      <ol className="mt-6 space-y-2 rounded-2xl border border-border bg-surface p-6 text-sm text-muted">
        <li>
          <span className="font-semibold text-foreground">1.</span> In the
          Instagram app: <em>Settings → Accounts Center → Your information and
          permissions → Download your information</em>.
        </li>
        <li>
          <span className="font-semibold text-foreground">2.</span> Request a
          download of <em>Followers and following</em>, choose format{" "}
          <span className="font-semibold text-foreground">JSON</span>.
        </li>
        <li>
          <span className="font-semibold text-foreground">3.</span> When the
          file arrives, unzip it and find{" "}
          <code className="rounded bg-surface-2 px-1.5 py-0.5 text-xs">
            connections/followers_and_following/following.json
          </code>
          .
        </li>
        <li>
          <span className="font-semibold text-foreground">4.</span> Upload it
          below.
        </li>
      </ol>

      <div className="mt-8">
        <ImportForm />
      </div>
    </div>
  );
}
