import { createFileRoute } from "@tanstack/react-router";
import { StatusBar } from "@/components/MobileFrame";
import { EIcon } from "@/components/EIcon";
import { ActionSheet } from "@/components/ActionSheet";
import { toast } from "sonner";
import { findPatient, type Level } from "@/lib/community-patients";
import {
  User2,
  Phone,
  ClipboardList,
  Footprints,
  Moon,
  HeartPulse,
  Flame,
} from "lucide-react";

export const Route = createFileRoute("/community/patient/$id")({
  component: PatientProfilePage,
});

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
const metricTint: Record<Level, string> = {
  ok: "bg-surface-2",
  warn: "bg-warning/10 ring-1 ring-warning/25",
  bad: "bg-danger/10 ring-1 ring-danger/25",
};

function PatientProfilePage() {
  const { id } = Route.useParams();
  const p = findPatient(id);

  if (!p) {
    return (
      <div>
        <StatusBar title="居民健康档案" />
        <div className="px-5 pb-8 pt-10 text-center">
          <p className="text-sm text-muted-foreground">未找到该患者档案</p>
        </div>
      </div>
    );
  }

  const u = p.uploads;
  const initial = p.name.slice(-1);

  return (
    <div>
      <StatusBar title="儿童健康档案" />
      <div className="px-5 pb-8 pt-2">
        {/* 身份卡 */}
        <section className="mb-3 overflow-hidden rounded-2xl bg-gradient-to-br from-warm/12 via-surface to-teal/10 p-4 shadow-sm ring-1 ring-border/60">
          <div className="flex items-center gap-3">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-warm/15 text-lg font-bold text-warm ring-1 ring-warm/30">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <h1 className="truncate text-lg font-bold">{p.name}</h1>
                <span className="text-[11px] text-muted-foreground">
                  {p.gender} · {p.age} 岁
                </span>
                <span
                  className={`ml-auto shrink-0 rounded-full px-2 py-0.5 text-[10px] ${
                    p.src === "服务包" ? "bg-warm/15 text-warm" : "bg-teal/15 text-teal"
                  }`}
                >
                  {p.src}
                </span>
              </div>
              <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                <User2 className="h-3 w-3" /> 监护人 {p.guardian.relation} · {p.guardian.name}
                <span className="mx-1">·</span>
                <Phone className="h-3 w-3" /> {p.guardian.phone}
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{p.from}</p>
            </div>
          </div>

          <div className="mt-3 rounded-xl bg-surface/70 p-2.5 ring-1 ring-border/40">
            <p className="text-[12px] font-medium">{p.plan}</p>
            <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>{p.planStage}</span>
              <span
                className={
                  p.adherence >= 80 ? "text-teal" : p.adherence >= 60 ? "text-warm" : "text-rose"
                }
              >
                执行率 {p.adherence}%
              </span>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">下次任务：{p.next}</p>
          </div>
        </section>

        {/* ============ 家长 / 儿童上传数据 ============ */}
        <SectionHeader
          icon="📲"
          title="家长 / 儿童上传"
          note={`打卡 ${u.checkin.days} 天 · 最近 ${u.checkin.lastAt}`}
        />

        {/* 打卡概况 */}
        <div className="mb-3 grid grid-cols-2 gap-2">
          <div className="rounded-2xl bg-success/10 p-3 ring-1 ring-success/20">
            <p className="text-[11px] text-muted-foreground">饮食打卡</p>
            <p className="mt-0.5 text-lg font-bold text-success">
              {u.checkin.diet}
              <span className="ml-1 text-[11px] font-normal text-muted-foreground">/ {u.checkin.days} 天</span>
            </p>
          </div>
          <div className="rounded-2xl bg-warm/10 p-3 ring-1 ring-warm/20">
            <p className="text-[11px] text-muted-foreground">运动打卡</p>
            <p className="mt-0.5 text-lg font-bold text-warm">
              {u.checkin.exercise}
              <span className="ml-1 text-[11px] font-normal text-muted-foreground">/ {u.checkin.days} 天</span>
            </p>
          </div>
        </div>

        {/* 关键指标 */}
        <div className="mb-3 grid grid-cols-2 gap-2">
          {u.metrics.map((m) => (
            <div key={m.label} className={`rounded-2xl p-3 ${metricTint[m.level]}`}>
              <p className="text-[11px] text-muted-foreground">{m.label}</p>
              <p className={`mt-0.5 text-base font-bold ${valueColor[m.level]}`}>{m.value}</p>
              <p className="text-[10px] text-muted-foreground">{m.sub}</p>
            </div>
          ))}
        </div>

        {/* 体重 / BMI 趋势 */}
        <div className="mb-3 rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-border/60">
          <p className="mb-2 text-[12px] font-semibold">
            体重 / BMI 趋势
            <span className="ml-1 text-[10px] font-normal text-muted-foreground">家长上传体脂秤数据 · 近 6 次</span>
          </p>
          <div className="grid grid-cols-2 gap-3">
            <MiniChart label="体重 kg" data={u.weightTrend} color="warm" />
            <MiniChart label="BMI" data={u.bmiTrend} color="teal" />
          </div>
        </div>

        {/* 儿童手表 / 手环 */}
        <div className="mb-3 rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-border/60">
          <p className="mb-2 text-[12px] font-semibold">
            儿童手表 / 手环
            <span className="ml-1 text-[10px] font-normal text-muted-foreground">自动同步</span>
          </p>
          <ul className="grid grid-cols-2 gap-2 text-[12px]">
            <WatchItem icon={Footprints} label="步数" value={u.watch.steps} />
            <WatchItem icon={Moon} label="睡眠" value={u.watch.sleep} />
            <WatchItem icon={HeartPulse} label="心率" value={u.watch.heartRate} />
            <WatchItem icon={Flame} label="活动" value={u.watch.active} />
          </ul>
        </div>

        {/* 用药依从（复诊转入） */}
        {u.medication ? (
          <div className="mb-3 rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-border/60">
            <p className="mb-1 text-[12px] font-semibold">用药依从</p>
            <p className="text-[13px] font-medium">{u.medication.name}</p>
            <p className="mt-0.5 text-[12px] text-rose">{u.medication.adherence}</p>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{u.medication.note}</p>
          </div>
        ) : null}

        {/* 家长手记 */}
        <div className="mb-4 rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-border/60">
          <p className="mb-2 text-[12px] font-semibold">家长手记</p>
          <ul className="space-y-2">
            {u.parentNotes.map((n) => (
              <li key={n.date} className="flex gap-2 text-[12px]">
                <span className="shrink-0 rounded bg-surface-2 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                  {n.date}
                </span>
                <span className="leading-relaxed text-pretty text-muted-foreground">{n.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* ============ 体检数据 ============ */}
        <SectionHeader
          icon="🏥"
          title="体检数据"
          note={`${p.exam.date} · ${p.exam.org}`}
        />

        {/* 体检结论 */}
        <section className="mb-3 rounded-2xl bg-warm/10 p-4 ring-1 ring-warm/30">
          <div className="mb-1 flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-warm/20 text-[12px]">
              {<EIcon e="⚕" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />}
            </span>
            <p className="text-[13px] font-semibold text-warm">本次体检结论 · {p.exam.abnormal} 项异常</p>
          </div>
          <p className="text-[12px] leading-relaxed text-muted-foreground text-pretty">{p.exam.conclusion}</p>
        </section>

        {/* 体检明细 */}
        <p className="mb-2 px-1 text-[11px] text-muted-foreground">各项体检明细 · 点击展开</p>
        <div className="mb-4 space-y-2">
          {p.exam.sections.map((s) => {
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

        {/* 社区端操作 */}
        <div className="grid grid-cols-2 gap-3">
          <ActionSheet
            trigger={
              <button
                type="button"
                className="flex w-full items-center justify-center gap-1.5 rounded-2xl bg-teal py-3 text-sm font-semibold text-teal-foreground shadow-sm"
              >
                <ClipboardList className="h-4 w-4" /> 记录随访
              </button>
            }
            title={`记录 ${p.name} 的随访`}
            description="填写本次随访情况，保存后同步至患者档案与医生端。"
            confirmText="保存随访"
            toastMessage="随访记录已保存"
          >
            <div className="space-y-2 text-xs">
              <label className="block">
                <span className="text-muted-foreground">随访方式</span>
                <select className="mt-1 w-full rounded-xl bg-surface-2 px-3 py-2 outline-none">
                  <option>电话随访</option><option>上门访视</option><option>线上咨询</option>
                </select>
              </label>
              <label className="block">
                <span className="text-muted-foreground">随访记录</span>
                <textarea rows={3} placeholder="如：家长反馈打卡执行良好，体重较上周下降 0.3kg" className="mt-1 w-full rounded-xl bg-surface-2 px-3 py-2 outline-none" />
              </label>
            </div>
          </ActionSheet>
          <button
            type="button"
            onClick={() => toast(`正在联系 ${p.name} 家长`, { description: "已发起电话呼叫" })}
            className="flex items-center justify-center gap-1.5 rounded-2xl bg-surface py-3 text-sm font-semibold text-warm ring-1 ring-warm/40"
          >
            <Phone className="h-4 w-4" /> 联系家长
          </button>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ icon, title, note }: { icon: string; title: string; note: string }) {
  return (
    <div className="mb-2 mt-1 flex items-center gap-2">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-surface-2 text-[13px]">
        {<EIcon e={icon} className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />}
      </span>
      <div className="min-w-0">
        <h2 className="text-sm font-bold">{title}</h2>
        <p className="truncate text-[10.5px] text-muted-foreground">{note}</p>
      </div>
    </div>
  );
}

function WatchItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Footprints;
  label: string;
  value: string;
}) {
  return (
    <li className="flex items-center gap-2 rounded-xl bg-surface-2 px-2.5 py-2">
      <Icon className="h-4 w-4 shrink-0 text-teal" />
      <div className="min-w-0">
        <p className="text-[10px] text-muted-foreground">{label}</p>
        <p className="truncate font-medium">{value}</p>
      </div>
    </li>
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
        <polyline
          points={points}
          fill="none"
          stroke={stroke}
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
