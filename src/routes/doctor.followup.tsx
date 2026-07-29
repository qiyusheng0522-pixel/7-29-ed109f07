import { createFileRoute, Link } from "@tanstack/react-router";
import { StatusBar } from "@/components/MobileFrame";
import { ActionSheet } from "@/components/ActionSheet";

export const Route = createFileRoute("/doctor/followup")({
  component: FollowUpPage,
});

const timeline = [
  { stage: "7 天随访", date: "已完成 04-01", state: "完成", tint: "success", note: "家长反馈良好，任务执行率 85%" },
  { stage: "1 个月复评", date: "本周到期", state: "到期", tint: "warm", note: "BMI 变化 -0.3，睡眠改善" },
  { stage: "3 个月复评", date: "2025-06-18", state: "待触发", tint: "muted", note: "" },
  { stage: "6 个月复评", date: "2025-09-18", state: "待触发", tint: "muted", note: "" },
  { stage: "12 个月年度", date: "2026-03-18", state: "待触发", tint: "muted", note: "" },
];

function FollowUpPage() {
  return (
    <div>
      <StatusBar title="复评随访" />
      <div className="px-5 pb-8 pt-2">
        <h1 className="text-xl font-bold">复评随访</h1>
        <p className="mb-4 text-xs text-muted-foreground">李小雨 · 三年级 3班 · 阶段管理</p>

        <div className="mb-4 grid grid-cols-3 gap-2 rounded-2xl bg-surface p-3 shadow-sm ring-1 ring-border/60">
          {[
            { k: "BMI", v: "16.8", d: "↓ 0.3" },
            { k: "夜咳", v: "1 次/周", d: "↓" },
            { k: "运动", v: "58 分/日", d: "↑" },
          ].map((s) => (
            <div key={s.k} className="text-center">
              <p className="text-[11px] text-muted-foreground">{s.k}</p>
              <p className="text-lg font-extrabold text-deep">{s.v}</p>
              <p className="text-[10px] text-teal">{s.d}</p>
            </div>
          ))}
        </div>

        <ol className="relative space-y-4 border-l-2 border-border/60 pl-5">
          {timeline.map((t, i) => (
            <li key={i} className="relative">
              <span
                className={`absolute -left-[26px] top-1 h-3 w-3 rounded-full ring-2 ring-surface ${
                  t.tint === "success" ? "bg-success" : t.tint === "warm" ? "bg-warm" : "bg-muted"
                }`}
              />
              <div className="rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-border/60">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">{t.stage}</p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] ${
                      t.tint === "success"
                        ? "bg-success/15 text-success"
                        : t.tint === "warm"
                        ? "bg-warm/15 text-warm"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {t.state}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">{t.date}</p>
                {t.note && <p className="mt-2 text-xs">{t.note}</p>}
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link to="/doctor/plan" className="rounded-xl bg-surface-2 py-3 text-center text-sm">调整方案</Link>
          <ActionSheet
            trigger={
              <button className="rounded-xl bg-deep py-3 text-sm font-semibold text-deep-foreground">
                关闭阶段管理
              </button>
            }
            title="关闭本阶段管理？"
            description="关闭后本阶段任务将归档，如需继续管理可重新开启。"
            confirmText="确认关闭"
            toastMessage="已关闭阶段管理"
          />
        </div>
      </div>
    </div>
  );
}
