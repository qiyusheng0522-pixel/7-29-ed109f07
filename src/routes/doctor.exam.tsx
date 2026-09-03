import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { StatusBar } from "@/components/MobileFrame";
import { useEffect, useState } from "react";
import { EXAM_USERS as users, type ExamStatus as Status } from "@/lib/exam-users";
import {
  CURRENT_STATION_ID,
  EXAM_STATIONS,
  findStation,
  stationItems,
} from "@/lib/exam-stations";
import { ScanLine, QrCode } from "lucide-react";

import { EIcon } from "@/components/EIcon";
export const Route = createFileRoute("/doctor/exam")({
  validateSearch: (search: Record<string, unknown>): { view?: "queue" } => ({
    view: search.view === "queue" ? "queue" : undefined,
  }),
  component: UsersPage,
});


const statusStyle: Record<Status, string> = {
  待检: "bg-muted text-muted-foreground",
  进行中: "bg-teal/15 text-teal",
  "已检-正常": "bg-success/15 text-success",
  "已检-异常": "bg-warm/15 text-warm",
  需复核: "bg-danger/10 text-danger",
  方案确认: "bg-deep/10 text-deep",
};

const filters: (Status | "全部")[] = ["全部", "待检", "进行中", "已检-正常", "已检-异常", "需复核", "方案确认"];

function UsersPage() {
  const { view } = Route.useSearch();
  const queueView = view === "queue";
  const [filter, setFilter] = useState<Status | "全部">("全部");
  const [q, setQ] = useState("");

  const counts = users.reduce<Record<string, number>>((acc, u) => {
    acc[u.status] = (acc[u.status] ?? 0) + 1;
    return acc;
  }, {});

  // 待检学生清单口径：待检 + 进行中（尚未完成体检）
  const pendingCount = (counts["待检"] ?? 0) + (counts["进行中"] ?? 0);
  const isPending = (s: Status) => s === "待检" || s === "进行中";

  const list = users.filter((u) => {
    if (queueView && !isPending(u.status)) return false;
    if (filter !== "全部" && u.status !== filter) return false;
    if (q && !(`${u.id}${u.name}`.includes(q))) return false;
    return true;
  });

  // 清单视图只保留与"待检"相关的筛选项
  const filterTabs: (Status | "全部")[] = queueView
    ? ["全部", "待检", "进行中"]
    : filters;

  const stats = [
    { label: "待检", value: counts["待检"] ?? 0, cls: "text-muted-foreground" },
    { label: "进行中", value: counts["进行中"] ?? 0, cls: "text-teal" },
    { label: "已检-正常", value: counts["已检-正常"] ?? 0, cls: "text-success" },
    { label: "已检-异常", value: counts["已检-异常"] ?? 0, cls: "text-warm" },
    { label: "需复核", value: counts["需复核"] ?? 0, cls: "text-danger" },
    { label: "方案确认", value: counts["方案确认"] ?? 0, cls: "text-deep" },
  ];

  return (
    <div>
      <StatusBar title={queueView ? "待检学生清单" : "用户"} />
      <div className="px-5 pb-8 pt-2">
        <div className="mb-3">
          <h1 className="text-xl font-bold">{queueView ? "待检学生清单" : "用户"}</h1>
          <p className="text-xs text-muted-foreground">
            {queueView
              ? `阳光小学 · 三年级 3 班 · ${pendingCount} 人待检`
              : `阳光小学 · 三年级 3 班 · 共 ${users.length} 人`}
          </p>
        </div>

        {/* 状态概览（完整用户视图） */}
        {!queueView && (
          <div className="mb-3 grid grid-cols-6 gap-1 rounded-2xl bg-surface p-3 shadow-sm ring-1 ring-border/60">
            {stats.map((s) => (
              <button
                key={s.label}
                onClick={() => setFilter(s.label as Status)}
                className="text-center"
              >
                <p className={`text-base font-bold ${s.cls}`}>{s.value}</p>
                <p className="mt-0.5 text-[9px] text-muted-foreground">{s.label}</p>
              </button>
            ))}
          </div>
        )}

        {/* 搜索 */}
        <div className="mb-3 flex items-center gap-2 rounded-full bg-surface px-4 py-2 shadow-sm ring-1 ring-border/60">
          <span className="text-muted-foreground">{<EIcon e="🔍" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />}</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜索姓名 / 学号"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        {/* 筛选 tab */}
        <div className="mb-3 -mx-1 flex gap-1.5 overflow-x-auto px-1">
          {filterTabs.map((f) => {
            const on = f === filter;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`shrink-0 rounded-full px-3 py-1 text-[12px] ${
                  on
                    ? "bg-deep text-deep-foreground"
                    : "bg-surface text-muted-foreground ring-1 ring-border/60"
                }`}
              >
                {f}
                {f !== "全部" && (
                  <span className="ml-1 opacity-70">{counts[f] ?? 0}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* 用户列表 */}
        <ul className="space-y-2">
          {list.length === 0 && (
            <li className="rounded-xl bg-surface-2 p-6 text-center text-xs text-muted-foreground">
              暂无用户
            </li>
          )}
          {list.map((u) => {
            const content = (
              <div className="flex items-center gap-3 rounded-2xl bg-surface p-3 shadow-sm ring-1 ring-border/60">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-deep/10 text-sm font-bold text-deep">
                  {u.name.slice(-1)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {u.name}
                    <span className="ml-2 text-[11px] font-normal text-muted-foreground">
                      {u.grade} · {u.age}岁{u.gender}
                    </span>
                  </p>
                  {u.tags && u.tags.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {u.tags.map((t) => (
                        <span key={t} className="rounded bg-surface-2 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="mt-1 truncate text-[11px] text-muted-foreground">
                    {u.note || `学号 ${u.id}`}
                  </p>
                  {u.status === "进行中" && u.progress && (
                    <div className="mt-1.5">
                      <div className="flex items-center justify-between text-[10px] text-teal">
                        <span>正在采集：{u.progress.current}</span>
                        <span>{u.progress.done}/{u.progress.total}</span>
                      </div>
                      <div className="mt-1 h-1 overflow-hidden rounded-full bg-surface-2">
                        <div className="h-full rounded-full bg-teal" style={{ width: `${(u.progress.done / u.progress.total) * 100}%` }} />
                      </div>
                    </div>
                  )}
                  {u.status === "待检" && u.eta && (
                    <p className="mt-1 text-[10px] text-warm">⏱ {u.eta}</p>
                  )}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] ${statusStyle[u.status]}`}>
                    {u.status}
                  </span>
                  {u.to && <span className="text-xs text-muted-foreground">›</span>}
                </div>
              </div>
            );
            return (
              <li key={u.id}>
                {u.to ? (
                  <Link to={u.to} className="block">
                    {content}
                  </Link>
                ) : (
                  <Link
                    to="/record/$id"
                    params={{ id: u.id }}
                    className="block"
                  >
                    {content}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
