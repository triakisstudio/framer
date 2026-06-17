import Link from "next/link";
import { logoutAction } from "@/lib/actions";
import { Avatar } from "./Avatar";

type HeaderUser = { igUsername: string; avatarUrl: string | null } | null;

export function SiteHeader({ user }: { user: HeaderUser }) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/80 pt-[env(safe-area-inset-top)] backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <Link href={user ? "/tree" : "/"} className="flex items-center gap-2">
          <span className="text-xl font-black tracking-tight tri-gradient-text">
            Tri
          </span>
          <span className="hidden text-xs text-muted sm:inline">
            find your people again
          </span>
        </Link>

        <nav className="flex items-center gap-3 text-sm">
          {user ? (
            <>
              {/* Primary nav lives in the bottom bar on mobile. */}
              <Link
                href="/tree"
                className="hidden text-muted hover:text-foreground md:inline"
              >
                My tree
              </Link>
              <Link
                href="/import"
                className="hidden text-muted hover:text-foreground md:inline"
              >
                Import
              </Link>
              <div className="flex items-center gap-2 pl-1">
                <Avatar
                  username={user.igUsername}
                  avatarUrl={user.avatarUrl}
                  size={30}
                  ring="brand"
                />
                <span className="hidden text-muted sm:inline">
                  @{user.igUsername}
                </span>
              </div>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="rounded-full border border-border px-3 py-1 text-muted hover:text-foreground"
                >
                  Log out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="text-muted hover:text-foreground">
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-foreground px-4 py-1.5 font-semibold text-background hover:opacity-90"
              >
                Join Tri
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
