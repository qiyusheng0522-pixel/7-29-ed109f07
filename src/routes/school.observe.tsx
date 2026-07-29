import { createFileRoute, Link } from "@tanstack/react-router";
import { StatusBar } from "@/components/MobileFrame";

import { EIcon } from "@/components/EIcon";
export const Route = createFileRoute("/school/observe")({
  component: ObservePage,
});

const kpis = [
  { k: "家庭任务启动", v: "72%", delta: "+8%", tint: "teal" },
  { k: "任务完成率", v: "65%", delta: "+5%", tint: "success" },
  { k: "呼吸不适上报", v: "12", delta: "-4", tint: "warm" },
  { k: "运动参与", v: "88%", delta: "+3%", tint: "deep" },
];

const trends = [
  { k: "体重 / BMI 阶段趋势", desc: "肥胖关注学生 42 → 36，好转 6 人" },
  { k: "睡眠改善", desc: "22:30 前入睡比例 58% → 66%" },
  { k: "呼吸/运动不适", desc: "近 30 天上报 12 起，较上月 -4" },
];

const upcoming = [
  { time: "本周", who: "5年1班 3 名学生", type: "1 个月复评到期" },
  { time: "下周", who: "2年2班 王小明", type: "3 个月体重复评" },
  { time: "月底", who: "1年1班 张小乐", type: "呼吸复评 · 需校医配合" },
];

function ObservePage() {
  return (
    <div>
      <StatusBar title="学生变化观察" />
      <div className="px-5 pt-2">
        <div className="mb-1 flex items-center gap-2">
          <Link to="/school" className="text-lg text-muted-foreground">‹</Link>
          <h1 className="text-xl font-bold">学生变化观察</h1>
        </div>
        <p className="mb-4 text-xs text-muted-foreground">仅趋势概览 · 不看家庭详细日志与医学诊断</p>

        <div className="mb-4 grid grid-cols-2 gap-2">
          {kpis.map((k) => (
            <div key={k.k} className={`rounded-2xl bg-${k.tint}/10 p-3 ring-1 ring-${k.tint}/20`}>
              <p className="text-[11px] text-muted-foreground">{k.k}</p>
              <div className="mt-1 flex items-baseline gap-2">
                <p className={`text-xl font-extrabold text-${k.tint}`}>{k.v}</p>
                <span className={`text-[11px] ${k.delta.startsWith("-") && !k.k.includes("不适") ? "text-danger" : "text-success"}`}>
                  {k.delta}
                </span>
              </div>
            </div>
          ))}
        </div>

        <h2 className="mb-2 text-sm font-semibold">阶段趋势</h2>
        <ul className="mb-5 space-y-2">
          {trends.map((t) => (
            <li key={t.k} className="rounded-2xl bg-surface p-3 shadow-sm ring-1 ring-border/60">
              <p className="text-sm font-medium">{t.k}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{t.desc}</p>
              <div className="mt-2 h-8 rounded-lg bg-gradient-to-r from-teal/20 via-teal/40 to-teal/60" />
            </li>
          ))}
        </ul>

        <h2 className="mb-2 text-sm font-semibold">复评到期提醒</h2>
        <ul className="space-y-2 pb-8">
          {upcoming.map((u) => (
            <li key={u.who + u.type} className="flex items-center gap-3 rounded-2xl bg-surface p-3 shadow-sm ring-1 ring-border/60">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-deep/15 text-lg">{<EIcon e="🔁" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />}</div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{u.type}</p>
                <p className="text-[11px] text-muted-foreground">{u.time} · {u.who}</p>
              </div>
              <Link to="/school/intasks" className="rounded-full bg-teal/15 px-3 py-1 text-[11px] text-teal">
                去配合
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
