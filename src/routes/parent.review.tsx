import { createFileRoute, Link } from "@tanstack/react-router";
import { StatusBar } from "@/components/MobileFrame";
import { ActionSheet } from "@/components/ActionSheet";

import { EIcon } from "@/components/EIcon";
export const Route = createFileRoute("/parent/review")({
  component: ReviewPage,
});

const timeline = [
  {
    key: "7 天随访",
    date: "2026-04-22",
    status: "已完成",
    goal: "是否看懂报告、是否开始家庭任务",
    highlight: "已完成 · 家长反馈：任务清晰",
  },
  {
    key: "1 月复评",
    date: "2026-05-15",
    status: "进行中",
    goal: "看家庭任务执行率",
    highlight: "本周待填写问卷（3 题）",
  },
  {
    key: "3 月复评",
    date: "2026-07-15",
    status: "待开始",
    goal: "看 BMI / 呼吸症状 / 睡眠指标变化",
  },
  {
    key: "6 月复评",
    date: "2026-10-15",
    status: "待开始",
    goal: "看整体风险等级是否下降",
  },
  {
    key: "12 月年度报告",
    date: "2027-04-15",
    status: "待开始",
    goal: "全年健康变化总结",
  },
];

function ReviewPage() {
  return (
    <div>
      <StatusBar title="复评随访" />
      <div className="px-5 pb-8 pt-2">
        <header className="mb-4">
          <h1 className="text-xl font-bold">小雨的复评时间线</h1>
          <p className="text-xs text-muted-foreground">每次复评都是一次小小的鼓励 · 看变化，不比较</p>
        </header>

        <div className="mb-4 rounded-3xl bg-gradient-to-br from-teal/25 to-warm/15 p-4 ring-1 ring-teal/20">
          <p className="text-xs text-muted-foreground">下一次复评</p>
          <p className="mt-1 text-lg font-bold">1 月复评 · 5 月 15 日</p>
          <p className="mt-1 text-xs text-foreground/80">本周会推送 3 题问卷，1 分钟即可完成 {<EIcon e="✍️" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />}</p>
          <ActionSheet
            trigger={
              <button className="mt-3 rounded-full bg-warm px-4 py-1.5 text-xs font-medium text-warm-foreground">
                提前填写
              </button>
            }
            title="1 月复评问卷（3 题）"
            description="根据孩子近一个月的情况如实填写，医生将据此调整方案。"
            confirmText="提交问卷"
            toastMessage="问卷已提交"
            toastDescription="感谢反馈，医生将在复评时参考"
          >
            <div className="space-y-3 text-xs">
              {[
                "家庭饮食/运动任务的执行情况如何？",
                "孩子近一个月夜间咳嗽/睡眠是否改善？",
                "体重变化是否符合预期？",
              ].map((q, i) => (
                <div key={i}>
                  <p className="mb-1 font-medium text-foreground">{i + 1}. {q}</p>
                  <div className="flex gap-2">
                    {["较好", "一般", "欠佳"].map((o) => (
                      <label key={o} className="flex-1">
                        <input type="radio" name={`q${i}`} className="peer hidden" defaultChecked={o === "一般"} />
                        <span className="block rounded-lg bg-surface-2 py-1.5 text-center peer-checked:bg-warm peer-checked:text-warm-foreground">{o}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ActionSheet>
        </div>

        <ol className="relative space-y-4 border-l-2 border-dashed border-teal/40 pl-5">
          {timeline.map((t, i) => (
            <li key={t.key} className="relative">
              <span
                className={`absolute -left-[26px] top-1 grid h-5 w-5 place-items-center rounded-full text-[10px] ring-2 ring-surface ${
                  t.status === "已完成"
                    ? "bg-success text-success-foreground"
                    : t.status === "进行中"
                    ? "bg-warm text-warm-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {i + 1}
              </span>
              <div className="rounded-2xl bg-surface p-3 shadow-sm ring-1 ring-border/60">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">{t.key}</p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] ${
                      t.status === "已完成"
                        ? "bg-success/15 text-success"
                        : t.status === "进行中"
                        ? "bg-warm/15 text-warm"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {t.status}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">{t.date} · {t.goal}</p>
                {t.highlight && (
                  <p className="mt-2 rounded-lg bg-surface-2 px-2 py-1.5 text-[11px] text-foreground/80">
                    {t.highlight}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>

        <Link
          to="/parent/comm"
          className="mt-5 flex items-center justify-between rounded-2xl bg-gradient-to-r from-warm/15 to-teal/10 p-4 ring-1 ring-warm/20"
        >
          <div>
            <p className="text-sm font-semibold">看不懂复评结果？</p>
            <p className="text-[11px] text-muted-foreground">找健康管理师解读，1 对 1 回复</p>
          </div>
          <span className="rounded-full bg-warm px-3 py-1.5 text-xs text-warm-foreground">去咨询</span>
        </Link>
      </div>
    </div>
  );
}
