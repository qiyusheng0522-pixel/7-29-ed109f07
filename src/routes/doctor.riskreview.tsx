import { createFileRoute } from "@tanstack/react-router";
import { StatusBar } from "@/components/MobileFrame";
import { SubNav, reviewSubNav } from "@/components/DoctorSubNav";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/doctor/riskreview")({
  component: RiskReviewPage,
});

const cases = [
  {
    name: "刘小强",
    class: "5年1班",
    system: "红",
    factors: ["BMI 26.4（>P97）", "腰围 78cm（>P90）", "父亲肥胖史"],
    suggest: "医生复核 + 绿色通道",
  },
  {
    name: "张小乐",
    class: "1年1班",
    system: "橙",
    factors: ["夜间咳嗽 >4 次/周", "尘螨阳性", "运动后喘息"],
    suggest: "医生复核 + 呼吸/过敏专科",
  },
  {
    name: "李小雨",
    class: "3年3班",
    system: "黄",
    factors: ["BMI 16.8 偏轻", "偶发夜咳"],
    suggest: "健管师跟进 + 家庭呵护",
  },
];

const flows = ["健管师跟进", "医生复核", "绿色通道", "家庭呵护"];

function RiskReviewPage() {
  const [pick, setPick] = useState<Record<string, string>>({});
  return (
    <div>
      <StatusBar title="风险复核" />
      <SubNav items={reviewSubNav} />
      <div className="px-5 pb-8 pt-2">
        <h1 className="text-xl font-bold">风险复核</h1>
        <p className="mb-3 text-xs text-muted-foreground">
          五色分层用于分流，不是给孩子贴标签 · 调整需留痕
        </p>

        <ul className="space-y-3">
          {cases.map((c) => (
            <li key={c.name} className="rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-border/60">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">{c.name} · {c.class}</p>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] ${
                    c.system === "红"
                      ? "bg-danger text-danger-foreground"
                      : c.system === "橙"
                      ? "bg-warm text-warm-foreground"
                      : "bg-warning text-warning-foreground"
                  }`}
                >
                  系统 {c.system}
                </span>
              </div>

              <div className="mt-2 rounded-xl bg-surface-2 p-3">
                <p className="text-[11px] text-muted-foreground">分层依据</p>
                <ul className="mt-1 space-y-0.5 text-xs">
                  {c.factors.map((f) => (
                    <li key={f}>· {f}</li>
                  ))}
                </ul>
              </div>

              <p className="mt-2 text-[11px] text-teal">建议：{c.suggest}</p>

              <div className="mt-3">
                <p className="mb-1 text-[11px] text-muted-foreground">调整分层（可选）</p>
                <div className="flex gap-1.5">
                  {["红", "橙", "黄", "蓝", "绿"].map((lv) => (
                    <button
                      key={lv}
                      onClick={() => setPick((p) => ({ ...p, [c.name]: lv }))}
                      className={`h-8 w-8 rounded-full text-xs font-semibold ${
                        pick[c.name] === lv
                          ? "bg-deep text-deep-foreground"
                          : "bg-surface-2 text-muted-foreground"
                      }`}
                    >
                      {lv}
                    </button>
                  ))}
                </div>
                {pick[c.name] && pick[c.name] !== c.system && (
                  <input
                    className="mt-2 w-full rounded-xl bg-surface-2 px-3 py-2 text-xs outline-none"
                    placeholder="填写调整原因（必填，用于留痕）"
                  />
                )}
              </div>

              <div className="mt-3">
                <p className="mb-1 text-[11px] text-muted-foreground">分流标记</p>
                <div className="flex flex-wrap gap-1.5">
                  {flows.map((f) => (
                    <label key={f} className="flex items-center gap-1 rounded-full bg-surface-2 px-2.5 py-1 text-[11px]">
                      <input type="checkbox" className="accent-deep" />
                      {f}
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={() => toast.success(`已确认 ${c.name} 的复核结果`, { description: "分级与分流标记已保存" })}
                className="mt-3 w-full rounded-xl bg-deep py-2 text-xs font-medium text-deep-foreground"
              >
                确认复核结果
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
