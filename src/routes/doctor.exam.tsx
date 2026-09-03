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
  const [filter, setFilter] = useState<Status | "全部" | "已检">("全部");
  const [q, setQ] = useState("");

  const counts = users.reduce<Record<string, number>>((acc, u) => {
    acc[u.status] = (acc[u.status] ?? 0) + 1;
    return acc;
  }, {});

  // 待检学生清单口径：待检 + 进行中（尚未完成体检）
  const pendingCount = (counts["待检"] ?? 0) + (counts["进行中"] ?? 0);
  const isDone = (s: Status) => s.startsWith("已检") || s === "需复核" || s === "方案确认";
  const doneCount = users.filter((u) => isDone(u.status)).length;

  const matchQueueFilter = (s: Status) => {
    if (filter === "全部") return true;
    if (filter === "已检") return isDone(s);
    return s === filter;
  };

  const list = users.filter((u) => {
    if (queueView ? !matchQueueFilter(u.status) : filter !== "全部" && u.status !== filter)
      return false;
    if (q && !(`${u.id}${u.name}`.includes(q))) return false;
    return true;
  });

  // 清单视图筛选项：待检 / 进行中 / 已检
  const filterTabs: (Status | "全部" | "已检")[] = queueView
    ? ["全部", "待检", "进行中", "已检"]
    : filters;


  const stats = [
    { label: "待检", value: counts["待检"] ?? 0, cls: "text-muted-foreground" },
    { label: "进行中", value: counts["进行中"] ?? 0, cls: "text-teal" },
    { label: "已检-正常", value: counts["已检-正常"] ?? 0, cls: "text-success" },
    { label: "已检-异常", value: counts["已检-异常"] ?? 0, cls: "text-warm" },
    { label: "需复核", value: counts["需复核"] ?? 0, cls: "text-danger" },
    { label: "方案确认", value: counts["方案确认"] ?? 0, cls: "text-deep" },
  ];

  const [stationId, setStationId] = useState(CURRENT_STATION_ID);
  const station = findStation(stationId)!;
  const items = stationItems(station);
  const [scanOpen, setScanOpen] = useState(false);
  const navigate = useNavigate();
  const firstPending = users.find((u) => u.status === "待检" || u.status === "进行中");

  return (
    <div>
      <StatusBar title={queueView ? "体检录入" : "用户"} />
      <div className="px-5 pb-8 pt-2">
        <div className="mb-3">
          <h1 className="text-xl font-bold">{queueView ? "体检录入" : "用户"}</h1>
          <p className="text-xs text-muted-foreground">
            {queueView
              ? `阳光小学 · 三年级 3 班 · ${pendingCount} 人待检`
              : `阳光小学 · 三年级 3 班 · 共 ${users.length} 人`}
          </p>
        </div>

        {/* 设备账号 + 扫码入口 */}
        {queueView && (
          <div className="mb-3 overflow-hidden rounded-2xl bg-surface shadow-sm ring-1 ring-border/60">
            <div className="flex items-start gap-2 border-b border-border/60 p-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-deep/10 text-deep">
                <QrCode className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold">
                  {station.name}
                  <span className="ml-1.5 rounded bg-surface-2 px-1.5 py-0.5 text-[10px] font-normal text-muted-foreground">
                    {station.account}
                  </span>
                </p>
                <p className="mt-0.5 truncate text-[10.5px] text-muted-foreground">
                  绑定设备：{station.devices.join(" · ")} · {station.doctor}
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {items.map((it) => (
                    <span
                      key={it.id}
                      className="rounded-full bg-teal/12 px-2 py-0.5 text-[10px] text-teal"
                    >
                      {it.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-3">
              <button
                onClick={() => setScanOpen(true)}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-deep py-3.5 text-sm font-bold text-deep-foreground active:scale-[0.98]"
              >
                <ScanLine className="h-4.5 w-4.5" />
                扫码识别学生（二维码 / 条码）
              </button>
              <p className="mt-1.5 text-center text-[10px] text-muted-foreground">
                扫码 → 学生上机采集 → 医生核对设备读数 → 逐项确认 → 提交并同步
              </p>
              <div className="mt-2 flex gap-1.5 overflow-x-auto">
                {EXAM_STATIONS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setStationId(s.id)}
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[10.5px] ${
                      s.id === stationId
                        ? "bg-teal/15 text-teal ring-1 ring-teal/30"
                        : "bg-surface-2 text-muted-foreground"
                    }`}
                  >
                    切换账号 {s.account}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {scanOpen && (
          <ScanOverlay
            stationName={station.name}
            student={firstPending}
            onClose={() => setScanOpen(false)}
            onDone={(uid) =>
              navigate({ to: "/record/$id", params: { id: uid }, search: { station: stationId } })
            }
          />
        )}


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
                    search={{ station: stationId }}
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

/** 扫码识别学生（原型：模拟摄像头识别过程） */
function ScanOverlay({
  stationName,
  student,
  onClose,
  onDone,
}: {
  stationName: string;
  student?: (typeof users)[number];
  onClose: () => void;
  onDone: (uid: string) => void;
}) {
  const [phase, setPhase] = useState<"scanning" | "hit">("scanning");

  useEffect(() => {
    const t = setTimeout(() => setPhase("hit"), 1400);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-6">
      <div className="w-full max-w-[300px] rounded-3xl bg-surface p-4 shadow-2xl">
        <p className="text-center text-[13px] font-bold">扫码识别学生</p>
        <p className="mt-0.5 text-center text-[10.5px] text-muted-foreground">
          {stationName} · 对准学生健康卡二维码 / 条码
        </p>

        <div className="relative mx-auto mt-3 grid h-40 w-40 place-items-center overflow-hidden rounded-2xl bg-black/85">
          <QrCode className="h-16 w-16 text-white/25" />
          {phase === "scanning" ? (
            <span className="absolute left-0 right-0 top-0 h-0.5 animate-[bounce_1.2s_linear_infinite] bg-teal" />
          ) : (
            <span className="absolute inset-0 grid place-items-center bg-success/85 text-[13px] font-bold text-success-foreground">
              识别成功
            </span>
          )}
        </div>

        <div className="mt-3 rounded-2xl bg-surface-2 p-3 text-center">
          {phase === "scanning" || !student ? (
            <p className="text-[12px] text-muted-foreground">正在识别学生信息…</p>
          ) : (
            <>
              <p className="text-[14px] font-bold">{student.name}</p>
              <p className="mt-0.5 text-[10.5px] text-muted-foreground">
                {student.grade} · {student.age}岁{student.gender} · 学号 {student.id}
              </p>
            </>
          )}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            onClick={onClose}
            className="rounded-xl bg-surface-2 py-2.5 text-[12.5px] text-muted-foreground"
          >
            取消
          </button>
          <button
            disabled={phase !== "hit" || !student}
            onClick={() => student && onDone(student.id)}
            className="rounded-xl bg-teal py-2.5 text-[12.5px] font-bold text-teal-foreground disabled:opacity-40"
          >
            开始采集
          </button>
        </div>
      </div>
    </div>
  );
}
