import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { child } from "@/lib/mock-data";
import { StatusBar } from "@/components/MobileFrame";

import { EIcon } from "@/components/EIcon";
const aiExtra = [
  { title: "亲子平板支撑挑战", level: "入门", kcal: 60, tag: "AI推荐", reason: "针对核心力量与体态改善，适合 BMI 偏高儿童" },
  { title: "楼梯间隔训练 10 分钟", level: "进阶", kcal: 90, tag: "AI推荐", reason: "利用居家场景提升心肺，无需器材" },
  { title: "睡前拉伸 8 式", level: "入门", kcal: 30, tag: "AI推荐", reason: "缓解运动后肌肉紧张，提高睡眠质量" },
];
const nearby = [
  { title: "周六晨跑 · 玄武湖公园", host: "多多妈 · 阳光小学三(3)班", when: "周六 07:00", joined: 6, cap: 12, dist: "1.2km" },
  { title: "亲子跳绳 PK", host: "乐乐爸 · 阳光小学三(2)班", when: "周日 16:00 社区广场", joined: 4, cap: 8, dist: "0.6km" },
  { title: "羽毛球陪练", host: "小雨妈 · 阳光小学三(3)班", when: "周五 18:30 体育馆", joined: 2, cap: 4, dist: "2.1km" },
];

export const Route = createFileRoute("/parent/health-plan")({
  validateSearch: (s: Record<string, unknown>): { from?: string } => ({
    from: typeof s.from === "string" && s.from.trim() ? s.from.trim() : undefined,
  }),
  component: HealthPlanPage,
});

const days = ["06/11", "06/12", "06/13", "06/14", "06/15"];

type PlanCycle = {
  weeks: 3 | 5 | 7;
  name: string;
  intensity: string;
  bmi: string;
  lose: string;
  weekly: number;
  review: string;
  improve: number;
  hint: string;
};

const cycles: PlanCycle[] = [
  { weeks: 3, name: "快速起步", intensity: "强度较高", bmi: "16.8", lose: "1.0", weekly: 5, review: "07/02", improve: 55, hint: "想尽快看到变化，任务较密集，需家长多陪伴" },
  { weeks: 5, name: "稳步推荐", intensity: "中等强度", bmi: "16.5", lose: "1.5", weekly: 4, review: "07/16", improve: 72, hint: "医生推荐节奏，效果与可坚持性兼顾" },
  { weeks: 7, name: "温和长效", intensity: "温和渐进", bmi: "16.2", lose: "2.0", weekly: 3, review: "07/30", improve: 85, hint: "以习惯养成为主，不易反弹，孩子压力最小" },
];

const meals = [
  {
    name: "早餐",
    kcal: 430,
    reason: "早餐提供全天 25–30% 能量，粗细搭配 + 优质蛋白可稳定上午血糖、改善注意力",
    source: "《中国学龄儿童膳食指南 (2022)》· 中国营养学会",
    groups: [
      { title: "粗细搭配主食", amount: "50–75 克(生重)", tips: "粗粮占 1/3 以上", tags: ["燕麦片", "玉米面", "全麦面包", "杂粮馒头"] },
      { title: "优质蛋白", amount: "1 份", tags: ["鸡蛋 1 个", "牛奶 250ml", "无糖豆浆 300ml"] },
      { title: "蔬菜或低糖水果", amount: "100–150 克", tags: ["黄瓜", "番茄", "蓝莓", "苹果"] },
    ],
  },
  {
    name: "午餐",
    kcal: 560,
    reason: "午餐承担全天最高供能，蛋白质与蔬菜比重提升有助于控重",
    source: "WHO《School-age children and adolescents nutrition guidance (2023)》",
  },
  {
    name: "晚餐",
    kcal: 440,
    reason: "晚餐能量适度下调、餐后 2 小时不进食，可减少肥胖与胰岛素抵抗风险",
    source: "《中国儿童青少年零食指南 (2018)》· 国家卫生健康委",
  },
];

const exercises = [
  {
    tag: "亲子共练",
    status: "已完成",
    title: "餐后控糖快走",
    level: "入门",
    tags: ["#体重管理", "#餐后代谢", "#亲子运动"],
    time: "午餐后 13:00",
    hr: "8–10 分钟",
    coach: "社区健身指导员 · 06:00",
    reason: "餐后 30 分钟中低强度活动可降低餐后血糖峰值约 12–17%，是学龄儿童控重的有效方式",
    source: "《中国儿童青少年身体活动指南 (2018)》· 国家卫健委疾控局",
  },
  {
    tag: "通用教学",
    status: "待打卡",
    title: "跳绳燃脂 20 分钟",
    level: "进阶",
    tags: ["#减脂", "#心肺提升"],
    time: "傍晚 17:30",
    hr: "心率 130–150",
    coach: "国家二级运动员 · 08:20",
    reason: "跳绳属于负重冲击运动，可同步促进骨密度增长与心肺耐力，每次≥15 分钟效果显著",
    source: "WHO《Physical activity for children and adolescents (2020)》· 每日 60min MVPA",
  },
];

function HealthPlanPage() {
  const { from } = Route.useSearch();
  // 从体检报告页进入时，这是首页 Tab 根路由，默认不显示返回箭头，需强制显示以便返回报告页
  const backToReport = from === "report" ? true : undefined;
  const [checked, setChecked] = useState<Record<string, boolean>>(() => ({ [exercises[0].title]: true }));
  const [sheet, setSheet] = useState<null | "more" | "publish">(null);
  const [tab, setTab] = useState<"ai" | "custom" | "nearby">("ai");
  const [joined, setJoined] = useState<Record<string, boolean>>({});
  const [customTitle, setCustomTitle] = useState("");
  const [dayIdx, setDayIdx] = useState(0);
  const [cycleWeeks, setCycleWeeks] = useState<3 | 5 | 7 | null>(null);
  const [cycleConfirmed, setCycleConfirmed] = useState(false);
  const cycle = cycleWeeks ? cycles.find((c) => c.weeks === cycleWeeks)! : null;
  const toggle = (t: string) => setChecked((s) => ({ ...s, [t]: !s[t] }));
  const doneCount = Object.values(checked).filter(Boolean).length;
  const total = exercises.length;
  const pct = Math.round((doneCount / total) * 100);

  const hasReport =
    typeof window === "undefined"
      ? true
      : window.localStorage.getItem("parent_view_hasreport_v1") !== "0";

  if (!hasReport) {
    return (
      <div className="bg-surface-2">
        <StatusBar title="健康管理方案" back={backToReport} />
        <div className="flex flex-col items-center px-6 pb-16 pt-10 text-center">
          <div className="grid h-24 w-24 place-items-center rounded-full bg-warm/15 text-4xl">
            {<EIcon e="🗓️" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />}
          </div>
          <h1 className="mt-4 text-lg font-bold">还没有健康方案</h1>
          <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
            健康方案会基于 {child.name} 的入学体检报告，由儿童医院医生 + AI 营养师联合生成。
            当前还未完成体检，请先按检前须知完成授权与问卷。
          </p>

          <div className="mt-5 w-full space-y-2 text-left">
            <div className="rounded-2xl bg-surface p-3 ring-1 ring-border/60">
              <p className="text-[12px] font-semibold">检前 3 步 · 已完成 1/3</p>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
                <div className="h-full w-1/3 rounded-full bg-warm" />
              </div>
              <ul className="mt-2 space-y-1 text-[11px] text-muted-foreground">
                <li>{<EIcon e="✓" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />} 数据使用授权 · 已签署</li>
                <li className="text-danger">! 健康问卷 · 哮喘风险筛查（4-13 截止）</li>
                <li className="text-danger">! 体检知情同意书 · 待签署（4-13 截止）</li>
              </ul>
            </div>
            <div className="rounded-2xl bg-warning/10 p-3 text-[11px] leading-relaxed text-warning-foreground ring-1 ring-warning/25">
              {<EIcon e="💡" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />} 体检当日数据回收后 <b>48h 内</b>会自动生成个性化方案，涵盖饮食、运动、居家护理与随��提醒。
            </div>
          </div>

          <div className="mt-5 grid w-full grid-cols-2 gap-2">
            <Link
              to="/parent/notice"
              className="rounded-full bg-warm px-4 py-2.5 text-[13px] font-semibold text-warm-foreground"
            >
              去完成检前须知
            </Link>
            <Link
              to="/parent/comm"
              className="rounded-full bg-surface px-4 py-2.5 text-[13px] font-medium text-foreground ring-1 ring-border"
            >
              先咨询 AI 顾问
            </Link>
          </div>

          <Link
            to="/parent"
            className="mt-4 text-[11px] text-muted-foreground underline"
          >
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-2">
      <StatusBar title="健康管理方案" back={backToReport} />
      <div className="px-4 pb-28 pt-2">
        <header className="mb-3 px-1">
          <h1 className="text-xl font-bold">{child.name} 的健康方案</h1>
          <p className="text-xs text-muted-foreground">
            基于本次体检报告 · 医生 + AI 营养师联合生成
          </p>
        </header>

        {/* 报告详细解读 */}
        <section className="mb-4 rounded-3xl bg-surface p-4 shadow-sm ring-1 ring-border/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-4 w-1 rounded-full bg-warm" />
              <h2 className="text-sm font-bold">报告详细解读</h2>
            </div>
            <span className="rounded-full bg-warm/10 px-2 py-0.5 text-[10px] text-warm">AI 医师</span>
          </div>

          <div className="mt-3 rounded-2xl bg-gradient-to-br from-warning/15 to-warm/10 p-3 ring-1 ring-warning/20">
            <p className="text-[11px] font-semibold text-warning-foreground">{<EIcon e="🟡" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />} 整体评估</p>
            <p className="mt-1 text-[12px] leading-relaxed text-foreground/85">
              {child.name}本次体检整体发育良好，身高处于 P75，各项内科与视力指标正常。
              主要异常集中在 <b>体重/BMI 偏高</b> 及 <b>尘螨过敏合并运动后咳嗽</b> 两方面，
              属于需干预的中高风险，若长期忽视可能发展为儿童肥胖症或运动诱发性哮喘。
            </p>
          </div>

          <ul className="mt-3 space-y-2">
            {[
              {
                dot: "bg-danger",
                title: "① 肥胖倾向（BMI 17.1 · P85）",
                desc: "近半年体重增长 5kg 而身高仅增长 3cm，呈体重追赶型。需在 12 周内通过饮食+运动干预将 BMI 降至 16.5 以下。",
              },
              {
                dot: "bg-warning",
                title: "② 过敏性哮喘倾向",
                desc: "尘螨 IgE (++) 阳性合并运动后偶发咳嗽，肺功能虽正常但存在气道高反应可能，需家庭除螨 + 呼吸科评估。",
              },
              {
                dot: "bg-success",
                title: "③ 其他项目",
                desc: "视力 5.0、口腔无龋、血压心率均在正常范围，继续保持现有作息与用眼习惯。",
              },
            ].map((r) => (
              <li key={r.title} className="rounded-2xl bg-surface-2 p-3">
                <div className="flex items-start gap-2">
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${r.dot}`} />
                  <div>
                    <p className="text-[13px] font-semibold">{r.title}</p>
                    <p className="mt-1 text-[11px] leading-relaxed text-foreground/80">{r.desc}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* 选择干预周期 - 让家长参与决策 */}
        <section className="mb-4 rounded-3xl bg-surface p-4 shadow-sm ring-1 ring-border/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-4 w-1 rounded-full bg-teal" />
              <h2 className="text-sm font-bold">选择干预周期</h2>
            </div>
            <span className="rounded-full bg-teal/10 px-2 py-0.5 text-[10px] text-teal">你来决定节奏</span>
          </div>
          <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
            针对 <b className="text-foreground">体重/BMI 偏高</b> 的核心目标，选择适合 {child.name} 与家庭的干预节奏，方案强度与目标会自动调整。
          </p>

          {/* 周期选择器 */}
          <div className="mt-3 grid grid-cols-3 gap-2">
            {cycles.map((c) => {
              const active = c.weeks === cycleWeeks;
              return (
                <button
                  key={c.weeks}
                  onClick={() => {
                    setCycleWeeks(c.weeks);
                    setCycleConfirmed(false);
                  }}
                  className={`relative rounded-2xl p-3 text-center transition ${
                    active
                      ? "bg-teal text-teal-foreground shadow-sm ring-2 ring-teal"
                      : "bg-surface-2 text-foreground ring-1 ring-border/60"
                  }`}
                >
                  {c.weeks === 5 && (
                    <span className={`absolute -top-2 left-1/2 -translate-x-1/2 rounded-full px-1.5 py-0.5 text-[8px] font-bold ${active ? "bg-warm text-warm-foreground" : "bg-warm/20 text-warm"}`}>
                      推荐
                    </span>
                  )}
                  <p className="text-lg font-bold leading-none">{c.weeks}<span className="text-[11px] font-medium"> 周</span></p>
                  <p className={`mt-1 text-[10px] ${active ? "text-teal-foreground/85" : "text-muted-foreground"}`}>{c.name}</p>
                </button>
              );
            })}
          </div>

          {/* 动态目标面板 · 选择周期后出现 */}
          {cycle ? (
            <div className="mt-3 rounded-2xl bg-gradient-to-br from-teal/10 to-warm/8 p-3 ring-1 ring-teal/20">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold text-teal">{cycle.weeks} 周 · {cycle.name}</p>
                <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] text-muted-foreground ring-1 ring-border/60">{cycle.intensity}</span>
              </div>
              <div className="mt-2.5 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-surface p-2">
                  <p className="text-sm font-bold text-foreground">{cycle.bmi}</p>
                  <p className="mt-0.5 text-[9px] text-muted-foreground">目标 BMI</p>
                </div>
                <div className="rounded-xl bg-surface p-2">
                  <p className="text-sm font-bold text-warm">-{cycle.lose}<span className="text-[10px]">kg</span></p>
                  <p className="mt-0.5 text-[9px] text-muted-foreground">预计减重</p>
                </div>
                <div className="rounded-xl bg-surface p-2">
                  <p className="text-sm font-bold text-foreground">{cycle.weekly}<span className="text-[10px]"> 项</span></p>
                  <p className="mt-0.5 text-[9px] text-muted-foreground">每周任务</p>
                </div>
              </div>

              {/* 风险改善预测 */}
              <div className="mt-2.5">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-muted-foreground">风险改善预测</span>
                  <span className="font-semibold text-teal">{cycle.improve}%</span>
                </div>
                <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-surface-2">
                  <div className="h-full rounded-full bg-gradient-to-r from-warm to-teal transition-all duration-500" style={{ width: `${cycle.improve}%` }} />
                </div>
              </div>

              <p className="mt-2 flex items-start gap-1 text-[10px] leading-relaxed text-foreground/70">
                <span>{<EIcon e="💡" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />}</span>
                <span>{cycle.hint}，预计 <b className="text-foreground">{cycle.review}</b> 安排复查评估。</span>
              </p>
            </div>
          ) : (
            <div className="mt-3 flex items-center gap-2 rounded-2xl border border-dashed border-teal/40 bg-surface-2 p-3.5 text-left">
              <span className="text-base">{<EIcon e="👆" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />}</span>
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                请先在上方选择 <b className="text-foreground">3 / 5 / 7 周</b> 干预周期，即可查看目标 BMI、预计减重与风险改善预测，并生成饮食·运动·护理方案。
              </p>
            </div>
          )}

          {cycle && (
          <button
            onClick={() => {
              setCycleConfirmed(true);
              toast.success(`已按 ${cycle.weeks} 周方案生成`, { description: `目标 BMI ${cycle.bmi} · 每周 ${cycle.weekly} 项任务 · ${cycle.review} 复查` });
            }}
            className={`mt-3 w-full rounded-full py-2.5 text-[13px] font-semibold transition ${
              cycleConfirmed
                ? "bg-success/15 text-success ring-1 ring-success/30"
                : "bg-teal text-teal-foreground shadow-sm"
            }`}
          >
            {cycleConfirmed ? `已采用 ${cycle.weeks} 周方案 ✓` : `按 ${cycle.weeks} 周周期生成方案`}
          </button>
          )}
        </section>

        {!cycleConfirmed ? (
          <div className="mb-4 flex flex-col items-center rounded-3xl border border-dashed border-border bg-surface px-6 py-10 text-center shadow-sm">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-surface-2 text-3xl">
              {<EIcon e="🔒" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />}
            </div>
            <p className="mt-3 text-[14px] font-bold">方案待生成</p>
            <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">
              请在上方 <b className="text-foreground">选择干预周期</b> 并点击「生成方案」，
              系统会据此为 {child.name} 定制饮食、运动、家庭护理与配套服务方案。
            </p>
          </div>
        ) : (
        <>

        {/* 饮食方案 - 图片同款样式 */}
        <section className="mb-4 overflow-hidden rounded-3xl bg-teal/10 shadow-sm">
          <div className="px-4 pt-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold">通用饮食方案</h2>
                <p className="text-[11px] text-muted-foreground">基于国家儿童营养指南 · 控糖限脂建议</p>
              </div>
              <span className="grid h-9 w-9 place-items-center rounded-full bg-surface text-lg">{<EIcon e="🥗" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />}</span>
            </div>

          </div>

          <div className="mx-4 mt-3 rounded-2xl bg-surface p-4">
            <div className="flex items-center justify-between">
              <p className="text-[12px] text-muted-foreground">用餐时间：<span className="font-semibold text-foreground">07:30–18:00</span></p>
              <span className="rounded-full bg-teal/15 px-2.5 py-1 text-[11px] font-medium text-teal">营养方案</span>
            </div>

            <div className="mt-4 flex items-center gap-4">
              <div className="relative grid h-32 w-32 place-items-center">
                <svg viewBox="0 0 36 36" className="h-32 w-32 -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--surface-2)" strokeWidth="3.5" />
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#F5A524" strokeWidth="3.5" strokeDasharray="50 100" strokeLinecap="round" />
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1E90FF" strokeWidth="3.5" strokeDasharray="25 100" strokeDashoffset="-50" strokeLinecap="round" />
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#5AC8FA" strokeWidth="3.5" strokeDasharray="25 100" strokeDashoffset="-75" strokeLinecap="round" />
                </svg>
                <div className="absolute text-center">
                  <p className="text-lg font-bold leading-none">1434</p>
                  <p className="text-[10px] text-muted-foreground">Kcal</p>
                </div>
              </div>
              <ul className="flex-1 space-y-2 text-[12px]">
                <li className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#F5A524]" />碳水化合物</span>
                  <span className="text-muted-foreground">177.3g</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#1E90FF]" />脂肪</span>
                  <span className="text-muted-foreground">43.4g</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#5AC8FA]" />蛋白质</span>
                  <span className="text-muted-foreground">84.3g</span>
                </li>
              </ul>
            </div>

            <div className="mt-4 flex gap-3 border-b border-border/50 pb-2 text-[13px]">
              {days.map((d, i) => (
                <button
                  key={d}
                  onClick={() => setDayIdx(i)}
                  className={`relative pb-1 ${i === dayIdx ? "font-semibold text-teal" : "text-muted-foreground"}`}
                >
                  {d}
                  {i === dayIdx && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded bg-teal" />}
                </button>
              ))}
            </div>

            <div className="mt-3 flex gap-2">
              <button
                onClick={() => toast.success("已为您更换今日食谱", { description: `${days[dayIdx]} · 已按同等热量重新搭配` })}
                className="flex-1 rounded-xl bg-teal/10 py-2.5 text-[12px] font-medium text-teal"
              >
                ↻ 不想吃全部换
              </button>
              <button
                onClick={() => toast.success("食材清单已生成", { description: `已按 ${days[dayIdx]} 三餐汇总，可在"我的-购物清单"查看` })}
                className="flex-1 rounded-xl bg-warm/15 py-2.5 text-center text-[12px] font-semibold text-warm"
              >
                生成食材清单 ›
              </button>
            </div>

            <div className="mt-3 space-y-2">
              {meals.map((m, i) => (
                <div key={m.name} className="rounded-2xl bg-surface-2 p-3">
                  <div className="flex items-center gap-2 text-[13px]">
                    <span className="text-teal">{i === 0 ? "⌄" : "›"}</span>
                    <b>{m.name}</b>
                    <span className="text-muted-foreground">约 {m.kcal} 千卡</span>
                    <span className="text-[11px] text-muted-foreground">· 推荐结构</span>
                  </div>

                  {/* 推荐理由 + 科学出处 */}
                  <div className="mt-2 rounded-xl bg-warm/10 p-2.5 ring-1 ring-warm/20">
                    <p className="text-[11px] leading-relaxed text-foreground/85">
                      <b className="text-warm">推荐理由：</b>{m.reason}
                    </p>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                       出处：{m.source}
                    </p>
                  </div>


                  {m.groups && (
                    <div className="mt-2 space-y-2">
                      <p className="text-[11px] text-muted-foreground">
                        推荐结构：粗细搭配主食 + 优质蛋白 + 蔬菜/水果
                      </p>
                      {m.groups.map((g) => (
                        <div key={g.title} className="rounded-xl bg-surface p-3">
                          <div className="flex items-center justify-between">
                            <p className="text-[13px] font-semibold">{g.title}</p>
                            <span className="text-[12px] font-semibold text-teal">{g.amount}</span>
                          </div>
                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                            {g.tags.map((t) => (
                              <span key={t} className="rounded-full bg-surface-2 px-2.5 py-0.5 text-[11px] text-foreground/80 ring-1 ring-border/60">
                                {t}
                              </span>
                            ))}
                          </div>
                          {g.tips && (
                            <p className="mt-1.5 text-[11px] text-muted-foreground">提示：{g.tips}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="h-4" />
        </section>

        {/* 运动方案 - 图片同款样式 */}
        <section className="mb-4 overflow-hidden rounded-3xl bg-teal/10 p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                今日运动 <span className="rounded-md bg-surface px-2 py-0.5 text-[11px] font-normal text-muted-foreground">通用方案 · 免费</span>
              </h2>
              <p className="mt-1 text-[11px] text-muted-foreground">通用指南建议：每周 ≥150 分钟中等强度有氧</p>
            </div>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-surface text-lg">{<EIcon e="💗" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />}</span>
          </div>

          <div className="mt-3 rounded-2xl bg-surface p-4">
            <div className="flex items-center justify-between text-[12px]">
              <span>今日打卡进度</span>
              <span className="text-muted-foreground">完成度</span>
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <p className="text-lg font-bold">{doneCount} <span className="text-[12px] font-normal text-muted-foreground">/ {total} 项</span></p>
              <p className="text-lg font-bold text-teal">{pct}%</p>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-2">
              <div className="h-full rounded-full bg-teal transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between rounded-2xl bg-rose/10 px-3 py-2.5 ring-1 ring-rose/20">
            <p className="text-[12px]"><span className="mr-1 text-danger">{<EIcon e="⚠" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />}</span><b>运动风险提示</b> 胸闷/头晕请立即停止，血糖 &lt;5.6…</p>
            <span className="text-muted-foreground">▾</span>
          </div>


          <div className="mt-4 flex items-center justify-between">
            <p className="text-[13px] font-semibold text-teal">〰 今日运动清单 <span className="ml-1 rounded-md bg-teal/15 px-1.5 py-0.5 text-[11px]">{exercises.length} 项</span></p>
            <button onClick={() => { setSheet("more"); setTab("ai"); }} className="text-[11px] text-teal">更多运动 ›</button>
          </div>

          <div className="mt-2 space-y-3">
            {exercises.map((e) => {
              const done = !!checked[e.title];
              return (
              <div key={e.title} className="overflow-hidden rounded-2xl bg-surface">
                <div className="flex">
                  <div className="relative grid w-32 shrink-0 place-items-center bg-gradient-to-br from-warm/70 to-warm p-3 text-white">
                    <span className="absolute left-2 top-2 rounded-md bg-white/90 px-1.5 py-0.5 text-[10px] font-medium text-warm">{e.tag}</span>
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-white/90 text-warm">▶</span>
                    <p className="absolute inset-x-0 bottom-2 truncate px-2 text-center text-[10px]">{e.coach}</p>
                  </div>
                  <div className="flex-1 p-3">
                    <div className="flex items-center justify-end gap-2">
                      {done ? (
                        <button
                          onClick={() => toggle(e.title)}
                          className="rounded-full bg-success px-3 py-1 text-[11px] font-medium text-success-foreground"
                        >
                          已打卡 {<EIcon e="✓" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />}
                        </button>
                      ) : (
                        <button
                          onClick={() => toggle(e.title)}
                          className="rounded-full border border-rose bg-white px-3 py-1 text-[11px] font-medium text-rose"
                        >
                          打卡
                        </button>
                      )}
                    </div>
                    <p className="mt-1 text-[13px] font-bold">{e.title} <span className="ml-1 rounded-md bg-teal/10 px-1.5 py-0.5 text-[10px] font-normal text-teal">{e.level}</span></p>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {e.tags.map((t) => (
                        <span key={t} className="rounded-md bg-teal/10 px-1.5 py-0.5 text-[10px] text-teal">{t}</span>
                      ))}
                    </div>
                    <p className="mt-1.5 text-[11px] text-muted-foreground">{<EIcon e="🕐" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />} {e.time} · 〰 {e.hr}</p>
                  </div>
                </div>
                {/* 推荐理由 + 科学出处 */}
                <div className="border-t border-border/50 bg-teal/5 px-3 py-2">
                  <p className="text-[11px] leading-relaxed text-foreground/85">
                    <b className="text-teal">推荐理由：</b>{e.reason}
                  </p>
                  <p className="mt-1 text-[10px] text-muted-foreground">{<EIcon e="📚" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />} 出处：{e.source}</p>
                </div>
              </div>
            );})}
          </div>

          <button
            onClick={() => { setSheet("more"); setTab("ai"); }}
            className="mt-3 flex w-full items-center justify-center gap-1 rounded-2xl border border-dashed border-teal/50 bg-surface py-2.5 text-[12px] font-semibold text-teal"
          >
            {<EIcon e="➕" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />} 更多运动 / ��布运动 / 参与周边活动
          </button>
        </section>


        {/* 家庭护理 */}
        <section className="mb-4 rounded-3xl bg-rose/10 p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                家庭护理 <span className="rounded-md bg-surface px-2 py-0.5 text-[11px] font-normal text-muted-foreground">尘螨过敏 · 每周</span>
              </h2>
              <p className="mt-1 text-[11px] text-muted-foreground">改善家庭环境，减少过敏原暴露</p>
            </div>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-surface text-lg">{<EIcon e="🏠" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />}</span>
          </div>

          <div className="mt-3 space-y-2">
            {[
              { title: "床品高温清洗", desc: "≥60℃ 每周 1 次，晾晒 2h 以上", freq: "周日", done: true },
              { title: "除螨仪深度清理", desc: "床垫 / 沙发 / 地毯重点区域", freq: "周三 / 六", done: false },
              { title: "更换防螨床罩", desc: "枕套、被套每 3 个月更换", freq: "季度", done: false },
              { title: "室内湿度监测", desc: "维持 40–50%，超标启动除湿", freq: "每日", done: true },
            ].map((c) => (
              <div key={c.title} className="flex items-center gap-3 rounded-2xl bg-surface p-3">
                <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] ${c.done ? "bg-success text-success-foreground" : "border border-border bg-surface-2 text-muted-foreground"}`}>
                  {c.done ? "" : ""}
                </span>
                <div className="flex-1">
                  <p className="text-[13px] font-semibold">{c.title}</p>
                  <p className="text-[11px] text-muted-foreground">{c.desc}</p>
                </div>
                <span className="rounded-full bg-rose/10 px-2 py-0.5 text-[11px] text-rose">{c.freq}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 配套健康服务包 */}
        <section className="mt-4 rounded-3xl bg-surface p-4 shadow-sm ring-1 ring-border/60">
          <div className="mb-3 flex items-center gap-2">
            <span className="h-4 w-1 rounded-full bg-warm" />
            <h2 className="text-sm font-bold">配套健康服务包</h2>
            <span className="rounded-full bg-warm/10 px-2 py-0.5 text-[10px] text-warm">按需选配</span>
          </div>
          <div className="space-y-2">
            {[
              {
                icon: "🥗",
                title: "营养师 1v1 随行指导",
                desc: "每周一次线上复盘，按打卡数据动态调整食谱",
                meta: "4 周 · 含 4 次咨询",
              },
              {
                icon: "🏃",
                title: "体重管理陪跑包",
                desc: "运动处方 + 阶段目标追踪，帮助 12 周内改善 BMI",
                meta: "12 周 · 医师团队跟进",
              },
              {
                icon: "🏠",
                title: "过敏居家护理包",
                desc: "上门除螨评估 + 环境整改方案 + 复评随访",
                meta: "单次 · 含 1 次复评",
              },
            ].map((p) => (
              <div key={p.title} className="flex items-center gap-3 rounded-2xl bg-surface-2 p-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-surface text-lg">
                  {<EIcon e={p.icon} className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold">{p.title}</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground text-pretty">{p.desc}</p>
                  <p className="mt-1 text-[10px] text-warm">{p.meta}</p>
                </div>
                <Link
                  to="/parent/comm"
                  className="shrink-0 rounded-full bg-warm/15 px-3 py-1.5 text-[11px] font-semibold text-warm"
                >
                  了解详情
                </Link>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[10px] leading-relaxed text-muted-foreground">
            服务包由儿童医院医生团队提供，可咨询健管师后按需开通，不含任何商品销售。
          </p>
        </section>
        </>
        )}
      </div>

      <div className="sticky bottom-0 left-0 right-0 z-30 mx-auto max-w-md border-t border-border/60 bg-surface/95 px-3 py-3 backdrop-blur">
        <Link
          to="/parent/comm"
          className="block rounded-full bg-gradient-to-r from-warm to-teal py-2.5 text-center text-[13px] font-semibold text-white"
        >
          咨询健管师
        </Link>
      </div>

      {sheet && (
        <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/40" onClick={() => setSheet(null)}>
          <div className="max-h-[85%] w-full overflow-y-auto rounded-t-3xl bg-surface p-4" onClick={(e) => e.stopPropagation()}>

            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border" />
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-bold">更多运动</h3>
              <button onClick={() => setSheet(null)} className="text-muted-foreground">{<EIcon e="✕" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />}</button>
            </div>
            <div className="mb-3 flex gap-2 rounded-full bg-surface-2 p-1 text-[12px]">
              {[
                { k: "ai", l: "AI 推荐" },
                { k: "custom", l: "活动发布" },
                { k: "nearby", l: "周边活动" },
              ].map((t) => (
                <button
                  key={t.k}
                  onClick={() => setTab(t.k as typeof tab)}
                  className={`flex-1 rounded-full py-1.5 font-semibold ${tab === t.k ? "bg-teal text-white" : "text-muted-foreground"}`}
                >{t.l}</button>
              ))}
            </div>

            {tab === "ai" && (
              <div className="space-y-2">
                {aiExtra.map((a) => (
                  <div key={a.title} className="rounded-2xl bg-surface-2 p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[13px] font-bold">{a.title}</p>
                      <span className="rounded-md bg-teal/15 px-1.5 py-0.5 text-[10px] text-teal">{a.tag}</span>
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground">{a.level} · 约 {a.kcal} 千卡</p>
                    <p className="mt-1 text-[11px] text-foreground/80">{a.reason}</p>
                    <button
                      onClick={() => { setChecked((s) => ({ ...s, [a.title]: true })); }}
                      className="mt-2 w-full rounded-full bg-teal py-1.5 text-[12px] font-semibold text-white"
                    >加入今日清单并打卡</button>
                  </div>
                ))}
              </div>
            )}

            {tab === "custom" && (
              <div className="space-y-3">
                <p className="text-[11px] text-muted-foreground">自定义家庭运动，发布后可在今日清单直接打卡，也可选择公开邀请周边家长参与。</p>
                <input
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="例如：周末骑行 · 明城墙"
                  className="w-full rounded-2xl bg-surface-2 px-3 py-2.5 text-[13px] outline-none"
                />
                <div className="grid grid-cols-2 gap-2">
                  <select className="rounded-2xl bg-surface-2 px-3 py-2.5 text-[12px]"><option>���门</option><option>进阶</option></select>
                  <input placeholder="时长 (分钟)" className="rounded-2xl bg-surface-2 px-3 py-2.5 text-[12px] outline-none" />
                </div>
                <label className="flex items-center gap-2 text-[12px] text-muted-foreground">
                  <input type="checkbox" className="accent-teal" /> 同时公开邀请周边家长参与
                </label>
                <button
                  disabled={!customTitle.trim()}
                  onClick={() => {
                    setChecked((s) => ({ ...s, [customTitle]: false }));
                    setCustomTitle("");
                    setSheet(null);
                  }}
                  className="w-full rounded-full bg-warm py-2 text-[13px] font-semibold text-white disabled:opacity-40"
                >发布运动</button>
              </div>
            )}

            {tab === "nearby" && (
              <div className="space-y-2">
                {nearby.map((n) => {
                  const j = !!joined[n.title];
                  return (
                    <div key={n.title} className="rounded-2xl bg-surface-2 p-3">
                      <div className="flex items-center justify-between">
                        <p className="text-[13px] font-bold">{n.title}</p>
                        <span className="rounded-md bg-warm/15 px-1.5 py-0.5 text-[10px] text-warm">{n.dist}</span>
                      </div>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">发起人：{n.host}</p>
                      <p className="mt-1 text-[11px] text-foreground/80">{<EIcon e="🕐" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />} {n.when} · {<EIcon e="👥" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />} {n.joined + (j ? 1 : 0)}/{n.cap}</p>
                      <button
                        onClick={() => setJoined((s) => ({ ...s, [n.title]: !s[n.title] }))}
                        className={`mt-2 w-full rounded-full py-1.5 text-[12px] font-semibold ${j ? "bg-surface text-muted-foreground ring-1 ring-border" : "bg-teal text-white"}`}
                      >{j ? "已报名 · 取消" : "报名参与"}</button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>

  );
}
