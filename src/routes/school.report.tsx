import { createFileRoute, Link } from "@tanstack/react-router";
import { StatusBar } from "@/components/MobileFrame";
import { ActionSheet } from "@/components/ActionSheet";

export const Route = createFileRoute("/school/report")({
  component: ReportCenter,
});

const stats = [
  { k: "报告生成", v: "446 / 486", pct: 91 },
  { k: "已发布", v: "446", pct: 100 },
  { k: "家长已读", v: "357 / 446", pct: 80 },
];

const trends = [
  { k: "体重管理需关注", v: 42, delta: "-6", tint: "warm" },
  { k: "呼吸/运动需关注", v: 18, delta: "-3", tint: "teal" },
  { k: "睡眠作息需关注", v: 27, delta: "+2", tint: "deep" },
  { k: "过敏风险需校医关注", v: 9, delta: "0", tint: "warning" },
];

const cooperate = [
  "5年1班 3 名学生体育活动需减量观察",
  "2年2班 2 名学生餐食清淡（校医已告知食堂）",
  "1年1班 家长需再次通知授权（4 位未回）",
];

function ReportCenter() {
  return (
    <div>
      <StatusBar title="报告中心" />
      <div className="px-5 pt-2">
        <div className="mb-1 flex items-center gap-2">
          <Link to="/school" className="text-lg text-muted-foreground">‹</Link>
          <h1 className="text-xl font-bold">报告中心</h1>
        </div>
        <p className="mb-4 text-xs text-muted-foreground">学校侧只看趋势与配合事项，不看医学诊断</p>

        {/* 生成/发布/已读 */}
        <div className="mb-4 space-y-2">
          {stats.map((s) => (
            <div key={s.k} className="rounded-2xl bg-surface p-3 shadow-sm ring-1 ring-border/60">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{s.k}</p>
                <p className="text-sm font-bold">{s.v}</p>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-2">
                <div className="h-full rounded-full bg-teal" style={{ width: `${s.pct}%` }} />
              </div>
            </div>
          ))}
        </div>

        <ActionSheet
          trigger={
            <button className="mb-5 w-full rounded-xl bg-warm py-2.5 text-xs font-medium text-warm-foreground">
              一键提醒 89 位未读家长
            </button>
          }
          title="提醒 89 位未读家长？"
          description="将向尚未查看体检报告的家长推送微信 + 短信提醒。"
          confirmText="确认提醒"
          toastMessage="已提醒 89 位未读家长"
          toastDescription="预计 5 分钟内送达"
        />

        {/* 学校趋势 */}
        <h2 className="mb-2 text-sm font-semibold">学校报告摘要</h2>
        <div className="mb-4 grid grid-cols-2 gap-2">
          {trends.map((t) => (
            <div key={t.k} className={`rounded-2xl bg-${t.tint}/10 p-3 ring-1 ring-${t.tint}/20`}>
              <p className="text-[11px] text-muted-foreground">{t.k}</p>
              <div className="mt-1 flex items-baseline gap-2">
                <p className={`text-xl font-extrabold text-${t.tint}`}>{t.v}</p>
                <span className={`text-[11px] ${t.delta.startsWith("+") ? "text-danger" : t.delta === "0" ? "text-muted-foreground" : "text-success"}`}>
                  {t.delta}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground">较上学期</p>
            </div>
          ))}
        </div>

        {/* 学校配合事项 */}
        <h2 className="mb-2 text-sm font-semibold">需学校配合事项</h2>
        <ul className="mb-6 space-y-2">
          {cooperate.map((c) => (
            <li key={c} className="flex items-start gap-3 rounded-2xl bg-surface p-3 shadow-sm ring-1 ring-border/60">
              <span className="mt-0.5 text-teal">•</span>
              <p className="flex-1 text-sm">{c}</p>
              <Link to="/school/intasks" className="shrink-0 text-[11px] text-teal">
                去任务 →
              </Link>
            </li>
          ))}
        </ul>

        <Link to="/school/focus" className="mb-6 block rounded-2xl bg-gradient-to-br from-teal/15 to-deep/15 p-4 ring-1 ring-teal/20">
          <p className="text-sm font-semibold">需关注学生摘要</p>
          <p className="mt-1 text-[11px] text-muted-foreground">只显示学校侧必要信息 · 不含医学诊断</p>
        </Link>
      </div>
    </div>
  );
}
