"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function TreeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="5" r="2.6" fill="currentColor" />
      <circle cx="5.5" cy="18" r="2.6" fill="currentColor" />
      <circle cx="18.5" cy="18" r="2.6" fill="currentColor" />
      <path d="M12 7.5 6.5 15.5M12 7.5l5.5 8" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
function ImportIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 3v11m0 0 4-4m-4 4-4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function PersonIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="3.4" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5 20c0-3.3 3.1-5.5 7-5.5s7 2.2 7 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function MobileNav({ username }: { username: string }) {
  const pathname = usePathname();
  const tabs = [
    { href: "/tree", label: "Tree", icon: <TreeIcon />, match: (p: string) => p === "/tree" },
    { href: "/import", label: "Import", icon: <ImportIcon />, match: (p: string) => p === "/import" },
    {
      href: `/u/${username}`,
      label: "You",
      icon: <PersonIcon />,
      match: (p: string) => p.startsWith("/u/"),
    },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/90 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-md items-stretch justify-around">
        {tabs.map((t) => {
          const active = t.match(pathname);
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] ${
                active ? "text-brand" : "text-muted"
              }`}
            >
              {t.icon}
              {t.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
