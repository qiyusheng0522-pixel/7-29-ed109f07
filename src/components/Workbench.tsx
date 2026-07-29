import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Bell, ChevronRight } from "lucide-react";

/** Role accents shared by the doctor / community / school workbenches. */
export type Accent = "warm" | "teal" | "deep" | "rose";

const ACCENT = {
  warm: {
    text: "text-warm",
    bg: "bg-warm",
    fg: "text-warm-foreground",
    soft: "bg-warm/10",
    grad: "from-warm to-warm/80",
    shadow: "shadow-warm/20",
  },
  teal: {
    text: "text-teal",
    bg: "bg-teal",
    fg: "text-teal-foreground",
    soft: "bg-teal/10",
    grad: "from-teal to-teal/80",
    shadow: "shadow-teal/20",
  },
  deep: {
    text: "text-deep",
    bg: "bg-deep",
    fg: "text-deep-foreground",
    soft: "bg-deep/10",
    grad: "from-deep to-deep/80",
    shadow: "shadow-deep/20",
  },
  rose: {
    text: "text-rose",
    bg: "bg-rose",
    fg: "text-rose-foreground",
    soft: "bg-rose/10",
    grad: "from-rose to-rose/80",
    shadow: "shadow-rose/20",
  },
} as const satisfies Record<Accent, Record<string, string>>;

export function accentOf(accent: Accent) {
  return ACCENT[accent];
}

/**
 * Workbench app bar. Deliberately has no back affordance: these screens are
 * bottom-nav roots, and the previous decorative "‹" glyph looked interactive
 * but did nothing.
 */
export function WorkbenchHeader({
  title,
  accent,
  notifyTo,
  avatar,
  unread,
}: {
  title: string;
  accent: Accent;
  notifyTo: string;
  avatar: string;
  unread?: boolean;
}) {
  const a = ACCENT[accent];
  return (
    <div className="flex items-center gap-3 bg-surface px-5 py-2.5">
      <h1 className="min-w-0 flex-1 truncate text-[17px] font-bold">{title}</h1>
      <Link
        to={notifyTo}
        aria-label="消息通知"
        className="relative grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition hover:bg-surface-2 hover:text-foreground"
      >
        <Bell className="h-[18px] w-[18px]" />
        {unread && (
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-danger ring-2 ring-surface" />
        )}
      </Link>
      <span
        className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-[13px] font-bold ${a.bg} ${a.fg}`}
      >
        {avatar}
      </span>
    </div>
  );
}

/** Greeting hero. Copy is kept on two tight lines so it never overflows. */
export function GreetingCard({
  accent,
  greeting,
  meta,
}: {
  accent: Accent;
  greeting: ReactNode;
  meta: ReactNode;
}) {
  const a = ACCENT[accent];
  return (
    <div className="px-5 pt-3">
      <div
        className={`rounded-3xl bg-gradient-to-br p-4 shadow-lg ${a.grad} ${a.fg} ${a.shadow}`}
      >
        <p className="flex items-center gap-1.5 text-[17px] font-bold leading-tight">{greeting}</p>
        <p className="mt-1 text-[12px] leading-snug opacity-85">{meta}</p>
      </div>
    </div>
  );
}

/** Section heading with an accent rule instead of the old "〰" glyph. */
export function SectionTitle({
  accent,
  children,
  right,
}: {
  accent: Accent;
  children: ReactNode;
  right?: ReactNode;
}) {
  const a = ACCENT[accent];
  return (
    <div className="mb-3 flex items-center gap-2">
      <span className={`h-3.5 w-1 shrink-0 rounded-full ${a.bg}`} />
      <h2 className="min-w-0 flex-1 truncate text-sm font-bold">{children}</h2>
      {right}
    </div>
  );
}

export function SectionCount({ accent, children }: { accent: Accent; children: ReactNode }) {
  const a = ACCENT[accent];
  return (
    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${a.soft} ${a.text}`}>
      {children}
    </span>
  );
}

export type WorkbenchStat = {
  icon: ReactNode;
  iconBg: string;
  label: string;
  sub: string;
  value: number;
  unit: string;
  valueColor: string;
  to: string;
  search?: Record<string, unknown>;
};

/**
 * Metric tile. The count and its unit are grouped on one baseline — previously
 * the number floated top-right while its unit sat bottom-right, so they read as
 * unrelated values.
 */
export function StatCard({ stat }: { stat: WorkbenchStat }) {
  return (
    <Link
      to={stat.to}
      search={stat.search}
      className="flex flex-col rounded-2xl bg-surface p-3.5 shadow-sm ring-1 ring-border/60 transition hover:shadow-md active:scale-[0.98]"
    >
      <div className="flex items-center gap-2">
        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-[18px] ${stat.iconBg}`}>
          {stat.icon}
        </span>
        <p className="min-w-0 flex-1 truncate text-[14px] font-semibold">{stat.label}</p>
      </div>

      <div className="mt-2.5 flex items-baseline gap-1">
        <span className={`text-[26px] font-bold leading-none ${stat.valueColor}`}>{stat.value}</span>
        <span className="truncate text-[11px] text-muted-foreground">{stat.unit}</span>
      </div>

      <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-muted-foreground">{stat.sub}</p>
    </Link>
  );
}

/** Horizontal filter chips shared by the workbench todo lists. */
export function FilterChips<T extends { key: string; label: string }>({
  accent,
  filters,
  active,
  onChange,
  countOf,
}: {
  accent: Accent;
  filters: readonly T[];
  active: string;
  onChange: (key: string) => void;
  countOf: (f: T) => number;
}) {
  const a = ACCENT[accent];
  return (
    <div className="no-scrollbar -mx-5 mb-3 flex gap-2 overflow-x-auto px-5 pb-1">
      {filters.map((f) => {
        const on = active === f.key;
        return (
          <button
            key={f.key}
            type="button"
            onClick={() => onChange(f.key)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-[12px] font-medium ring-1 transition ${
              on
                ? `${a.bg} ${a.fg} ring-transparent`
                : "bg-surface text-muted-foreground ring-border/60 hover:text-foreground"
            }`}
          >
            {f.label}
            <span className={`ml-1 ${on ? "opacity-75" : "opacity-55"}`}>{countOf(f)}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Row in a workbench todo list. */
export function TodoRow({
  index,
  to,
  search,
  tags,
  title,
  desc,
}: {
  index: number;
  to: string;
  search?: Record<string, unknown>;
  tags: { text: string; cls: string }[];
  title: string;
  desc: string;
}) {
  return (
    <li>
      <Link
        to={to}
        search={search}
        className="flex items-center gap-3 rounded-2xl bg-surface p-3 shadow-sm ring-1 ring-border/60 transition hover:shadow-md"
      >
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-surface-2 text-[12px] font-bold text-muted-foreground">
          {index}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag.text}
                className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${tag.cls}`}
              >
                {tag.text}
              </span>
            ))}
            <span className="truncate text-[13px] font-semibold">{title}</span>
          </div>
          <p className="mt-1 truncate text-[11px] text-muted-foreground">{desc}</p>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/50" />
      </Link>
    </li>
  );
}
