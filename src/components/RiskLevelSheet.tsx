import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { RISK_LEVELS, riskByKey } from "@/lib/risk-levels";

/** 点击可查看「五色分层梯度」详细注释的风险等级徽章 */
export function RiskLevelSheet({
  current,
  trigger,
}: {
  current?: string;
  trigger: React.ReactNode;
}) {
  const cur = current ? riskByKey(current) : undefined;
  return (
    <Sheet>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent
        side="bottom"
        className="mx-auto max-h-[85vh] max-w-md overflow-y-auto rounded-t-3xl border-0 bg-background p-0 shadow-2xl"
      >
        <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-muted" />
        <div className="px-5 pb-8 pt-3">
          <SheetHeader className="text-left">
            <SheetTitle className="text-base">五色分层梯度 · 等级说明</SheetTitle>
            <SheetDescription className="text-[11px]">
              全平台（家长 / 学校 / 医生 / 社区）采用同一套风险分层标准，规则透明可查。
            </SheetDescription>
          </SheetHeader>

          {cur && (
            <div className="mt-3 rounded-2xl bg-surface-2 p-3">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full" style={{ background: cur.dot }} />
                <p className="text-sm font-bold">
                  当前等级：{cur.key} · {cur.level}
                </p>
              </div>
              <p className="mt-1.5 text-[12px] leading-relaxed text-foreground/80">{cur.note}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                判定依据：{cur.basis} · 责任主体：{cur.owner}
              </p>
            </div>
          )}

          <ul className="mt-3 space-y-2">
            {RISK_LEVELS.map((r) => (
              <li
                key={r.key}
                className={`rounded-2xl p-3 ring-1 ${
                  cur?.key === r.key ? "bg-surface ring-warm/50" : "bg-surface ring-border/60"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: r.dot }} />
                  <span className="text-[13px] font-semibold">{r.key}</span>
                  <span className="text-[12px] text-muted-foreground">· {r.level}</span>
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-foreground/80">{r.note}</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5 text-[10px]">
                  <span className="rounded-full bg-surface-2 px-2 py-0.5">下一步：{r.action}</span>
                  <span className="rounded-full bg-surface-2 px-2 py-0.5">责任主体：{r.owner}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </SheetContent>
    </Sheet>
  );
}
