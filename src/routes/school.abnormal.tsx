import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { StatusBar } from "@/components/MobileFrame";
import { ActionSheet } from "@/components/ActionSheet";
import { useState } from "react";

import { EIcon } from "@/components/EIcon";
export const Route = createFileRoute("/school/abnormal")({
  component: AbnormalPage,
});

const types = [
  { key: "体检重大异常", icon: <EIcon e="⚠️" />, tint: "warning" },
  { key: "运动后胸闷/喘息", icon: <EIcon e="🏃" />, tint: "warm" },
  { key: "呼吸不适", icon: <EIcon e="🌬️" />, tint: "teal" },
  { key: "疑似过敏反应", icon: <EIcon e="🤧" />, tint: "danger" },
  { key: "头晕/晕厥", icon: <EIcon e="💫" />, tint: "deep" },
  { key: "复检未到场", icon: <EIcon e="📋" />, tint: "muted-foreground" },
] as const;

const flows = [
  { key: "仅记录", desc: "仅本校留档" },
  { key: "提交校医", desc: "校医接手观察" },
  { key: "升级健管师", desc: "健康管理师介入" },
  { key: "升级医生", desc: "急性/严重风险" },
] as const;

function AbnormalPage() {
  const nav = useNavigate();
  const [step, setStep] = useState(1);
  const [type, setType] = useState<string>("");
  const [who, setWho] = useState("");
  const [cls, setCls] = useState("");
  const [desc, setDesc] = useState("");
  const [flow, setFlow] = useState<string>("");

  return (
    <div>
      <StatusBar title="异常上报" />
      <div className="px-5 pt-2">
        <div className="mb-1 flex items-center gap-2">
          <button onClick={() => (step > 1 ? setStep(step - 1) : nav({ to: "/school" }))} className="text-lg text-muted-foreground">
            ‹
          </button>
          <h1 className="text-xl font-bold">异常上报</h1>
        </div>

        {/* 步骤条 */}
        <div className="mb-4 flex items-center gap-2 text-[11px]">
          {["选类型", "填信息", "选流转"].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <span
                className={`grid h-5 w-5 place-items-center rounded-full ${
                  step === i + 1 ? "bg-warm text-warm-foreground" : step > i + 1 ? "bg-success text-white" : "bg-surface-2 text-muted-foreground"
                }`}
              >
                {step > i + 1 ? "" : i + 1}
              </span>
              <span className={step >= i + 1 ? "" : "text-muted-foreground"}>{s}</span>
              {i < 2 && <span className="text-muted-foreground">—</span>}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="grid grid-cols-2 gap-2">
            {types.map((t) => (
              <button
                key={t.key}
                onClick={() => {
                  setType(t.key);
                  setStep(2);
                }}
                className={`rounded-2xl bg-${t.tint}/10 p-4 text-left ring-1 ring-${t.tint}/20`}
              >
                <div className="text-2xl">{t.icon}</div>
                <p className={`mt-2 text-xs font-medium text-${t.tint}`}>{t.key}</p>
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <div className="rounded-2xl bg-warm/10 p-3 text-xs ring-1 ring-warm/20">
              类型：<span className="font-semibold">{type}</span>
            </div>
            <label className="block">
              <span className="text-xs text-muted-foreground">学生姓名</span>
              <input
                value={who}
                onChange={(e) => setWho(e.target.value)}
                placeholder="如：王小明"
                className="mt-1 w-full rounded-xl bg-surface px-3 py-2.5 text-sm outline-none ring-1 ring-border/60 focus:ring-teal"
              />
            </label>
            <label className="block">
              <span className="text-xs text-muted-foreground">班级</span>
              <input
                value={cls}
                onChange={(e) => setCls(e.target.value)}
                placeholder="如：2年2班"
                className="mt-1 w-full rounded-xl bg-surface px-3 py-2.5 text-sm outline-none ring-1 ring-border/60 focus:ring-teal"
              />
            </label>
            <label className="block">
              <span className="text-xs text-muted-foreground">情况描述</span>
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                rows={4}
                placeholder="简要描述发生时间、表现、当场处理"
                className="mt-1 w-full resize-none rounded-xl bg-surface px-3 py-2.5 text-sm outline-none ring-1 ring-border/60 focus:ring-teal"
              />
            </label>
            <div className="rounded-xl bg-surface-2 p-3 text-[11px] text-muted-foreground">
              {<EIcon e="📎" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />} 可上传现场照片、体检单据（可选）
            </div>
            <button
              disabled={!who || !cls}
              onClick={() => setStep(3)}
              className="w-full rounded-xl bg-teal py-2.5 text-sm font-medium text-teal-foreground disabled:opacity-40"
            >
              下一步 · 选择流转
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
            <div className="rounded-2xl bg-surface p-3 text-xs shadow-sm ring-1 ring-border/60">
              <p><span className="text-muted-foreground">类型：</span>{type}</p>
              <p className="mt-1"><span className="text-muted-foreground">学生：</span>{who} · {cls}</p>
              {desc && <p className="mt-1 text-muted-foreground">"{desc.slice(0, 40)}{desc.length > 40 ? "…" : ""}"</p>}
            </div>
            <p className="text-xs text-muted-foreground">选择流转方式</p>
            <div className="space-y-2">
              {flows.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFlow(f.key)}
                  className={`flex w-full items-center justify-between rounded-2xl p-3 text-left ring-1 ${
                    flow === f.key ? "bg-teal/10 ring-teal" : "bg-surface ring-border/60"
                  }`}
                >
                  <div>
                    <p className="text-sm font-medium">{f.key}</p>
                    <p className="text-[11px] text-muted-foreground">{f.desc}</p>
                  </div>
                  <span className={flow === f.key ? "text-teal" : "text-muted-foreground"}>›</span>
                </button>
              ))}
            </div>
            <ActionSheet
              trigger={
                <button
                  disabled={!flow}
                  className="w-full rounded-xl bg-warm py-2.5 text-sm font-medium text-warm-foreground disabled:opacity-40"
                >
                  提交上报
                </button>
              }
              title="确认提交上报？"
              description={`将按「${flow || "—"}」流转，并同步通知相关角色。提交后可在异常池追踪处理状态。`}
              confirmText="确认提交"
              toastMessage="上报已提交 "
              toastDescription={`${who} · ${cls} · 已通知${flow || "校医"}`}
              onConfirm={() => nav({ to: "/school" })}
            />
            <Link to="/school/focus" className="block text-center text-[11px] text-muted-foreground">
              查看处理状态 →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
