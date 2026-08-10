import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { StatusBar } from "@/components/MobileFrame";
import {
  FilterChips,
  GreetingCard,
  SectionCount,
  SectionTitle,
  StatCard,
  TodoRow,
  WorkbenchHeader,
} from "@/components/Workbench";

import { EIcon } from "@/components/EIcon";
export const Route = createFileRoute("/community/")({
  component: CommunityHome,
});

type Stat = {
  icon: import("react").ReactNode;
  iconBg: string;
  label: string;
  sub: string;
  value: number;
  unit: string;
  valueColor: string;
  to: "/community/patients" | "/community/edu" | "/community/consult" | "/community/risk";
};

const stats: Stat[] = [
  {
    icon: <EIcon e="📦" />,
    iconBg: "bg-warm/15 text-warm",
    label: "在管患者",
    sub: "商城购买 · 社区承接随访",
    value: 46,
    unit: "人在管",
    valueColor: "text-warm",
    to: "/community/patients",
  },
  {
    icon: <EIcon e="🚨" />,
    iconBg: "bg-rose/15 text-rose",
    label: "患儿上传",
    sub: "高风险指标 · 可推送儿童医院",
    value: 3,
    unit: "人高风险",
    valueColor: "text-rose",
    to: "/community/risk",
  },

  {
    icon: <EIcon e="📢" />,
    iconBg: "bg-rose/15 text-rose",
    label: "今日宣教",
    sub: "过敏体质家长精准推送",
    value: 3,
    unit: "条待推",
    valueColor: "text-rose",
    to: "/community/edu",
  },
  {
    icon: <EIcon e="💬" />,
    iconBg: "bg-deep/15 text-deep",
    label: "待回复咨询",
    sub: "承诺 24h 内回复",
    value: 5,
    unit: "条未读",
    valueColor: "text-deep",
    to: "/community/consult",
  },
];

type Todo = {
  id: string;
  name: string;
  tags: { text: string; cls: string }[];
  desc: string;
  to: "/community/patients" | "/community/edu" | "/community/consult";
};

const todos: Todo[] = [
  {
    id: "S01",
    name: "刘小强 · 体重管理季度包",
    tags: [{ text: "服务包", cls: "bg-warm/15 text-warm" }],
    desc: "第 3 周随访 · 上传体重曲线 + 饮食反馈 · 今日 17:00 前",
    to: "/community/patients",
  },
  {
    id: "R01",
    name: "陈小美 · 哮喘复诊后转社区",
    tags: [{ text: "转社区", cls: "bg-teal/15 text-teal" }],
    desc: "医院方案：吸入激素维持 · 48h 内建立家庭档案并安排 2 周随访",
    to: "/community/patients",
  },
  {
    id: "S02",
    name: "王小美 · 近视防控半年包",
    tags: [{ text: "服务包", cls: "bg-warm/15 text-warm" }],
    desc: "本月屈光复查提醒 · 预约社区视力筛查台 · 本周内",
    to: "/community/patients",
  },
  {
    id: "R02",
    name: "张小乐 · 过敏性鼻炎季节维持",
    tags: [{ text: "转社区", cls: "bg-teal/15 text-teal" }],
    desc: "用药依从率仅 48% · 需家长强化沟通 · 04-20 电话随访",
    to: "/community/patients",
  },
  {
    id: "E01",
    name: "春季过敏原防护",
    tags: [{ text: "宣教", cls: "bg-rose/15 text-rose" }],
    desc: "面向已建档过敏体质儿童家长（38 户）· 今日 18:00 推送",
    to: "/community/edu",
  },
  {
    id: "E02",
    name: "近视防控 · 20-20-20 用眼法",
    tags: [{ text: "宣教", cls: "bg-rose/15 text-rose" }],
    desc: "近视防控包家长（14 户）· 草稿待审 · 本周五推送",
    to: "/community/edu",
  },
  {
    id: "C01",
    name: "刘小强家长 · 咨询回复",
    tags: [{ text: "咨询", cls: "bg-deep/15 text-deep" }],
    desc: "孩子跳绳后膝盖酸，是否运动量太大？已等 12 分钟",
    to: "/community/consult",
  },
  {
    id: "C02",
    name: "陈小美家长 · 咨询回复",
    tags: [{ text: "咨询", cls: "bg-deep/15 text-deep" }],
    desc: "夜间咳嗽 2 次，是否临时加用支气管扩张剂？已等 1h",
    to: "/community/consult",
  },
];

function CommunityHome() {
  const totalTodo = stats.reduce((s, x) => s + x.value, 0);

  const filters: { key: string; label: string; match: (t: Todo) => boolean }[] = [
    { key: "all", label: "全部", match: () => true },
    { key: "svc", label: "服务包", match: (t) => t.tags.some((x) => x.text === "服务包") },
    { key: "ref", label: "转社区", match: (t) => t.tags.some((x) => x.text === "转社区") },
    { key: "edu", label: "宣教", match: (t) => t.tags.some((x) => x.text === "宣教") },
    { key: "consult", label: "咨询", match: (t) => t.tags.some((x) => x.text === "咨询") },
  ];
  const [active, setActive] = useState<string>("all");
  const filtered = todos.filter(filters.find((f) => f.key === active)!.match);

  return (
    <div className="pb-4">
      <StatusBar />

      <WorkbenchHeader
        title="工作台"
        accent="warm"
        notifyTo="/community/consult"
        avatar="张"
        unread
      />

      <GreetingCard
        accent="warm"
        greeting={
          <>
            张医生，早上好
            <EIcon e="👋" />
          </>
        }
        meta={`阳光社区 · 儿童健康管理站 · 今日 ${totalTodo} 项待处理`}
      />

      {/* stats */}
      <section className="px-5 pt-4">
        <SectionTitle accent="warm" right={<SectionCount accent="warm">共 {totalTodo} 项</SectionCount>}>
          今日待办
        </SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          {stats.map((s) => (
            <StatCard key={s.label} stat={s} />
          ))}
        </div>
      </section>

      {/* 待办清单 */}
      <section className="px-5 pt-5">
        <SectionTitle
          accent="warm"
          right={
            <span className="shrink-0 text-[11px] text-muted-foreground">
              共 {filtered.length}/{todos.length} 项
            </span>
          }
        >
          今日待办清单
        </SectionTitle>

        <FilterChips
          accent="warm"
          filters={filters}
          active={active}
          onChange={setActive}
          countOf={(f) => (f.key === "all" ? todos.length : todos.filter(f.match).length)}
        />

        <ul className="space-y-2.5">
          {filtered.map((t, i) => (
            <TodoRow
              key={t.id}
              index={i + 1}
              to={t.to}
              tags={t.tags}
              title={`${t.id} ${t.name}`}
              desc={t.desc}
            />
          ))}
        </ul>
      </section>
    </div>
  );
}
