import { createFileRoute, Link } from "@tanstack/react-router";
import { StatusBar } from "@/components/MobileFrame";
import { classSchedule } from "@/lib/mock-data";
import { useState } from "react";
import { toast } from "sonner";

import { EIcon } from "@/components/EIcon";
export const Route = createFileRoute("/school/today")({
  component: TodayPage,
});

const batches = [
  { name: "春季常规体检", org: "阳光社区卫生服务中心", date: "2025-03-15 ~ 03-22", status: "进行中" },
  { name: "口腔专项", org: "市口腔医院", date: "2025-04-08", status: "待启动" },
];

const items = ["身高体重", "视力", "口腔", "血压", "内科", "外科", "脊柱", "呼吸/过敏问卷"];

function TodayPage() {
  const [tab, setTab] = useState<"today" | "batch">("today");
  const [scheduleDay, setScheduleDay] = useState<"today" | "tomorrow">("today");
  const done = classSchedule.filter((c) => c.status === "已完成").length;
  const doing = classSchedule.filter((c) => c.status === "进行中").length;
  const wait = classSchedule.length - done - doing;

  return (
    <div>
      <StatusBar title="今日体检" />
      <div className="px-5 pb-8 pt-2">
        <h1 className="text-xl font-bold">今日体检</h1>
        <p className="mb-4 text-xs text-muted-foreground">现场协同 · 阳光小学</p>

        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setTab("today")}
            className={`flex-1 rounded-full py-1.5 text-xs ${tab === "today" ? "bg-teal text-teal-foreground" : "bg-surface ring-1 ring-border/60 text-muted-foreground"}`}
          >
            现场进度
          </button>
          <button
            onClick={() => setTab("batch")}
            className={`flex-1 rounded-full py-1.5 text-xs ${tab === "batch" ? "bg-teal text-teal-foreground" : "bg-surface ring-1 ring-border/60 text-muted-foreground"}`}
          >
            体检任务
          </button>
        </div>

        {tab === "today" ? (
          <>
            {/* 现场概览 */}
            <div className="mb-4 rounded-2xl bg-gradient-to-br from-teal to-deep p-4 text-white shadow-lg shadow-teal/20">
              <p className="text-xs opacity-90">当前：一年级 3 班 · 体检中</p>
              <div className="mt-2 grid grid-cols-4 gap-2 text-center">
                {[
                  { k: "已检", v: 36 },
                  { k: "未检", v: 6 },
                  { k: "缺检", v: 2 },
                  { k: "待复测", v: 1 },
                ].map((s) => (
                  <div key={s.k} className="rounded-xl bg-white/15 py-1.5 backdrop-blur">
                    <p className="text-base font-extrabold">{s.v}</p>
                    <p className="text-[10px] opacity-85">{s.k}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <button onClick={() => toast("正在呼叫体检负责人", { description: "阳光社区卫生服务中心 · 张主任 138****6688" })} className="flex-1 rounded-xl bg-white/25 py-1.5 text-[11px] backdrop-blur">{<EIcon e="📞" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />} 体检负责人</button>
                <button onClick={() => toast("正在呼叫校医", { description: "阳光小学医务室 · 李校医 139****2233" })} className="flex-1 rounded-xl bg-white/25 py-1.5 text-[11px] backdrop-blur">{<EIcon e="🏥" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />} 校医</button>
                <Link to="/school/abnormal" className="flex-1 rounded-xl bg-warm py-1.5 text-center text-[11px] font-medium text-warm-foreground">
                  {<EIcon e="🚨" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />} 上报
                </Link>
              </div>
            </div>

            {/* 3 段状态汇总 */}
            <div className="mb-3 grid grid-cols-3 gap-2">
              {[
                { k: "已完成班级", v: done, c: "success" },
                { k: "体检中", v: doing, c: "warm" },
                { k: "待到场", v: wait, c: "teal" },
              ].map((s) => (
                <div key={s.k} className="rounded-2xl bg-surface p-3 text-center shadow-sm ring-1 ring-border/60">
                  <p className={`text-lg font-extrabold text-${s.c}`}>{s.v}</p>
                  <p className="text-[11px] text-muted-foreground">{s.k}</p>
                </div>
              ))}
            </div>

            {/* 排程时间轴 */}
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold">班级排程时间轴</h2>
              <div className="flex gap-1">
                <button
                  onClick={() => setScheduleDay("today")}
                  className={`rounded-full px-3 py-1 text-[11px] ${scheduleDay === "today" ? "bg-teal/10 text-teal" : "bg-muted text-muted-foreground"}`}
                >
                  今日
                </button>
                <button
                  onClick={() => setScheduleDay("tomorrow")}
                  className={`rounded-full px-3 py-1 text-[11px] ${scheduleDay === "tomorrow" ? "bg-teal/10 text-teal" : "bg-muted text-muted-foreground"}`}
                >
                  明日
                </button>
              </div>
            </div>

            {scheduleDay === "tomorrow" ? (
              <div className="rounded-2xl border border-dashed border-border bg-surface p-6 text-center">
                <p className="text-sm font-medium text-muted-foreground">明日暂未排程</p>
                <p className="mt-1 text-[11px] text-muted-foreground">教育局批次确认后将自动生成班级时间轴</p>
                <button
                  onClick={() => toast.success("已提交明日排程申请", { description: "待体检机构确认后同步" })}
                  className="mt-3 rounded-full bg-teal px-4 py-1.5 text-[11px] font-medium text-teal-foreground"
                >
                  申请排程
                </button>
              </div>
            ) : (
            <div className="relative pl-6">
              <div className="absolute left-[9px] top-2 h-full w-0.5 bg-border" />
              <ul className="space-y-3">
                {classSchedule.map((c, i) => (
                  <li key={c.name} className="relative rounded-2xl bg-surface p-3 shadow-sm ring-1 ring-border/60">
                    <span
                      className={`absolute -left-[22px] top-4 grid h-4 w-4 place-items-center rounded-full ring-4 ring-surface-2 ${
                        c.status === "已完成" ? "bg-success" : c.status === "进行中" ? "bg-warm animate-pulse" : "bg-muted"
                      }`}
                    />
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold">{c.name}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {c.time} · {c.location} · {c.count} 人 · 带队 王老师
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] ${
                          c.status === "已完成"
                            ? "bg-success/15 text-success"
                            : c.status === "进行中"
                            ? "bg-warm/15 text-warm"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>
                    {i === 1 && (
                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={() => toast.success("已通知下个班级", { description: `${c.name} 完成后请二年级 1 班准备到场` })}
                          className="flex-1 rounded-xl bg-teal py-1.5 text-[11px] font-medium text-teal-foreground"
                        >
                          通知下个班
                        </button>
                        <button
                          onClick={() => toast("已标记延迟", { description: `${c.name} 顺延 15 分钟，已同步现场` })}
                          className="rounded-xl bg-surface-2 px-3 py-1.5 text-[11px]"
                        >
                          标记延迟
                        </button>
                        <Link to="/school/students" className="rounded-xl bg-surface-2 px-3 py-1.5 text-[11px]">名单</Link>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            )}
          </>
        ) : (
          <>
            <Link
              to="/school/students"
              className="mb-3 flex items-center justify-between rounded-2xl bg-gradient-to-br from-teal to-deep p-3 text-white shadow-sm"
            >
              <div className="text-left">
                <p className="text-sm font-semibold">{<EIcon e="⚡" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />} 一键同步本批次体检学生清单</p>
                <p className="mt-0.5 text-[11px] opacity-90">从教育局批次拉取最新名单至学生模块</p>
              </div>
              <span>→</span>
            </Link>
            {/* 教育局下发批次 */}
            <div className="space-y-3">
              {batches.map((b) => (
                <div key={b.name} className="overflow-hidden rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-border/60">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate text-sm font-semibold">{b.name}</h3>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] ${
                            b.status === "进行中" ? "bg-warm/15 text-warm" : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {b.status}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-muted-foreground">教育局下发 · {b.org}</p>
                      <p className="text-[11px] text-muted-foreground">{<EIcon e="📅" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />} {b.date}</p>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    {[
                      { k: "体检项目", v: "12 项" },
                      { k: "覆盖班级", v: "18 班" },
                      { k: "体检人数", v: "486" },
                    ].map((s) => (
                      <div key={s.k} className="rounded-xl bg-surface-2 py-1.5">
                        <p className="text-sm font-bold">{s.v}</p>
                        <p className="text-[10px] text-muted-foreground">{s.k}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* 体检项目 */}
            <div className="mt-4 rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-border/60">
              <p className="mb-2 text-sm font-semibold">本次体检项目</p>
              <div className="flex flex-wrap gap-1.5">
                {items.map((i) => (
                  <span key={i} className="rounded-full bg-teal/10 px-2.5 py-1 text-[11px] text-teal">{i}</span>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
