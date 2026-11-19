"use client";

import clsx from "clsx";
import { Compass, House } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "Home", icon: House },
  { href: "/discover", label: "Discover", icon: Compass },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary navigation"
      className="safe-bottom shrink-0 border-t border-line/80 bg-paper/95 px-4 pt-2 backdrop-blur-xl"
    >
      <div className="grid grid-cols-2">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={clsx(
                "group flex flex-col items-center gap-1 rounded-2xl py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] transition-colors",
                active ? "text-ink" : "text-muted hover:text-ink/70",
              )}
            >
              <span
                className={clsx(
                  "flex h-9 min-w-[64px] items-center justify-center rounded-full transition-all duration-300",
                  active
                    ? "bg-ink text-paper shadow-[0_8px_18px_rgba(33,28,23,0.16)]"
                    : "bg-transparent",
                )}
              >
                <Icon
                  size={18}
                  strokeWidth={active ? 2.2 : 1.8}
                  aria-hidden="true"
                />
              </span>
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
