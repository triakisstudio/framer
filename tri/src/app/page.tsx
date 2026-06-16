import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";

export default async function Home() {
  const user = await getCurrentUser();
  if (user) redirect("/tree");

  return (
    <div className="mx-auto max-w-5xl px-5">
      <section className="py-20 text-center">
        <p className="mb-4 inline-block rounded-full border border-border bg-surface px-4 py-1 text-sm text-muted">
          A calmer layer on top of Instagram
        </p>
        <h1 className="mx-auto max-w-3xl text-5xl font-black leading-tight tracking-tight sm:text-6xl">
          See the people you follow as a{" "}
          <span className="tri-gradient-text">tree</span>, not a feed.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted">
          Tri turns the accounts you follow on Instagram into a living tree of
          faces and names — no posts, no scrolling. When your friends move to
          Tri, you find each other again.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            href="/signup"
            className="rounded-full bg-gradient-to-r from-brand to-brand-2 px-6 py-3 font-semibold text-background hover:opacity-90"
          >
            Build my tree
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-border px-6 py-3 font-semibold text-foreground hover:border-brand"
          >
            Log in
          </Link>
        </div>
      </section>

      <section className="grid gap-5 pb-16 sm:grid-cols-3">
        {[
          {
            n: "1",
            t: "Claim your handle",
            d: "Create a Tri profile and tell us your Instagram username — that's how friends find you.",
          },
          {
            n: "2",
            t: "Import your data",
            d: "Download your information from Instagram and upload the following.json. Your data stays yours.",
          },
          {
            n: "3",
            t: "Reconnect",
            d: "See everyone as a tree. Anyone already on Tri lights up — and new arrivals appear over time.",
          },
        ].map((s) => (
          <div
            key={s.n}
            className="rounded-2xl border border-border bg-surface p-6"
          >
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-brand to-brand-2 font-bold text-background">
              {s.n}
            </div>
            <h3 className="font-semibold">{s.t}</h3>
            <p className="mt-1 text-sm text-muted">{s.d}</p>
          </div>
        ))}
      </section>

      <section className="mb-20 rounded-3xl border border-border bg-surface p-8 text-center">
        <h2 className="text-2xl font-bold">Why a data export, and not a login?</h2>
        <p className="mx-auto mt-3 max-w-2xl text-muted">
          Instagram&apos;s API deliberately doesn&apos;t share who you follow, and
          scraping it breaks their rules. So Tri uses the one source that&apos;s
          truly yours: the official data export Instagram gives every user.
          It&apos;s private, permitted, and portable.
        </p>
      </section>
    </div>
  );
}
