import { Link, useRouterState } from "@tanstack/react-router";

export function SubNav({ items }: { items: { to: string; label: string }[] }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="sticky top-0 z-10 flex gap-1 overflow-x-auto bg-surface-2/95 px-5 py-2 backdrop-blur">
      {items.map((it) => {
        const active = path === it.to;
        return (
          <Link
            key={it.to}
            to={it.to}
            className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] ${
              active
                ? "bg-deep text-deep-foreground font-medium"
                : "bg-surface text-muted-foreground ring-1 ring-border/60"
            }`}
          >
            {it.label}
          </Link>
        );
      })}
    </div>
  );
}

export const examSubNav = [
  { to: "/doctor/prep", label: "体检前准备" },
  { to: "/doctor/exam", label: "校内录检" },
  { to: "/doctor/qc", label: "报告审核" },
];

export const reviewSubNav = [
  { to: "/doctor/review", label: "报告审核" },
  { to: "/doctor/focus", label: "重点儿童" },
  { to: "/doctor/riskreview", label: "风险复核" },
];
