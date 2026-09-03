import { createFileRoute, Link } from "@tanstack/react-router";
import { StatusBar } from "@/components/MobileFrame";
import { findExamUser } from "@/lib/exam-users";

import { EIcon } from "@/components/EIcon";
export const Route = createFileRoute("/doctor/child")({
  validateSearch: (search: Record<string, unknown>): { sid?: string } => ({
    sid: typeof search.sid === "string" ? search.sid : undefined,
  }),
  component: DoctorChildDataPage,
});

type Level = "ok" | "warn" | "bad";
type Item = { name: string; value: string; ref: string; level: Level };
type Section = { title: string; items: Item[] };

const sections: Section[] = [
  {
    title: "体格发育",
    items: [
      { name: "身高", value: "138 cm", ref: "P75", level: "ok" },
      { name: "体重", value: "32.5 kg", ref: "P85 · 偏重", level: "bad" },
      { name: "BMI", value: "17.1", ref: "14.5–16.8", level: "bad" },
      { name: "腰围", value: "62 cm", ref: "≤ 64 cm", level: "ok" },
    ],
  },
  {
    title: "视力与眼健康",
    items: [
      { name: "裸眼视力 (左)", value: "5.0", ref: "≥ 5.0", level: "ok" },
      { name: "裸眼视力 (右)", value: "5.0", ref: "≥ 5.0", level: "ok" },
      { name: "屈光度 (左)", value: "+0.25D", ref: "±0.50D", level: "ok" },
      { name: "眼位", value: "正位", ref: "正位", level: "ok" },
    ],
  },
  {
    title: "口腔",
    items: [
      { name: "龋齿", value: "0 颗", ref: "0 颗", level: "ok" },
      { name: "牙列", value: "整齐", ref: "整齐", level: "ok" },
    ],
  },
  {
    title: "内科",
    items: [
      { name: "血压", value: "102/66 mmHg", ref: "< 120/80", level: "ok" },
      { name: "心率", value: "88 bpm", ref: "70–110", level: "ok" },
      { name: "肺部听诊", value: "呼吸音清", ref: "正常", level: "ok" },
    ],
  },
  {
    title: "过敏与呼吸",
    items: [
      { name: "过敏原-尘螨", value: "阳性 (++)", ref: "阴性", level: "bad" },
      { name: "肺功能 FEV1", value: "98%", ref: "≥ 80%", level: "ok" },
      { name: "运动后咳嗽", value: "偶发", ref: "无", level: "warn" },
    ],
  },
];

const dot: Record<Level, string> = {
  ok: "bg-success",
  warn: "bg-warning",
  bad: "bg-danger",
};

const valueColor: Record<Level, string> = {
  ok: "text-foreground",
  warn: "text-warning-foreground",
  bad: "text-danger",
};

const trend = [125, 126, 126.5, 127, 127.5, 128];
const weightTrend = [25.8, 26.2, 26.5, 26.9, 27.2, 27.5];

function DoctorChildDataPage() {
  return (
    <div>
      <StatusBar title="儿童体检结果" />
      <div className="px-5 pb-8 pt-2">
        <header className="mb-3">
          <h1 className="text-xl font-bold">小阳 的体检结果</h1>
          <p className="text-xs text-muted-foreground">
            学生编号 S-2026-0318 · 阳光小学 · 三年级 3 班 · 2026-09-18
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            医生端：结合本次体检数据与历史趋势，可下发方案或转诊
          </p>
        </header>

        {/* 关键指标概览 */}
        <section className="mb-3 rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-border/60">
          <div className="grid grid-cols-4 gap-2 text-center">
            {[
              { k: "身高", v: "138cm" },
              { k: "体重", v: "32.5kg" },
              { k: "BMI", v: "17.1", warn: true },
              { k: "视力", v: "5.0/5.0" },
            ].map((s) => (
              <div key={s.k}>
                <p className={`text-sm font-bold ${s.warn ? "text-danger" : ""}`}>{s.v}</p>
                <p className="text-[10px] text-muted-foreground">{s.k}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 本次体检结论 */}
        <section className="mb-3 rounded-2xl bg-warm/10 p-4 ring-1 ring-warm/30">
          <div className="mb-1 flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-warm/20 text-[12px]">{<EIcon e="⚕" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />}</span>
            <p className="text-[13px] font-semibold text-warm">本次体检结论 · 3 项异常</p>
          </div>
          <p className="text-[12px] leading-relaxed text-muted-foreground">
            BMI 偏高（超 P85）、尘螨过敏 (++)、运动后偶发咳嗽。建议加强体重管理并进行呼吸道随访。
          </p>
        </section>

        {/* 参考值来源 */}
        <div className="mb-3 flex items-center gap-2 rounded-2xl bg-surface px-3 py-2 text-[11px] text-muted-foreground ring-1 ring-border/60">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-teal/15 text-[12px]">{<EIcon e="🏥" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />}</span>
          <p>
            指标 <b className="text-foreground">参考值来源：南京市儿童医院体检中心</b>
          </p>
        </div>

        {/* Detailed exam sections */}
        <p className="mb-2 mt-1 px-1 text-[11px] text-muted-foreground">各项体检明细 · 点击展开</p>

        <div className="mb-3 space-y-2">
          {sections.map((s) => {
            const abnormal = s.items.filter((it) => it.level !== "ok").length;
            const hasAb = abnormal > 0;
            return (
              <details
                key={s.title}
                open={hasAb}
                className="group rounded-2xl bg-surface shadow-sm ring-1 ring-border/60 open:ring-teal/30"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4">
                  <div className="flex items-center gap-2">
                    <span className="h-4 w-1 rounded-full bg-teal" />
                    <span className="text-sm font-semibold">{s.title}</span>
                    <span className="text-[11px] text-muted-foreground">
                      共 {s.items.length} 项
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {hasAb ? (
                      <span className="rounded-full bg-danger/10 px-2 py-0.5 text-[11px] font-medium text-danger">
                        异常 {abnormal} 项
                      </span>
                    ) : (
                      <span className="rounded-full bg-success/10 px-2 py-0.5 text-[11px] text-success">
                        全部正常
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground transition group-open:rotate-180">
                      ▾
                    </span>
                  </div>
                </summary>
                <ul className="divide-y divide-border/60 px-4 pb-3">
                  {s.items.map((it) => (
                    <li key={it.name} className="flex items-center justify-between gap-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${dot[it.level]}`} />
                        <span className="text-sm">{it.name}</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className={`text-sm font-semibold ${valueColor[it.level]}`}>
                          {it.value}
                        </span>
                        <span className="text-[11px] text-muted-foreground">参考 {it.ref}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </details>
            );
          })}
        </div>

        {/* Trend */}
        <details className="group mb-3 rounded-2xl bg-surface shadow-sm ring-1 ring-border/60">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4">
            <span className="text-sm font-semibold">近期身体趋势（近 6 次）</span>
            <span className="text-xs text-muted-foreground transition group-open:rotate-180">▾</span>
          </summary>
          <div className="px-4 pb-4">
            <div className="grid grid-cols-2 gap-3">
              <MiniChart label="身高 cm" data={trend} color="teal" />
              <MiniChart label="体重 kg" data={weightTrend} color="warm" />
            </div>
          </div>
        </details>

        {/* 医生操作 */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Link
            to="/doctor/plan"
            className="rounded-2xl bg-teal py-3 text-center text-sm font-semibold text-teal-foreground shadow-sm"
          >
            下发健康方案
          </Link>
          <Link
            to="/doctor/referral"
            className="rounded-2xl bg-surface py-3 text-center text-sm font-semibold text-teal ring-1 ring-teal/40"
          >
            发起转诊 / 复核
          </Link>
        </div>
      </div>
    </div>
  );
}

function MiniChart({ label, data, color }: { label: string; data: number[]; color: "warm" | "teal" }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const stroke = color === "warm" ? "var(--warm)" : "var(--teal)";
  const points = data
    .map((v, i) => `${(i / (data.length - 1)) * 100},${100 - ((v - min) / range) * 80 - 10}`)
    .join(" ");
  return (
    <div className={`rounded-xl p-3 ${color === "warm" ? "bg-warm/10" : "bg-teal/10"}`}>
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="text-lg font-bold">{data[data.length - 1]}</p>
      <svg viewBox="0 0 100 100" className="mt-1 h-14 w-full">
        <polyline points={points} fill="none" stroke={stroke} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
    </div>
  );
}
