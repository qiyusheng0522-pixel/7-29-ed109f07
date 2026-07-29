import { createFileRoute, Link } from "@tanstack/react-router";
import { StatusBar } from "@/components/MobileFrame";

export const Route = createFileRoute("/doctor/messages")({
  component: MessagesPage,
});

const groups = [
  {
    title: "家长待回复",
    tint: "rose",
    items: [
      { t: "陈敏 家长（小阳）· 孩子夜间偶有咳嗽，是否需要复诊？", time: "已等 2h", to: "/doctor/comm" },
      { t: "王女士（王小豆）· 上传了 7 日饮食记录，请点评", time: "35 分钟前", to: "/doctor/comm" },
      { t: "李先生（李小雨）· 询问运动方案是否可换成游泳", time: "1 小时前", to: "/doctor/comm" },
    ],
  },
  {
    title: "报告审核提醒",
    tint: "warm",
    items: [
      { t: "阳光小学 · 12 条高危报告待人工二审", time: "今日 09:00", to: "/doctor/qc" },
      { t: "刘小强 · BMI 26.4 报告 AI 已初审，待签发", time: "10 分钟前", to: "/doctor/qc" },
    ],
  },
  {
    title: "方案确认提醒",
    tint: "deep",
    items: [
      { t: "小阳 · 12 周控重方案 v1 待审核（健管师已同步）", time: "40 分钟前", to: "/doctor/plan" },
      { t: "王小豆 · 肥胖/糖尿病风险方案 v0.3 待审核", time: "昨日 18:20", to: "/doctor/plan" },
      { t: "赵子墨 · 生长迟缓方案 v2 已通过，家长已查看", time: "昨日", to: "/doctor/plan" },
    ],
  },
  {
    title: "健管师协作",
    tint: "teal",
    items: [
      { t: "健管师升级 · 王小豆 建议转内分泌科门诊", time: "12 分钟前", to: "/doctor/referral" },
      { t: "健管师反馈 · 张小乐 已在变态反应科预约", time: "昨日", to: "/doctor/referral" },
    ],
  },
];


function MessagesPage() {
  return (
    <div>
      <StatusBar title="消息" />
      <div className="px-5 pb-8 pt-2">
        <h1 className="text-xl font-bold">医生消息</h1>
        <p className="mb-4 text-xs text-muted-foreground">按类型分组 · 点击直达处理</p>

        <div className="space-y-4">
          {groups.map((g) => (
            <section key={g.title}>
              <div className="mb-2 flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full bg-${g.tint}`} />
                <h2 className="text-sm font-semibold">{g.title}</h2>
                <span className="text-[11px] text-muted-foreground">· {g.items.length}</span>
              </div>
              <ul className="divide-y divide-border/60 overflow-hidden rounded-2xl bg-surface shadow-sm ring-1 ring-border/60">
                {g.items.map((it, i) => (
                  <li key={i}>
                    <Link to={it.to} className="flex items-center gap-3 px-4 py-3 active:bg-surface-2">
                      <span className="flex-1 text-sm">{it.t}</span>
                      <span className="text-[11px] text-muted-foreground">{it.time}</span>
                      <span className="text-muted-foreground">›</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
