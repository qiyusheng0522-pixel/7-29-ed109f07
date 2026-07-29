import { createFileRoute } from "@tanstack/react-router";
import { StatusBar } from "@/components/MobileFrame";
import { findExamUser } from "@/lib/exam-users";
import { User2, CalendarClock, School as SchoolIcon, IdCard, Ruler, Scale, Eye, Activity } from "lucide-react";

import { EIcon } from "@/components/EIcon";
export const Route = createFileRoute("/school/student/$id")({
  component: SchoolStudentReport,
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

function SchoolStudentReport() {
  const { id } = Route.useParams();
  const u = findExamUser(id);
  const name = u?.name ?? "未知学生";
  const grade = u?.grade ?? "阳光小学";
  const gender = u?.gender ?? "—";
  const age = u?.age ?? "—";
  const initial = name.slice(-1);
  const metrics = [
    { icon: Ruler, k: "身高", v: "138 cm" },
    { icon: Scale, k: "体重", v: "32.5 kg" },
    { icon: Activity, k: "BMI", v: "17.1" },
    { icon: Eye, k: "视力", v: "5.0 / 5.0" },
  ];

  return (
    <div>
      <StatusBar title="学生体检报告" />
      <div className="px-5 pb-8 pt-2">
        {/* 学生身份卡 */}
        <section className="mb-3 overflow-hidden rounded-2xl bg-gradient-to-br from-teal/10 via-surface to-deep/10 p-4 shadow-sm ring-1 ring-border/60">
          <div className="flex items-center gap-3">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-teal/15 text-lg font-bold text-teal ring-1 ring-teal/30">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <h1 className="truncate text-lg font-bold">{name}</h1>
                <span className="text-[11px] text-muted-foreground">
                  {gender} · {age} 岁
                </span>
              </div>
              <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                <SchoolIcon className="h-3 w-3" /> 阳光小学 · {grade}
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                <IdCard className="h-3 w-3" /> 学号 {id}
                <span className="mx-1">·</span>
                <CalendarClock className="h-3 w-3" /> 2026 春季常规体检
              </p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-4 gap-2 rounded-xl bg-surface/70 p-2.5 ring-1 ring-border/40">
            {metrics.map((m) => (
              <div key={m.k} className="text-center">
                <m.icon className="mx-auto h-3.5 w-3.5 text-muted-foreground" />
                <p className="mt-0.5 text-sm font-bold">{m.v}</p>
                <p className="text-[10px] text-muted-foreground">{m.k}</p>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[10.5px] text-muted-foreground">
            <User2 className="mr-1 inline h-3 w-3" />
            学校端仅展示体检数据，医学诊断与健康方案由家长与医生查看
          </p>
        </section>

        {/* 参考值来源 */}
        <div className="mb-3 flex items-center gap-2 rounded-2xl bg-surface px-3 py-2 text-[11px] text-muted-foreground ring-1 ring-border/60">
          <SchoolIcon className="h-4 w-4 text-teal" />
          <p>
            指标 <b className="text-foreground">参考值来源：南京市儿童医院体检中心</b>
          </p>
        </div>

        {/* 体检明细 */}
        <p className="mb-2 mt-1 px-1 text-[11px] text-muted-foreground">各项体检明细</p>
        <div className="space-y-2">
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
                    <span className="text-[11px] text-muted-foreground">共 {s.items.length} 项</span>
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
                    <span className="text-xs text-muted-foreground transition group-open:rotate-180">▾</span>
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
                        <span className={`text-sm font-semibold ${valueColor[it.level]}`}>{it.value}</span>
                        <span className="text-[11px] text-muted-foreground">参考 {it.ref}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </details>
            );
          })}
        </div>
      </div>
    </div>
  );
}
