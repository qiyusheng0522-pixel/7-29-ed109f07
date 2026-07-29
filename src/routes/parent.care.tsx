import { createFileRoute } from "@tanstack/react-router";
import { todayTasks } from "@/lib/mock-data";
import { StatusBar } from "@/components/MobileFrame";
import { ActionSheet } from "@/components/ActionSheet";
import { useMemo, useState } from "react";

import { EIcon } from "@/components/EIcon";
export const Route = createFileRoute("/parent/care")({
  component: CarePage,
});

type Reminder = {
  id: string;
  icon: import("react").ReactNode;
  title: string;
  tag: string;
  cycleDays: number; // 提醒周期（天）
  lastDone: string; // 上次完成日期 YYYY-MM-DD
  needsInput?: "weight"; // 到期需要用户输入
  unit?: string;
  passive?: boolean; // 仅提醒、无需标记完成（如通风、补剂等日常习惯）
};

// 今天固定用一个基准日，示例中"晨起体重记录"恰好当天到期
const TODAY = "2026-04-08";
const daysAgo = (n: number) => {
  const d = new Date(TODAY);
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};

const initialReminders: Reminder[] = [
  { id: "weight", icon: <EIcon e="⚖️" />, title: "晨起体重记录", tag: "体重管理", cycleDays: 7, lastDone: daysAgo(7), needsInput: "weight", unit: "kg" },
  { id: "bed", icon: <EIcon e="🛏️" />, title: "床品除螨清洗", tag: "过敏防护", cycleDays: 14, lastDone: daysAgo(9) },
  { id: "vent", icon: <EIcon e="🪟" />, title: "开窗通风换气", tag: "通风湿度", cycleDays: 1, lastDone: daysAgo(1), passive: true },
  { id: "humid", icon: <EIcon e="💧" />, title: "空气加湿器换水", tag: "呼吸道", cycleDays: 3, lastDone: daysAgo(1) },
  { id: "brush", icon: <EIcon e="🦷" />, title: "儿童牙刷更换", tag: "口腔", cycleDays: 90, lastDone: daysAgo(46) },
  { id: "vitd", icon: <EIcon e="☀️" />, title: "维生素 D 补充", tag: "营养", cycleDays: 1, lastDone: daysAgo(1), passive: true },
];

const dayDiff = (a: string, b: string) => {
  const ms = new Date(b).getTime() - new Date(a).getTime();
  return Math.round(ms / 86400000);
};

function CarePage() {
  const [tab, setTab] = useState<"今日" | "本周">("今日");
  const [reminders, setReminders] = useState(initialReminders);
  const done = todayTasks.filter((t) => t.done).length;

  // 仅统计"需要操作"的到期任务，纯提醒项不计入
  const dueToday = useMemo(
    () => reminders.filter((r) => !r.passive && dayDiff(r.lastDone, TODAY) >= r.cycleDays),
    [reminders],
  );

  const updateReminder = (id: string, patch: Partial<Reminder>) =>
    setReminders((s) => s.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  return (
    <div>
      <StatusBar title="儿童呵护" />
      <div className="px-5 pb-8 pt-2">
        <header className="mb-4 flex items-end justify-between">
          <div>
            <h1 className="text-xl font-bold">呵护中心</h1>
            <p className="text-xs text-muted-foreground">
              连续执行 12 天 · 本周完成率 78%
            </p>
          </div>
          <span className="text-3xl">{<EIcon e="💗" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />}</span>
        </header>

        {/* Tabs */}
        <div className="mb-4 inline-flex rounded-full bg-muted p-1 text-xs">
          {(["今日", "本周"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-full px-4 py-1.5 transition ${
                tab === t ? "bg-surface font-semibold text-warm shadow-sm" : "text-muted-foreground"
              }`}
            >
              {t}呵护
            </button>
          ))}
        </div>

        {/* Progress card */}
        <div className="mb-5 rounded-3xl bg-gradient-to-br from-warm to-teal p-5 text-white shadow-lg shadow-warm/20">
          <p className="text-xs opacity-90">{tab}任务完成</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold">{done}</span>
            <span className="text-sm opacity-80">/ {todayTasks.length} 项</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/25">
            <div
              className="h-full rounded-full bg-white"
              style={{ width: `${(done / todayTasks.length) * 100}%` }}
            />
          </div>
        </div>

        {/* 居家健康提醒 */}
        <div className="mb-5 rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-border/60">
          <div className="mb-2">
            <h2 className="text-sm font-semibold">居家健康提醒</h2>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              带“待完成”的为需操作事项，今日到期 {dueToday.length} 项；其余仅作日常提醒
            </p>
          </div>
          <ul className="space-y-2">
            {reminders.map((r) => {
              const daysSince = dayDiff(r.lastDone, TODAY);
              const daysLeft = r.cycleDays - daysSince;
              const isDue = !r.passive && daysLeft <= 0;
              return (
                <li
                  key={r.id}
                  className={`rounded-xl p-2.5 ring-1 ${
                    isDue ? "bg-warm/10 ring-warm/30" : "bg-surface-2 ring-border/60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-lg ring-1 ring-border">
                      {r.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="truncate text-[13px] font-semibold">{r.title}</p>
                        <span className="shrink-0 rounded-full bg-warm/10 px-1.5 py-0.5 text-[10px] text-warm">
                          {r.tag}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {r.passive ? (
                          <span>
                            {r.cycleDays <= 1 ? "每日" : `每 ${r.cycleDays} 天`}提醒 · 养成习惯即可，无需打卡
                          </span>
                        ) : (
                          <>
                            每 {r.cycleDays} 天 · 上次 {r.lastDone}
                            {isDue ? (
                              <span className="ml-1 font-medium text-warm">· 今日到期</span>
                            ) : (
                              <span className="ml-1">· {daysLeft} 天后</span>
                            )}
                          </>
                        )}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      {r.passive ? (
                        // 纯提醒项：不需要"标为完成"，只给一个提示标记
                        <span className="rounded-full bg-surface px-2.5 py-1 text-[11px] text-muted-foreground ring-1 ring-border">
                          仅提醒
                        </span>
                      ) : (
                        <>
                          {r.needsInput === "weight" && isDue ? (
                            <WeightSheet
                              onSave={(w) => {
                                updateReminder(r.id, { lastDone: TODAY });
                                console.log("weight", w);
                              }}
                            />
                          ) : (
                            <button
                              onClick={() => updateReminder(r.id, { lastDone: TODAY })}
                              className={`rounded-full px-2.5 py-1 text-[11px] ${
                                isDue
                                  ? "bg-warm text-warm-foreground"
                                  : "bg-surface text-muted-foreground ring-1 ring-border"
                              }`}
                            >
                              {isDue ? "标为完成" : "已完成"}
                            </button>
                          )}
                          <EditSheet
                            reminder={r}
                            onSave={(patch) => updateReminder(r.id, patch)}
                          />
                        </>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

function EditSheet({
  reminder,
  onSave,
}: {
  reminder: Reminder;
  onSave: (patch: Partial<Reminder>) => void;
}) {
  const [cycle, setCycle] = useState(String(reminder.cycleDays));
  const [last, setLast] = useState(reminder.lastDone);
  return (
    <ActionSheet
      trigger={
        <button className="text-[10px] text-muted-foreground underline underline-offset-2">
          编辑
        </button>
      }
      title={`编辑「${reminder.title}」`}
      description="调整提醒周期与上次完成时间"
      confirmText="保存"
      toastMessage="已更新提醒设置"
      onConfirm={() => {
        const n = Math.max(1, parseInt(cycle, 10) || reminder.cycleDays);
        onSave({ cycleDays: n, lastDone: last });
      }}
    >
      <div className="space-y-3 py-2 text-xs">
        <label className="block">
          <span className="text-muted-foreground">提醒周期（天）</span>
          <input
            type="number"
            min={1}
            value={cycle}
            onChange={(e) => setCycle(e.target.value)}
            className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="text-muted-foreground">上次完成日期</span>
          <input
            type="date"
            value={last}
            onChange={(e) => setLast(e.target.value)}
            className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
          />
        </label>
      </div>
    </ActionSheet>
  );
}

function WeightSheet({ onSave }: { onSave: (w: number) => void }) {
  const [weight, setWeight] = useState("");
  return (
    <ActionSheet
      trigger={
        <button className="rounded-full bg-warm px-2.5 py-1 text-[11px] font-medium text-warm-foreground">
          记录体重
        </button>
      }
      title="记录今日体重"
      description="录入后将同步至成长曲线，用于评估体重管理进度"
      confirmText="保存"
      toastMessage="本周体重已记录 "
      onConfirm={() => {
        const n = parseFloat(weight);
        if (!isNaN(n)) onSave(n);
      }}
    >
      <div className="py-2">
        <label className="block text-xs">
          <span className="text-muted-foreground">体重 (kg)</span>
          <input
            type="number"
            step="0.1"
            inputMode="decimal"
            placeholder="例如 32.5"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2 text-base"
          />
        </label>
        <p className="mt-2 text-[11px] text-muted-foreground">
          建议晨起排空后测量，穿轻便衣物。
        </p>
      </div>
    </ActionSheet>
  );
}
