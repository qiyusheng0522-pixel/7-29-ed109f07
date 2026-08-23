import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { EIcon } from "@/components/EIcon";
import { StatusBar } from "@/components/MobileFrame";
import {
  FIT_ITEMS,
  GRADE_STYLE,
  PE_CLASSES,
  PE_TEACHER,
  fitStudents,
  gradeOf,
  overallGrade,
  type FitStudent,
} from "@/lib/fitness";

export const Route = createFileRoute("/school/fitness")({
  head: () => ({
    meta: [
      { title: "体适能测试录入 · 阳光校园健康" },
      { name: "description", content: "体育老师按班级录入学生体适能测试成绩，自动评定等级并同步至健康档案。" },
      { property: "og:title", content: "体适能测试录入 · 阳光校园健康" },
      { property: "og:description", content: "体育老师按班级录入学生体适能测试成绩，自动评定等级并同步至健康档案。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: FitnessPage,
});

type ScoreMap = Record<string, Record<string, string>>;

function FitnessPage() {
  const [cls, setCls] = useState<string>(PE_CLASSES[0]);
  const [open, setOpen] = useState<string | null>(null);
  const [scores, setScores] = useState<ScoreMap>(() =>
    Object.fromEntries(fitStudents.map((s) => [s.id, { ...(s.scores ?? {}) }])),
  );
  const [synced, setSynced] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(fitStudents.filter((s) => s.scores).map((s) => [s.id, true])),
  );

  const list = useMemo(() => fitStudents.filter((s) => s.cls === cls), [cls]);

  const gradesOf = (s: FitStudent) =>
    FIT_ITEMS.map((it) => gradeOf(it, s.gender, scores[s.id]?.[it.key] ?? ""));

  const doneCount = list.filter((s) => gradesOf(s).every(Boolean)).length;

  const setVal = (id: string, key: string, v: string) =>
    setScores((m) => ({ ...m, [id]: { ...m[id], [key]: v } }));

  const submit = (s: FitStudent) => {
    const gs = gradesOf(s);
    if (gs.some((g) => !g)) {
      toast.error("成绩未填完整", { description: "请录入全部 6 项后再同步档案" });
      return;
    }
    setSynced((m) => ({ ...m, [s.id]: true }));
    setOpen(null);
    toast.success(`${s.name} 体适能成绩已同步`, {
      description: `综合评定 ${overallGrade(gs)} · 已写入健康档案，家长端可查看`,
    });
  };

  return (
    <div>
      <StatusBar title="体适能录入" />
      <div className="px-5 pb-6 pt-2">
        <h1 className="text-xl font-bold">体适能测试录入</h1>
        <p className="mb-3 text-xs text-muted-foreground">
          体育老师 {PE_TEACHER} · 春季体质测试 · 成绩将并入孩子健康档案
        </p>

        {/* 班级切换 */}
        <div className="mb-3 flex gap-1 rounded-full bg-surface-2 p-1 ring-1 ring-border/60">
          {PE_CLASSES.map((c) => (
            <button
              key={c}
              onClick={() => {
                setCls(c);
                setOpen(null);
              }}
              className={`flex-1 rounded-full py-1.5 text-[12px] font-medium transition ${
                cls === c ? "bg-teal text-teal-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* 进度 */}
        <div className="mb-4 rounded-2xl bg-gradient-to-br from-teal/12 to-deep/10 p-3.5 ring-1 ring-teal/20">
          <p className="text-[11px] text-muted-foreground">{cls} 录入进度</p>
          <p className="mt-1 flex items-baseline gap-1 text-[24px] font-extrabold leading-none text-teal">
            {doneCount}
            <span className="text-[12px] font-medium text-muted-foreground">/ {list.length} 人已完成</span>
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            测试项目：50 米跑 · 坐位体前屈 · 立定跳远 · 跳绳 · 仰卧起坐 · 肺活量
          </p>
        </div>

        <ul className="space-y-2.5">
          {list.map((s) => {
            const gs = gradesOf(s);
            const all = overallGrade(gs);
            const complete = gs.every(Boolean);
            const expanded = open === s.id;
            return (
              <li key={s.id} className="overflow-hidden rounded-2xl bg-surface shadow-sm ring-1 ring-border/60">
                <button
                  onClick={() => setOpen(expanded ? null : s.id)}
                  className="flex w-full items-center gap-2.5 p-3 text-left"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-teal/15 text-sm font-bold text-teal">
                    {s.name.slice(-1)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">
                      {s.name}
                      <span className="ml-2 text-[11px] font-normal text-muted-foreground">
                        {s.gender} · 学号 {s.id}
                      </span>
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {complete
                        ? synced[s.id]
                          ? "已同步健康档案"
                          : "成绩已填写，待同步"
                        : `待录入 ${gs.filter((g) => !g).length} 项`}
                    </p>
                  </div>
                  {all && complete ? (
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${GRADE_STYLE[all]}`}>
                      {all}
                    </span>
                  ) : (
                    <span className="shrink-0 rounded-full bg-surface-2 px-2 py-0.5 text-[10px] text-muted-foreground">
                      待录入
                    </span>
                  )}
                </button>

                {expanded && (
                  <div className="border-t border-border/60 bg-surface-2/40 p-3">
                    <div className="space-y-2">
                      {FIT_ITEMS.map((it, i) => {
                        const val = scores[s.id]?.[it.key] ?? "";
                        const g = gs[i];
                        return (
                          <div key={it.key} className="rounded-xl bg-surface p-2.5 ring-1 ring-border/60">
                            <div className="flex items-center gap-2">
                              <span className="text-[15px]">
                                <EIcon e={it.icon} />
                              </span>
                              <p className="flex-1 text-[13px] font-medium">{it.label}</p>
                              {g && (
                                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${GRADE_STYLE[g]}`}>
                                  {g}
                                </span>
                              )}
                            </div>
                            <div className="mt-2 flex items-center gap-2">
                              <input
                                inputMode="decimal"
                                value={val}
                                onChange={(e) => setVal(s.id, it.key, e.target.value)}
                                placeholder="请输入成绩"
                                className="min-w-0 flex-1 rounded-lg bg-surface-2 px-2.5 py-1.5 text-[13px] outline-none ring-1 ring-border/60 focus:ring-teal"
                              />
                              <span className="shrink-0 text-[11px] text-muted-foreground">{it.unit}</span>
                            </div>
                            <p className="mt-1.5 text-[10px] text-muted-foreground/80">
                              {s.gender}生标准：及格 {it.cut[s.gender].pass} · 良好 {it.cut[s.gender].good} · 优秀{" "}
                              {it.cut[s.gender].great} {it.unit}
                              {it.lowerBetter ? "（用时越少越好）" : ""}
                            </p>
                            <p className="mt-0.5 text-[10px] text-muted-foreground/70">操作要点：{it.tip}</p>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => submit(s)}
                        className="flex-1 rounded-xl bg-teal py-2.5 text-[13px] font-semibold text-teal-foreground transition active:scale-[0.98]"
                      >
                        保存并同步健康档案
                      </button>
                      <button
                        onClick={() => setOpen(null)}
                        className="rounded-xl bg-surface-2 px-3 text-[12px] text-muted-foreground"
                      >
                        收起
                      </button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
