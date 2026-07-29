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
import { EXAM_USERS } from "@/lib/exam-users";
export const Route = createFileRoute("/doctor/")({
  component: DoctorHome,
});

/** 待检学生 = 尚未完成体检（待检 + 进行中），与待检清单及录入队列口径一致。 */
const PENDING_EXAM_COUNT = EXAM_USERS.filter(
  (u) => u.status === "待检" || u.status === "进行中",
).length;

type Stat = {
  icon: import("react").ReactNode;
  iconBg: string;
  label: string;
  sub: string;
  value: number;
  unit: string;
  valueColor: string;
  to: "/doctor/referral" | "/doctor/qc" | "/doctor/messages" | "/doctor/plan" | "/doctor/exam" | "/doctor/comm";
  search?: Record<string, unknown>;
};

const stats: Stat[] = [
  {
    icon: <EIcon e="👶" />,
    iconBg: "bg-teal/15 text-teal",
    label: "待检学生",
    sub: "阳光小学 · 三年级 3 班",
    value: PENDING_EXAM_COUNT,
    unit: "人待检",
    valueColor: "text-teal",
    to: "/doctor/exam",
    search: { view: "queue" },
  },
  {
    icon: <EIcon e="🔍" />,
    iconBg: "bg-warm/15 text-warm",
    label: "报告审核",
    sub: "高危 3 条 · 需人工二审",
    value: 12,
    unit: "条待审",
    valueColor: "text-warm",
    to: "/doctor/qc",
  },
  {
    icon: <EIcon e="📋" />,
    iconBg: "bg-success/15 text-success",
    label: "方案确认",
    sub: "健管师已同步",
    value: 4,
    unit: "份待确认",
    valueColor: "text-success",
    to: "/doctor/plan",
  },
  {
    icon: <EIcon e="💬" />,
    iconBg: "bg-deep/15 text-deep",
    label: "待回复",
    sub: "家长 / 健管师消息",
    value: 5,
    unit: "条未读",
    valueColor: "text-deep",
    to: "/doctor/comm",
  },
];

type Todo = {
  id: string;
  name: string;
  tags: { text: string; cls: string }[];
  desc: string;
  to: "/doctor/qc" | "/doctor/plan" | "/doctor/messages" | "/doctor/comm" | "/doctor/prep" | "/doctor/exam";
  search?: Record<string, unknown>;
};

const todos: Todo[] = [
  {
    id: "E0",
    name: "待检学生",
    tags: [{ text: "待检学生", cls: "bg-teal/15 text-teal" }],
    desc: `阳光小学 · 三年级 3 班 · ${PENDING_EXAM_COUNT} 人待检 · 点击进入待检清单`,
    to: "/doctor/exam",
    search: { view: "queue" },
  },
  {
    id: "0423",
    name: "阳光小学",
    tags: [{ text: "报告审核", cls: "bg-warm/15 text-warm" }],
    desc: "校内录检 12 条数据 · 高危 3 条需医生二次审核",
    to: "/doctor/qc",
  },
  {
    id: "0315",
    name: "李小雨",
    tags: [{ text: "方案确认", cls: "bg-success/15 text-success" }],
    desc: "健康方案 v0.3 待确认 · 健管师已同步",
    to: "/doctor/plan",
  },
  {
    id: "0402",
    name: "陈敏 家长",
    tags: [{ text: "待回复", cls: "bg-deep/15 text-deep" }],
    desc: "咨询：孩子夜间咳嗽是否需要复诊 · 已等 2h",
    to: "/doctor/comm",
  },
  {
    id: "P1",
    name: "出诊前物资自查",
    tags: [{ text: "入校准备", cls: "bg-warm/15 text-warm" }],
    desc: "阳光小学 · 明日 08:30 · 证件 / 设备 / 耗材 / 数据工具",
    to: "/doctor/prep",
  },
  {
    id: "P2",
    name: "入校场地对接核对",
    tags: [{ text: "入校准备", cls: "bg-teal/15 text-teal" }],
    desc: "分区 / 隐私 / 供电 / 动线 / 排程 6 项现场核对",
    to: "/doctor/prep",
  },
  {
    id: "P3",
    name: "现场体检质控核对",
    tags: [{ text: "入校准备", cls: "bg-deep/15 text-deep" }],
    desc: "扫码核验 / 异常复测 / 数据同步 每批次循环自查",
    to: "/doctor/prep",
  },
  {
    id: "P4",
    name: "当日收尾 & 数据安全",
    tags: [{ text: "入校准备", cls: "bg-success/15 text-success" }],
    desc: "抽查 / 授权同步 / 加密上传 / 归档 6 项离场前必查",
    to: "/doctor/prep",
  },
];

function DoctorHome() {
  const totalTodo = stats.reduce((s, x) => s + x.value, 0);

  const filters: { key: string; label: string; match: (t: Todo) => boolean }[] = [
    { key: "all", label: "全部", match: () => true },
    { key: "exam", label: "待检学生", match: (t) => t.tags.some((x) => x.text === "待检学生") },
    { key: "qc", label: "报告审核", match: (t) => t.tags.some((x) => x.text === "报告审核") },
    { key: "plan", label: "方案确认", match: (t) => t.tags.some((x) => x.text === "方案确认") },
    { key: "reply", label: "待回复", match: (t) => t.tags.some((x) => x.text === "待回复") },
    { key: "prep", label: "入校准备", match: (t) => t.tags.some((x) => x.text === "入校准备") },
  ];
  const [active, setActive] = useState<string>("all");
  const filtered = todos.filter(filters.find((f) => f.key === active)!.match);


  return (
    <div className="pb-4">
      <StatusBar />

      <WorkbenchHeader
        title="工作台"
        accent="teal"
        notifyTo="/doctor/messages"
        avatar="陈"
        unread
      />

      <GreetingCard
        accent="teal"
        greeting={
          <>
            陈医生，早上好
            <EIcon e="👋" />
          </>
        }
        meta={`儿童保健科 · 今日 ${totalTodo} 项待处理`}
      />

      {/* 今日待办 stats */}
      <section className="px-5 pt-4">
        <SectionTitle accent="teal" right={<SectionCount accent="teal">共 {totalTodo} 项</SectionCount>}>
          今日待办
        </SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          {stats.map((s) => (
            <StatCard key={s.label} stat={s} />
          ))}
        </div>
      </section>

      {/* 今日待办清单 */}
      <section className="px-5 pt-5">
        <SectionTitle
          accent="teal"
          right={
            <span className="shrink-0 text-[11px] text-muted-foreground">
              共 {filtered.length}/{todos.length} 项
            </span>
          }
        >
          今日待办清单
        </SectionTitle>

        <FilterChips
          accent="teal"
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
              search={t.search}
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
