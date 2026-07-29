import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const Route = createFileRoute("/bigscreen")({
  component: BigScreen,
});

const kpis = [
  { label: "全省在册适龄儿童", value: 1046800, unit: "人", tint: "#38bdf8" },
  { label: "本年度已入学体检", value: 942130, unit: "人", tint: "#22d3ee" },
  { label: "体检完成率", value: 90.0, unit: "%", tint: "#34d399" },
  { label: "异常检出率", value: 18.7, unit: "%", tint: "#fbbf24" },
  { label: "重点儿童在管", value: 34860, unit: "人", tint: "#f472b6" },
  { label: "转诊完成率", value: 88.2, unit: "%", tint: "#a78bfa" },
];

// 江苏省 13 个地级市 · 简化 3D 行政区示意（viewBox 500x560）
type JCity = {
  name: string;
  pts: string;
  cx: number;
  cy: number;
  schools: number;
  kids: number;
  rate: number;
};
const jsMap: JCity[] = [
  { name: "徐州",   pts: "30,40 260,40 250,150 130,150 30,140",                    cx: 130, cy: 90,  schools: 386, kids: 96200, rate: 87 },
  { name: "连云港", pts: "260,40 450,60 460,160 340,170 250,150",                  cx: 360, cy: 100, schools: 218, kids: 61200, rate: 86 },
  { name: "宿迁",   pts: "30,140 130,150 130,240 30,240",                          cx: 80,  cy: 190, schools: 176, kids: 48900, rate: 84 },
  { name: "淮安",   pts: "130,150 250,150 340,170 320,270 130,260",                cx: 220, cy: 210, schools: 224, kids: 62400, rate: 88 },
  { name: "盐城",   pts: "340,170 460,160 470,340 320,340 320,270",                cx: 400, cy: 250, schools: 312, kids: 82600, rate: 89 },
  { name: "扬州",   pts: "30,240 130,260 130,340 30,340",                          cx: 80,  cy: 290, schools: 168, kids: 46800, rate: 91 },
  { name: "泰州",   pts: "130,260 320,270 320,340 130,340",                        cx: 220, cy: 305, schools: 194, kids: 52100, rate: 90 },
  { name: "南通",   pts: "320,340 470,340 460,440 320,440",                        cx: 390, cy: 390, schools: 288, kids: 76400, rate: 92 },
  { name: "南京",   pts: "30,340 130,340 130,440 30,440",                          cx: 80,  cy: 390, schools: 354, kids: 99900, rate: 94 },
  { name: "镇江",   pts: "130,340 220,340 220,410 130,410",                        cx: 175, cy: 375, schools: 132, kids: 36400, rate: 93 },
  { name: "常州",   pts: "220,340 320,340 320,410 220,410",                        cx: 270, cy: 375, schools: 208, kids: 58200, rate: 92 },
  { name: "无锡",   pts: "220,410 320,410 320,470 220,470",                        cx: 270, cy: 440, schools: 232, kids: 64800, rate: 95 },
  { name: "苏州",   pts: "320,410 460,440 450,510 220,510 220,470 320,470",       cx: 360, cy: 475, schools: 388, kids: 108200, rate: 96 },
];

const progressByCity = jsMap
  .map((c) => ({ name: c.name, 已检: c.rate }))
  .sort((a, b) => b.已检 - a.已检);

const abnormalTop = [
  { name: "视力不良", value: 34.2 },
  { name: "超重 / 肥胖", value: 21.5 },
  { name: "龋齿", value: 19.8 },
  { name: "脊柱侧弯风险", value: 8.6 },
  { name: "血压偏高", value: 6.3 },
  { name: "过敏性鼻炎", value: 5.1 },
  { name: "心律异常", value: 2.9 },
];

const trend = [
  { m: "1月", 完成: 6200 },
  { m: "2月", 完成: 8800 },
  { m: "3月", 完成: 15400 },
  { m: "4月", 完成: 22100 },
  { m: "5月", 完成: 18600 },
  { m: "6月", 完成: 14300 },
  { m: "7月", 完成: 9800 },
  { m: "8月", 完成: 12100 },
  { m: "9月", 完成: 8929 },
];

const referral = [
  { name: "已建档随访", value: 62, color: "#22d3ee" },
  { name: "社区在管", value: 21, color: "#34d399" },
  { name: "医院复诊中", value: 12, color: "#fbbf24" },
  { name: "未响应", value: 5, color: "#f87171" },
];

const dimensions = [
  { k: "视力", A: 68 },
  { k: "体重", A: 74 },
  { k: "口腔", A: 71 },
  { k: "脊柱", A: 88 },
  { k: "血压", A: 92 },
  { k: "心肺", A: 95 },
  { k: "过敏", A: 82 },
];

const alerts = [
  { time: "10:24", tag: "预警", tint: "#f87171", msg: "盐城市体检进度落后目标 -8%，建议增派承检机构" },
  { time: "10:12", tag: "转诊", tint: "#fbbf24", msg: "苏州工业园区 236 例视力不良未按期到院复查" },
  { time: "09:58", tag: "上报", tint: "#22d3ee", msg: "南京市完成本周异常汇总上报（3,842 例）" },
  { time: "09:41", tag: "宣教", tint: "#34d399", msg: "全省推送《春季儿童过敏防护》，覆盖 42.6 万家庭" },
  { time: "09:20", tag: "抽查", tint: "#a78bfa", msg: "省卫健委抽查 12 所小学体检质控，通过率 96%" },
  { time: "08:47", tag: "预警", tint: "#f87171", msg: "徐州某校连续 3 天缺检率 > 8%，已通知教育局" },
];

const orgs = [
  { name: "南京市儿童医院", done: 12420, rate: 96 },
  { name: "苏大附属儿童医院", done: 11620, rate: 94 },
  { name: "无锡市妇幼保健院", done: 9980, rate: 95 },
  { name: "常州市儿童医院", done: 8410, rate: 92 },
  { name: "徐州市妇幼保健院", done: 7820, rate: 88 },
];

function BigScreen() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const fmt = (n: number) => n.toLocaleString("zh-CN");

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-[#050a1f] p-3 font-sans text-slate-100">
      {/* bg glow */}
      <div className="pointer-events-none absolute inset-0 -z-0">
        <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute right-1/4 bottom-0 h-96 w-96 rounded-full bg-fuchsia-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex h-full w-full max-w-[1920px] flex-col">
        {/* Header */}
        <header className="mb-2 flex shrink-0 items-center justify-between border-b border-cyan-500/20 pb-2">
          <div className="flex items-center gap-3 text-xs text-cyan-300/80">
            <span>江苏省教育厅 · 体卫艺处</span>
            <span className="text-cyan-500/40">|</span>
            <span>数据接入：江苏省 13 地市 · 3,280 所小学 · 486 家承检机构</span>
          </div>
          <h1 className="bg-gradient-to-r from-cyan-300 via-sky-200 to-fuchsia-300 bg-clip-text text-xl font-black tracking-widest text-transparent">
            江苏省 · 儿童入学体检协同监测大屏
          </h1>
          <div className="text-right text-xs text-cyan-300/80">
            <div>{now.toLocaleDateString("zh-CN")} · {now.toLocaleTimeString("zh-CN")}</div>
            <div className="text-cyan-500/60">省卫健委 · 妇幼健康处 联合发布</div>
          </div>
        </header>

        {/* KPI row */}
        <div className="mb-2 grid shrink-0 grid-cols-6 gap-2">
          {kpis.map((k) => (
            <div
              key={k.label}
              className="relative overflow-hidden rounded-lg border border-cyan-500/20 bg-gradient-to-br from-white/[0.03] to-transparent p-2 backdrop-blur"
            >
              <div
                className="absolute -right-6 -top-6 h-16 w-16 rounded-full opacity-30 blur-2xl"
                style={{ background: k.tint }}
              />
              <p className="text-[11px] tracking-wider text-slate-400">{k.label}</p>
              <p className="mt-0.5 text-2xl font-black tabular-nums" style={{ color: k.tint }}>
                {typeof k.value === "number" && k.value % 1 !== 0 ? k.value.toFixed(1) : fmt(k.value)}
                <span className="ml-1 text-xs font-normal text-slate-400">{k.unit}</span>
              </p>
            </div>
          ))}
        </div>

        {/* main grid */}
        <div className="grid min-h-0 flex-1 grid-cols-12 gap-2">
          {/* left */}
          <div className="col-span-3 flex min-h-0 flex-col gap-2">
            <Panel title="各市体检进度（%）" className="flex-[1.3]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={progressByCity} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
                  <CartesianGrid stroke="#164e63" strokeDasharray="2 4" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} stroke="#67e8f9" fontSize={10} />
                  <YAxis dataKey="name" type="category" stroke="#67e8f9" fontSize={10} width={44} />
                  <Tooltip {...tt} />
                  <Bar dataKey="已检" fill="url(#gradBar)" radius={[0, 4, 4, 0]} />
                  <defs>
                    <linearGradient id="gradBar" x1="0" x2="1">
                      <stop offset="0%" stopColor="#22d3ee" />
                      <stop offset="100%" stopColor="#a78bfa" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </Panel>

            <Panel title="承检机构 TOP 5" className="flex-1" bodyClassName="overflow-auto">
              <ul className="space-y-1.5 text-xs">
                {orgs.map((o, i) => (
                  <li key={o.name}>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <span
                          className={`grid h-5 w-5 place-items-center rounded text-[10px] font-bold ${
                            i < 3 ? "bg-cyan-500/30 text-cyan-200" : "bg-slate-700/40 text-slate-300"
                          }`}
                        >
                          {i + 1}
                        </span>
                        <span className="text-slate-200">{o.name}</span>
                      </span>
                      <span className="tabular-nums text-cyan-300">{fmt(o.done)}</span>
                    </div>
                    <div className="mt-1 h-1 overflow-hidden rounded-full bg-slate-700/40">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-400"
                        style={{ width: `${o.rate}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel title="重点儿童干预进度" className="flex-1" bodyClassName="overflow-auto">
              <ul className="space-y-1.5 text-[11px]">
                {[
                  { k: "视力矫正跟踪", n: 12240, r: 78, c: "#f472b6" },
                  { k: "体重管理干预", n: 8630, r: 65, c: "#fbbf24" },
                  { k: "口腔龋齿治疗", n: 7210, r: 82, c: "#34d399" },
                  { k: "脊柱侧弯复查", n: 3480, r: 71, c: "#a78bfa" },
                  { k: "血压异常随访", n: 1820, r: 88, c: "#38bdf8" },
                ].map((x) => (
                  <li key={x.k}>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-200">{x.k}</span>
                      <span className="tabular-nums text-slate-300">
                        <span className="text-cyan-300">{fmt(x.n)}</span>
                        <span className="ml-1 text-slate-500">人 · {x.r}%</span>
                      </span>
                    </div>
                    <div className="mt-1 h-1 overflow-hidden rounded-full bg-slate-700/40">
                      <div className="h-full rounded-full" style={{ width: `${x.r}%`, background: x.c }} />
                    </div>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel title="本周家校医协同任务" className="flex-1" bodyClassName="overflow-auto">
              <ul className="space-y-1 text-[11px]">
                {[
                  { t: "校方上传体检花名册", s: "完成", c: "#34d399", p: "98%" },
                  { t: "机构回传体检报告", s: "进行", c: "#22d3ee", p: "82%" },
                  { t: "异常结果分级派单", s: "进行", c: "#fbbf24", p: "67%" },
                  { t: "家长知情同意回收", s: "待办", c: "#f472b6", p: "45%" },
                  { t: "社区随访建档", s: "进行", c: "#a78bfa", p: "71%" },
                ].map((x) => (
                  <li key={x.t} className="flex items-center justify-between rounded border border-slate-700/40 bg-slate-800/20 px-2 py-1">
                    <span className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: x.c }} />
                      <span className="text-slate-200">{x.t}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="tabular-nums text-slate-400">{x.p}</span>
                      <span className="rounded px-1.5 py-0.5 text-[10px]" style={{ background: `${x.c}25`, color: x.c }}>
                        {x.s}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </Panel>
          </div>

          {/* center — big Jiangsu 3D map */}
          <div className="col-span-6 flex min-h-0 flex-col">
            <JiangsuMapPanel />
          </div>

          {/* right */}
          <div className="col-span-3 flex min-h-0 flex-col gap-2">
            <Panel title="异常后处置分布" className="flex-1">
              <div className="flex h-full flex-col">
                <div className="min-h-0 flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={referral}
                        dataKey="value"
                        innerRadius={35}
                        outerRadius={65}
                        paddingAngle={3}
                        stroke="#050a1f"
                      >
                        {referral.map((r) => (
                          <Cell key={r.name} fill={r.color} />
                        ))}
                      </Pie>
                      <Tooltip {...tt} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <ul className="grid shrink-0 grid-cols-2 gap-1 text-[11px]">
                  {referral.map((r) => (
                    <li key={r.name} className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-sm" style={{ background: r.color }} />
                      <span className="text-slate-300">{r.name}</span>
                      <span className="ml-auto tabular-nums text-slate-400">{r.value}%</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Panel>

            <Panel title="实时预警与协同事件" liveDot className="flex-[1.5]" bodyClassName="overflow-auto">
              <ul className="space-y-1.5 text-xs">
                {alerts.map((a, i) => (
                  <li
                    key={i}
                    className="rounded border border-slate-700/40 bg-slate-800/30 p-1.5"
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span
                        className="rounded px-1.5 py-0.5 font-semibold"
                        style={{ background: `${a.tint}30`, color: a.tint }}
                      >
                        {a.tag}
                      </span>
                      <span className="text-slate-500">{a.time}</span>
                    </div>
                    <p className="mt-1 leading-relaxed text-slate-200">{a.msg}</p>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel title="TOP 异常检出（%）" className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={abnormalTop} margin={{ left: 0, right: 12, top: 4, bottom: 4 }}>
                  <CartesianGrid stroke="#164e63" strokeDasharray="2 4" />
                  <XAxis dataKey="name" stroke="#67e8f9" fontSize={9} interval={0} angle={-15} height={38} />
                  <YAxis stroke="#67e8f9" fontSize={9} />
                  <Tooltip {...tt} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {abnormalTop.map((_, i) => (
                      <Cell key={i} fill={["#f472b6", "#fbbf24", "#34d399", "#a78bfa", "#38bdf8", "#f87171", "#fb923c"][i]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Panel>

            <Panel title="家校医协同健康指数" className="flex-1">
              <div className="flex h-full flex-col">
                <div className="min-h-0 flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trend}>
                      <Line
                        type="monotone"
                        dataKey="完成"
                        stroke="#34d399"
                        strokeWidth={2}
                        dot={false}
                      />
                      <XAxis dataKey="m" hide />
                      <YAxis hide />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex shrink-0 items-end justify-between">
                  <p className="text-3xl font-black text-emerald-300">92.4</p>
                  <p className="text-[11px] text-slate-400">
                    较上月 <span className="text-emerald-300">▲ 2.1</span>
                  </p>
                </div>
              </div>
            </Panel>
          </div>
        </div>

        <footer className="mt-2 flex shrink-0 items-center justify-between border-t border-cyan-500/20 pt-1.5 text-[10px] text-slate-500">
          <span>数据来源：省教育厅体卫艺处 · 省卫健委妇幼健康处 · 阳光校园健康平台</span>
          <span>刷新周期：60s · 当前接入承检机构在线 486 / 486</span>
        </footer>
      </div>
    </div>
  );
}

const tt = {
  contentStyle: {
    background: "rgba(3,10,30,0.9)",
    border: "1px solid #22d3ee55",
    borderRadius: 8,
    fontSize: 12,
    color: "#e2e8f0",
  },
  labelStyle: { color: "#67e8f9" },
};

function Panel({
  title,
  children,
  liveDot,
  className = "",
  bodyClassName = "",
}: {
  title: string;
  children: React.ReactNode;
  liveDot?: boolean;
  className?: string;
  bodyClassName?: string;
}) {
  // min-h-0 is required on the root: without it a panel's flex-basis floors at
  // its content height, so a tall panel (e.g. the alert feed) refuses to shrink
  // and squeezes its siblings to zero height / past the footer.
  return (
    <div className={`relative flex min-h-0 flex-col rounded-lg border border-cyan-500/20 bg-white/[0.02] p-3 backdrop-blur ${className}`}>
      <div className="pointer-events-none absolute -left-px -top-px h-3 w-8 border-l-2 border-t-2 border-cyan-400" />
      <div className="pointer-events-none absolute -right-px -top-px h-3 w-8 border-r-2 border-t-2 border-cyan-400" />
      <div className="pointer-events-none absolute -bottom-px -left-px h-3 w-8 border-b-2 border-l-2 border-cyan-400" />
      <div className="pointer-events-none absolute -bottom-px -right-px h-3 w-8 border-b-2 border-r-2 border-cyan-400" />
      <div className="mb-2 flex shrink-0 items-center justify-between">
        <h3 className="text-xs font-semibold tracking-wider text-cyan-200">
          ▍{title}
        </h3>
        {liveDot && (
          <span className="flex items-center gap-1 text-[10px] text-emerald-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            LIVE
          </span>
        )}
      </div>
      <div className={`no-scrollbar min-h-0 flex-1 ${bodyClassName}`}>{children}</div>
      {/* Scroll affordance: a short fade at the bottom edge so a row clipped by
          overflow reads as "more content below" instead of looking broken.
          Only drawn for scrollable panels. */}
      {bodyClassName.includes("overflow-auto") && (
        <div className="pointer-events-none absolute inset-x-3 bottom-px h-6 rounded-b-lg bg-gradient-to-t from-[#0a1428] to-transparent" />
      )}
    </div>
  );
}

function JiangsuMapPanel() {
  const totalSchools = jsMap.reduce((s, d) => s + d.schools, 0);
  const totalKids = jsMap.reduce((s, d) => s + d.kids, 0);
  const avgRate = Math.round(jsMap.reduce((s, d) => s + d.rate, 0) / jsMap.length);
  const color = (r: number) =>
    r >= 92 ? "#34d399" : r >= 88 ? "#22d3ee" : r >= 84 ? "#fbbf24" : "#f87171";

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-cyan-500/20 bg-gradient-to-b from-[#061a3a] via-[#04122a] to-[#020814] p-3 backdrop-blur">
      <div className="pointer-events-none absolute -left-px -top-px h-3 w-8 border-l-2 border-t-2 border-cyan-400" />
      <div className="pointer-events-none absolute -right-px -top-px h-3 w-8 border-r-2 border-t-2 border-cyan-400" />
      <div className="pointer-events-none absolute -bottom-px -left-px h-3 w-8 border-b-2 border-l-2 border-cyan-400" />
      <div className="pointer-events-none absolute -bottom-px -right-px h-3 w-8 border-b-2 border-r-2 border-cyan-400" />

      {/* top title strip */}
      <div className="relative z-10 mb-1 flex shrink-0 items-center justify-center">
        <div className="rounded border border-cyan-400/40 bg-cyan-500/10 px-6 py-1 text-sm font-bold tracking-[0.25em] text-cyan-100 shadow-[0_0_20px_rgba(34,211,238,0.35)]">
          江苏省 · 儿童入学体检辐射版图
        </div>
      </div>

      {/* top big stats overlay */}
      <div className="relative z-10 mb-1 grid shrink-0 grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-[10px] tracking-widest text-cyan-300/70">覆盖学校</p>
          <p className="text-2xl font-black tabular-nums text-cyan-200">{fmtGrouped(totalSchools)}<span className="ml-1 text-xs text-slate-400">所</span></p>
        </div>
        <div>
          <p className="text-[10px] tracking-widest text-cyan-300/70">监测适龄儿童</p>
          <p className="text-3xl font-black tabular-nums text-white">{fmtGrouped(totalKids)}<span className="ml-1 text-xs text-slate-400">人</span></p>
        </div>
        <div>
          <p className="text-[10px] tracking-widest text-cyan-300/70">全省体检完成率</p>
          <p className="text-2xl font-black tabular-nums text-emerald-300">{avgRate}<span className="ml-1 text-xs text-slate-400">%</span></p>
        </div>
      </div>

      {/* Map. Overlays are placed in the map's empty corners (see below) so the
          province keeps its full width and no city label is covered. */}
      <div className="relative min-h-0 flex-1">
        <svg viewBox="0 0 500 560" preserveAspectRatio="xMidYMid meet" className="h-full w-full">
          <defs>
            <linearGradient id="dTop" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#3ec6ff" />
              <stop offset="100%" stopColor="#1a6db8" />
            </linearGradient>
            <linearGradient id="dSide" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#1a5a99" />
              <stop offset="100%" stopColor="#0a2547" />
            </linearGradient>
            <radialGradient id="floorGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.5" />
              <stop offset="70%" stopColor="#22d3ee" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
            </radialGradient>
            <filter id="topGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="markerGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" />
            </filter>
            <pattern id="gridBg" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#164e63" strokeWidth="0.3" opacity="0.5" />
            </pattern>
          </defs>

          <rect width="500" height="560" fill="url(#gridBg)" />

          {/* Floor glow */}
          <ellipse cx="250" cy="540" rx="240" ry="26" fill="url(#floorGlow)" />
          <ellipse cx="250" cy="540" rx="220" ry="22" fill="none" stroke="#22d3ee" strokeOpacity="0.35" strokeDasharray="2 6" />
          <ellipse cx="250" cy="540" rx="180" ry="16" fill="none" stroke="#22d3ee" strokeOpacity="0.25" />

          {/* extruded side (shadow) */}
          {jsMap.map((d) => (
            <g key={`s-${d.name}`} transform="translate(0, 14)">
              <polygon points={d.pts} fill="url(#dSide)" stroke="#0a1f3d" strokeWidth="1" />
            </g>
          ))}

          {/* top faces */}
          {jsMap.map((d) => {
            const c = color(d.rate);
            return (
              <g key={`t-${d.name}`}>
                <polygon
                  points={d.pts}
                  fill="url(#dTop)"
                  stroke="#7dd3fc"
                  strokeWidth="1.2"
                  filter="url(#topGlow)"
                />
                <polygon points={d.pts} fill={c} fillOpacity="0.22" />
              </g>
            );
          })}

          {/* markers + labels */}
          {jsMap.map((d) => {
            const c = color(d.rate);
            return (
              <g key={`m-${d.name}`}>
                {/* pulsing halo */}
                <circle cx={d.cx} cy={d.cy} r="10" fill={c} opacity="0.35" filter="url(#markerGlow)">
                  <animate attributeName="r" values="6;14;6" dur="2.4s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.5;0.1;0.5" dur="2.4s" repeatCount="indefinite" />
                </circle>
                <circle cx={d.cx} cy={d.cy} r="4" fill={c} stroke="#fff" strokeWidth="1" />
                {/* connector line up */}
                <line x1={d.cx} y1={d.cy - 4} x2={d.cx} y2={d.cy - 22} stroke={c} strokeWidth="1" strokeDasharray="2 2" />
                {/* label box */}
                <g transform={`translate(${d.cx}, ${d.cy - 32})`}>
                  <rect
                    x={-32}
                    y={-11}
                    width="64"
                    height="20"
                    rx="3"
                    fill="rgba(4,18,42,0.85)"
                    stroke={c}
                    strokeWidth="1"
                  />
                  <text x="0" y="4" textAnchor="middle" fontSize="11" fontWeight="700" fill="#eaf6ff">
                    {d.name}
                    <tspan fontSize="9" fill={c} dx="3">
                      {d.rate}%
                    </tspan>
                  </text>
                </g>
              </g>
            );
          })}
        </svg>

        {/* Legend — compact, so it takes the narrow top-left corner and leaves
            the wider bottom-left corner for the radar. */}
        <div className="absolute left-2 top-2 flex flex-col gap-1 rounded bg-slate-950/70 px-2 py-1.5 text-[10px] text-slate-300 ring-1 ring-cyan-500/20">
          <span className="tracking-widest text-cyan-300/80">完成率图例</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-400" />≥92%</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-cyan-400" />88–92%</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-400" />84–88%</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-400" />&lt;84%</span>
        </div>

        {/* Dimension radar — bottom-left is the only corner wide enough for it
            without covering a city label (top-right has 连云港, bottom-right has
            苏州). The compact legend takes the tighter top-left corner instead. */}
        <div className="absolute bottom-2 left-2 w-[150px] rounded bg-slate-950/70 p-2 text-[10px] text-slate-300 ring-1 ring-cyan-500/20">
          <p className="mb-1 tracking-widest text-cyan-300/80">健康维度综合指数</p>
          <ResponsiveContainer width="100%" height={120}>
            <RadarChart data={dimensions}>
              <PolarGrid stroke="#164e63" />
              <PolarAngleAxis dataKey="k" stroke="#67e8f9" fontSize={9} />
              <Radar dataKey="A" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.35} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Compass — moved to the top-right corner vacated by the radar panel. */}
        <div className="absolute right-2 top-2 rounded-full border border-cyan-400/40 bg-slate-950/60 p-1.5 text-[10px] text-cyan-300">
          <svg viewBox="0 0 24 24" className="h-6 w-6">
            <circle r="10" cx="12" cy="12" fill="none" stroke="#22d3ee" strokeOpacity="0.6" />
            <path d="M12,3 L14,12 L12,10 L10,12 Z" fill="#22d3ee" />
            <text x="12" y="22" textAnchor="middle" fontSize="6" fill="#22d3ee">N</text>
          </svg>
        </div>
      </div>
    </div>
  );
}

function fmtGrouped(n: number) {
  return n.toLocaleString("zh-CN");
}
