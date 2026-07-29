import { createFileRoute } from "@tanstack/react-router";
import { StatusBar } from "@/components/MobileFrame";
import { ActionSheet } from "@/components/ActionSheet";
import { toast } from "sonner";

import { EIcon } from "@/components/EIcon";
export const Route = createFileRoute("/community/edu")({
  component: EduPage,
});

const campaigns = [
  {
    title: "春季过敏原防护指南",
    audience: "过敏体质儿童家长（38 人）",
    status: "待推送",
    date: "今日 18:00",
    tint: "rose",
  },
  {
    title: "儿童体重管理 · 家庭餐桌 10 例",
    audience: "服务包·体重管理（22 人）",
    status: "已推送",
    date: "昨日 09:00 · 阅读率 74%",
    tint: "warm",
  },
  {
    title: "哮喘儿童雾化操作视频",
    audience: "哮喘管理人群（11 人）",
    status: "已推送",
    date: "3 天前 · 阅读率 91%",
    tint: "teal",
  },
  {
    title: "近视防控 · 20-20-20 用眼法",
    audience: "近视防控包（14 人）",
    status: "草稿",
    date: "预计本周五",
    tint: "deep",
  },
];

const templates = [
  { icon: <EIcon e="🥗" />, label: "营养饮食" },
  { icon: <EIcon e="🏃" />, label: "运动方案" },
  { icon: <EIcon e="😴" />, label: "睡眠作息" },
  { icon: <EIcon e="🌸" />, label: "过敏防护" },
  { icon: <EIcon e="👁️" />, label: "近视防控" },
  { icon: <EIcon e="🫁" />, label: "呼吸道疾病" },
];

function EduPage() {
  return (
    <div>
      <StatusBar title="健康宣教" />
      <div className="px-5 pb-8 pt-2">
        <h1 className="text-xl font-bold">健康宣教</h1>
        <p className="mb-3 text-xs text-muted-foreground">
          按人群精准推送 · 已覆盖 118 户家庭
        </p>

        <div className="mb-4 rounded-2xl bg-gradient-to-r from-rose/20 to-warm/15 p-4 ring-1 ring-rose/25">
          <p className="text-[11px] text-muted-foreground">本月宣教目标</p>
          <p className="mt-0.5 text-lg font-bold">4 篇 · 已完成 2 篇</p>
          <ActionSheet
            trigger={
              <button className="mt-2 rounded-full bg-rose px-4 py-1.5 text-xs font-medium text-rose-foreground">
                + 新建宣教
              </button>
            }
            title="新建宣教推送"
            description="选择推送人群与主题，发布后按人群精准触达家长。"
            confirmText="发布推送"
            toastMessage="宣教已发布"
            toastDescription="将按人群精准推送给目标家庭"
          >
            <div className="space-y-2 text-xs">
              <label className="block">
                <span className="text-muted-foreground">标题</span>
                <input placeholder="如：儿童近视防控 5 个要点" className="mt-1 w-full rounded-xl bg-surface-2 px-3 py-2 outline-none" />
              </label>
              <label className="block">
                <span className="text-muted-foreground">推送人群</span>
                <select className="mt-1 w-full rounded-xl bg-surface-2 px-3 py-2 outline-none">
                  <option>全部在管家庭</option><option>近视防控人群</option><option>体重管理人群</option><option>呼吸道随访人群</option>
                </select>
              </label>
            </div>
          </ActionSheet>
        </div>

        <h2 className="mb-2 text-sm font-semibold">快速模板</h2>
        <div className="mb-4 grid grid-cols-3 gap-2">
          {templates.map((t) => (
            <button
              key={t.label}
              onClick={() => toast(`已载入「${t.label}」模板`, { description: "可编辑后一键推送" })}
              className="rounded-2xl bg-surface p-3 text-center shadow-sm ring-1 ring-border/60"
            >
              <p className="text-xl">{t.icon}</p>
              <p className="mt-0.5 text-[11px]">{t.label}</p>
            </button>
          ))}
        </div>

        <h2 className="mb-2 text-sm font-semibold">最近推送</h2>
        <ul className="space-y-2">
          {campaigns.map((c) => (
            <li
              key={c.title}
              className="rounded-2xl bg-surface p-3 shadow-sm ring-1 ring-border/60"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">{c.title}</p>
                <span
                  className={`rounded-full bg-${c.tint}/15 px-2 py-0.5 text-[10px] text-${c.tint}`}
                >
                  {c.status}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                 {c.audience}
              </p>
              <p className="text-[11px] text-muted-foreground">{<EIcon e="🕒" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />} {c.date}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
