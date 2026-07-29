import { Link, useRouterState } from "@tanstack/react-router";
import { Home } from "lucide-react";

import { EIcon } from "@/components/EIcon";

const roles = [
  { to: "/parent", label: "家长", icon: <EIcon e="👨‍👩‍👧" />, color: "bg-warm", ring: "ring-warm/40" },
  { to: "/school", label: "学校", icon: <EIcon e="🏫" />, color: "bg-teal", ring: "ring-teal/40" },
  { to: "/doctor", label: "医生", icon: <EIcon e="🩺" />, color: "bg-deep", ring: "ring-deep/40" },
  { to: "/community", label: "社区", icon: <EIcon e="🏥" />, color: "bg-rose", ring: "ring-rose/40" },
] as const;

/**
 * Prototype-only end switcher. Docked *below* the device frame rather than
 * floating over it, so it never overlaps the screen content it is meant to
 * navigate between.
 */
export function RoleSwitcher() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (pathname === "/") return null;

  return (
    <div className="mx-auto mt-5 flex w-full max-w-[402px] items-center gap-1.5 rounded-2xl bg-white/70 p-1.5 shadow-lg shadow-slate-900/5 ring-1 ring-slate-900/5 backdrop-blur">
      <Link
        to="/"
        aria-label="回到身份选择"
        className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-900/5 hover:text-slate-700"
      >
        <Home className="h-4 w-4" strokeWidth={2.2} />
      </Link>

      <span className="h-6 w-px shrink-0 bg-slate-900/10" />

      <div className="flex flex-1 items-center gap-1">
        {roles.map((r) => {
          const active = pathname.startsWith(r.to);
          return (
            <Link
              key={r.to}
              to={r.to}
              aria-current={active ? "page" : undefined}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-[11px] font-medium transition ${
                active
                  ? `${r.color} text-white shadow-sm ring-1 ${r.ring}`
                  : "text-slate-500 hover:bg-slate-900/5 hover:text-slate-700"
              }`}
            >
              <span className="text-[13px] leading-none">{r.icon}</span>
              <span>{r.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
