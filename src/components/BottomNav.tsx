import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";

export type NavItem = {
  to: string;
  label: string;
  icon: ReactNode;
};

export function BottomNav({ items, accent = "warm" }: { items: NavItem[]; accent?: "warm" | "teal" | "deep" | "rose" }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const accentText = accent === "teal" ? "text-teal" : accent === "deep" ? "text-deep" : accent === "rose" ? "text-rose" : "text-warm";
  const accentBg = accent === "teal" ? "bg-teal/15" : accent === "deep" ? "bg-deep/15" : accent === "rose" ? "bg-rose/15" : "bg-warm/15";

  return (
    <nav
      aria-label="主导航"
      // Sits outside the scrolling page wrapper, so plain flow keeps it pinned.
      className="z-20 shrink-0 border-t border-border bg-surface/95 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur"
    >
      <ul className="grid" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
        {items.map((it) => {
          const active = pathname === it.to;
          return (
            <li key={it.to} className="flex min-w-0">
              <Link
                to={it.to}
                aria-current={active ? "page" : undefined}
                className="flex min-w-0 flex-1 flex-col items-center gap-0.5 px-1 pt-2 pb-1 text-[10px] text-muted-foreground transition-colors"
              >
                <span
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl text-[17px] transition ${
                    active ? `${accentBg} ${accentText}` : ""
                  }`}
                >
                  {it.icon}
                </span>
                <span className={`max-w-full truncate ${active ? `${accentText} font-semibold` : ""}`}>
                  {it.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
