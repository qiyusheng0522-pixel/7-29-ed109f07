import { EIcon } from "@/components/EIcon";
import type { Verdict } from "@/lib/checkin";

/**
 * 「方案匹配度」结果卡片。
 * 打卡数据回收后，用来告诉家长当前推荐内容对孩子是否合适。
 */
export function VerdictCard({ v }: { v: Verdict }) {
  const style = {
    fit: { ring: "ring-success/30", bg: "bg-success/10", text: "text-success", icon: "✓", label: "匹配" },
    hard: { ring: "ring-warning/35", bg: "bg-warning/12", text: "text-warning-foreground", icon: "⚠️", label: "偏难" },
    easy: { ring: "ring-teal/30", bg: "bg-teal/10", text: "text-teal", icon: "📈", label: "偏松" },
  }[v.level];

  return (
    <div className={`rounded-2xl p-3.5 ring-1 ${style.ring} ${style.bg}`}>
      <div className="flex items-center gap-2">
        <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white text-[12px] shadow-sm ${style.text}`}>
          <EIcon e={style.icon} />
        </span>
        <p className={`min-w-0 flex-1 text-[13px] font-bold ${style.text} text-pretty`}>{v.title}</p>
        <span className={`shrink-0 rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-semibold ${style.text}`}>
          {style.label}
        </span>
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground text-pretty">{v.detail}</p>
      <div className="mt-2 flex gap-1.5 rounded-xl bg-white/70 px-2.5 py-2">
        <span className="shrink-0 text-[11px]">
          <EIcon e="💡" />
        </span>
        <p className="min-w-0 flex-1 text-[11px] leading-relaxed text-pretty">{v.advice}</p>
      </div>
    </div>
  );
}
