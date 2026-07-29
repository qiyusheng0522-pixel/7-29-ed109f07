import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { StatusBar } from "@/components/MobileFrame";
import { useState } from "react";
import { toast } from "sonner";

import { EIcon } from "@/components/EIcon";
export const Route = createFileRoute("/parent/terminate")({
  component: TerminatePage,
});

const stops = [
  "后续健康任务与呵护提醒",
  "健康管理师随访与咨询",
  "学校端后续变化查看",
  "家庭数据继续采集",
];

const keeps = [
  "已完成的法定体检记录",
  "已签署的授权记录",
  "必要的审计日志",
];

function TerminatePage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [signed, setSigned] = useState(false);
  const navigate = useNavigate();

  return (
    <div>
      <StatusBar title="终止健康管理" />
      <div className="px-5 pb-10 pt-2">
        {/* Steps */}
        <div className="mb-4 flex items-center gap-2 text-[11px] text-muted-foreground">
          {["查看告知", "二次确认", "签名完成"].map((s, i) => (
            <div key={s} className="flex flex-1 items-center gap-2">
              <span
                className={`grid h-6 w-6 place-items-center rounded-full text-[11px] ${
                  step >= (i + 1)
                    ? "bg-warm text-warm-foreground"
                    : "bg-muted"
                }`}
              >
                {i + 1}
              </span>
              <span className={step >= i + 1 ? "text-foreground" : ""}>{s}</span>
              {i < 2 && <span className="flex-1 border-t border-dashed border-border" />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <>
            <div className="mb-4 rounded-3xl bg-gradient-to-br from-muted to-surface-2 p-5 ring-1 ring-border">
              <h1 className="text-lg font-bold">终止告知书</h1>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                您可以随时选择终止后续健康管理。终止后我们将立即停止相关提醒与随访，请您了解以下影响后再确认。
              </p>
            </div>

            <section className="mb-4 rounded-2xl bg-warm/10 p-4 ring-1 ring-warm/20">
              <p className="mb-2 text-sm font-semibold text-warm">终止后将停止</p>
              <ul className="space-y-1.5 text-xs text-foreground/85">
                {stops.map((s) => (
                  <li key={s} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-warm" />
                    {s}
                  </li>
                ))}
              </ul>
            </section>

            <section className="mb-4 rounded-2xl bg-teal/10 p-4 ring-1 ring-teal/20">
              <p className="mb-2 text-sm font-semibold text-deep">仍会保留</p>
              <ul className="space-y-1.5 text-xs text-foreground/85">
                {keeps.map((s) => (
                  <li key={s} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" />
                    {s}
                  </li>
                ))}
              </ul>
            </section>

            <div className="flex gap-2">
              <Link to="/parent/me" className="flex-1 rounded-xl bg-surface py-3 text-center text-sm ring-1 ring-border/60">
                我再想想
              </Link>
              <button
                onClick={() => setStep(2)}
                className="flex-1 rounded-xl bg-warm py-3 text-sm font-medium text-warm-foreground"
              >
                我已了解，继续
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="mb-4 rounded-3xl bg-warm/10 p-5 text-center ring-1 ring-warm/30">
              <div className="text-3xl">{<EIcon e="🤔" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />}</div>
              <p className="mt-2 text-base font-semibold">确认终止后续健康管理？</p>
              <p className="mt-1 text-xs text-muted-foreground">
                之后可随时重新授权，历史体检记录不会丢失。
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setStep(1)}
                className="flex-1 rounded-xl bg-surface py-3 text-sm ring-1 ring-border/60"
              >
                返回上一步
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 rounded-xl bg-warm py-3 text-sm font-medium text-warm-foreground"
              >
                确认终止
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <section className="mb-4 rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-border/60">
              <h2 className="mb-3 text-sm font-semibold">监护人电子签名</h2>
              <div
                onClick={() => setSigned(true)}
                className={`grid h-32 place-items-center rounded-xl border-2 border-dashed text-xs transition ${
                  signed ? "border-warm bg-warm/10 text-warm" : "border-border text-muted-foreground"
                }`}
              >
                {signed ? " 李妈妈 · 2026-04-08 20:32" : "点击此处手写签名"}
              </div>
            </section>
            <button
              disabled={!signed}
              onClick={() => {
                toast.success("终止申请已提交", { description: "终止凭证已生成，可在消息中查看" });
                navigate({ to: "/parent/me" });
              }}
              className="w-full rounded-xl bg-warm py-3 text-sm font-semibold text-warm-foreground disabled:bg-muted disabled:text-muted-foreground"
            >
              生成终止凭证并提交
            </button>
          </>
        )}
      </div>
    </div>
  );
}
