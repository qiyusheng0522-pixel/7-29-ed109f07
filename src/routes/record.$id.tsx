import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { X, Check, RotateCcw, Delete, ArrowRight, ChevronUp, Zap, ShieldAlert, Siren } from "lucide-react";
import { MobileFrame } from "@/components/MobileFrame";
import { EIcon } from "@/components/EIcon";
import { EXAM_USERS, findExamUser, nextPendingExamUser } from "@/lib/exam-users";
import {
  EXAM_ITEMS,
  evalItem,
  seedValue,
  rangeLabel,
  critFor,
  CRIT_RULES,
  type ExamValue,
  type ExamItem,
  type ItemStatus,
  type CritRule,
} from "@/lib/exam-record";


export const Route = createFileRoute("/record/$id")({
  component: RecordPage,
});

function fmt(n?: number) {
  if (n == null) return "--";
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

/** 键盘按键作用到编辑中的字符串，最多 5 位有效数字 */
function applyKey(cur: string, k: string) {
  if (k === "del") return cur.slice(0, -1);
  if (k === ".") {
    if (cur.includes(".")) return cur;
    return cur === "" ? "0." : cur + ".";
  }
  if (cur === "0") return k;
  if (cur.replace(".", "").length >= 5) return cur;
  return cur + k;
}

function RecordPage() {
  // key 保证切换到下一位学生时状态与滚动位置完全重置
  const { id } = Route.useParams();
  return (
    <MobileFrame>
      <Recorder key={id} />
    </MobileFrame>
  );
}

function Recorder() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const user = findExamUser(id);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  // 现场队列：医生在学校连续给一队学生录入
  const queue = useMemo(
    () => EXAM_USERS.filter((u) => u.status === "待检" || u.status === "进行中"),
    [],
  );
  const queueIdx = queue.findIndex((u) => u.id === id);
  const nextUser = nextPendingExamUser(id);

  // 设备自动项预采集读数直接落库，超范围自动标记需重测
  const [values, setValues] = useState<Record<string, ExamValue>>(() => {
    const init: Record<string, ExamValue> = {};
    EXAM_ITEMS.forEach((it) => {
      if (it.source === "auto") {
        const seeded = seedValue(it);
        init[it.id] = { ...seeded, retest: evalItem(it, seeded) === "abnormal" };
      }
    });
    return init;
  });

  const statuses = useMemo(() => EXAM_ITEMS.map((it) => evalItem(it, values[it.id])), [values]);
  const abnormalCount = statuses.filter((s) => s === "abnormal").length;
  const retestCount = EXAM_ITEMS.filter((it) => values[it.id]?.retest).length;
  const doneCount = statuses.filter((s) => s !== "empty").length;
  const emptyManual = EXAM_ITEMS.filter(
    (it) => it.kind === "choice" && !values[it.id]?.choice,
  );

  // 危机值：按项判定，逐条勾选处置步骤后方可闭环
  const crits = useMemo(() => EXAM_ITEMS.map((it) => critFor(it, values[it.id])), [values]);
  const [critSteps, setCritSteps] = useState<Record<string, number[]>>({});
  const openCrits = EXAM_ITEMS.filter((it, i) => {
    const c = crits[i];
    return c && (critSteps[it.id]?.length ?? 0) < c.plan.length;
  });
  const critCount = crits.filter(Boolean).length;
  const criticalCount = crits.filter((c) => c?.level === "危急值").length;

  function toggleCritStep(itemId: string, idx: number) {
    setCritSteps((s) => {
      const cur = s[itemId] ?? [];
      return { ...s, [itemId]: cur.includes(idx) ? cur.filter((i) => i !== idx) : [...cur, idx] };
    });
  }

  function updateValue(itemId: string, patch: Partial<ExamValue>) {
    setValues((s) => {
      const item = EXAM_ITEMS.find((i) => i.id === itemId)!;
      const merged = { ...(s[itemId] ?? {}), ...patch };
      merged.retest = evalItem(item, merged) === "abnormal";
      return { ...s, [itemId]: merged };
    });
  }
  function toggleRetest(itemId: string) {
    setValues((s) => ({ ...s, [itemId]: { ...(s[itemId] ?? {}), retest: !s[itemId]?.retest } }));
  }

  /** 未填的医生手动项一键按「正常」填充 —— 入学体检绝大多数为正常 */
  function fillManualNormal() {
    setValues((s) => {
      const next = { ...s };
      emptyManual.forEach((it) => {
        next[it.id] = { ...(next[it.id] ?? {}), choice: it.normalOption, retest: false };
      });
      return next;
    });
    toast.success(`${emptyManual.length} 项手动检查已标记正常`);
  }

  // 换到下一位学生时，路由的滚动恢复会在挂载后把容器拉回上一位的位置（复核页）。
  // 因此在挂载后的短窗口内持续压回第 1 项，一旦医生自己滑动就立即停止干预。
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let stopped = false;
    const stop = () => {
      stopped = true;
    };
    el.addEventListener("wheel", stop, { passive: true });
    el.addEventListener("touchstart", stop, { passive: true });

    const deadline = performance.now() + 400;
    const pin = () => {
      if (stopped || !scrollRef.current) return;
      if (scrollRef.current.scrollTop !== 0) scrollRef.current.scrollTop = 0;
      if (performance.now() < deadline) requestAnimationFrame(pin);
    };
    el.scrollTop = 0;
    setActive(0);
    requestAnimationFrame(pin);

    return () => {
      stopped = true;
      el.removeEventListener("wheel", stop);
      el.removeEventListener("touchstart", stop);
    };
  }, [id]);

  function scrollTo(index: number) {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: index * el.clientHeight, behavior: "smooth" });
  }

  function onScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollTop / el.clientHeight);
    if (idx !== active) setActive(idx);
  }

  function submit() {
    if (openCrits.length > 0) {
      toast.error("存在未闭环的危机值", {
        description: `${openCrits.map((it) => it.label).join("、")} 的处置步骤未逐条确认，无法提交`,
      });
      const idx = EXAM_ITEMS.findIndex((it) => it.id === openCrits[0].id);
      if (idx >= 0) scrollTo(idx);
      return;
    }
    if (critCount > 0) {
      toast.success("体检结果已提交", {
        description: `${critCount} 项危机值已按处置方案闭环并上报台账`,
      });
    } else if (retestCount > 0) {
      toast.success("体检结果已提交", {
        description: `${retestCount} 项超范围已回传班主任，通知家长带${user?.name ?? "学生"}返场重测`,
      });
    } else {
      toast.success("体检结果已提交", { description: "各项指标正常，已同步至健康档案" });
    }
    // 现场连续录入：直接进入下一位排队学生，不退回列表
    if (nextUser) navigate({ to: "/record/$id", params: { id: nextUser.id } });
    else navigate({ to: "/doctor/exam" });
  }


  return (
    <div className="flex min-h-0 flex-1 flex-col bg-surface-2">
      {/* 顶部：学生 + 队列 + 进度 */}
      <header className="shrink-0 bg-gradient-to-r from-deep to-teal px-4 pb-2.5 pt-2 text-white">
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => navigate({ to: "/doctor/exam" })}
            aria-label="退出录入"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/20 active:scale-95"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="min-w-0 flex-1 text-center">
            <p className="truncate text-[14px] font-bold">{user?.name ?? "学生"}</p>
            <p className="truncate text-[10px] text-white/75">
              {user?.grade ?? ""} · 学号 {id}
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-semibold tabular-nums">
            队列 {queueIdx >= 0 ? queueIdx + 1 : 1}/{queue.length}
          </span>
        </div>

        {/* 分段进度条 */}
        <div className="mt-2.5 flex items-center gap-2">
          <div className="flex flex-1 gap-1">
            {EXAM_ITEMS.map((it, i) => {
              const st = statuses[i];
              return (
                <button
                  key={it.id}
                  onClick={() => scrollTo(i)}
                  aria-label={`跳至${it.label}`}
                  className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/25"
                >
                  <span
                    className={`block h-full rounded-full transition-all ${
                      st === "empty"
                        ? i === active
                          ? "w-full bg-white/60"
                          : "w-0"
                        : st === "abnormal"
                          ? "w-full bg-warning"
                          : "w-full bg-white"
                    }`}
                  />
                </button>
              );
            })}
          </div>
          <span className="shrink-0 text-[10px] font-semibold tabular-nums text-white/90">
            {doneCount}/{EXAM_ITEMS.length}
          </span>
        </div>
      </header>

      {/* 竖向滑动录入区 · 一屏一项 */}
      <div
        ref={scrollRef}
        onScroll={onScroll}
        style={{ overflowAnchor: "none" }}
        className="no-scrollbar min-h-0 flex-1 snap-y snap-mandatory overflow-y-scroll overscroll-contain"
      >
        {EXAM_ITEMS.map((item, i) => (
          <ItemCard
            key={item.id}
            item={item}
            index={i}
            total={EXAM_ITEMS.length}
            status={statuses[i]}
            value={values[item.id]}
            crit={crits[i]}
            critDone={critSteps[item.id] ?? []}
            onToggleCritStep={(idx) => toggleCritStep(item.id, idx)}
            isLast={i === EXAM_ITEMS.length - 1}
            onChange={(patch) => updateValue(item.id, patch)}
            onToggleRetest={() => toggleRetest(item.id)}
            onNext={() => scrollTo(i + 1)}
          />
        ))}


        {/* 复核提交页 */}
        <section className="flex h-full snap-start flex-col px-4 pb-3 pt-3">
          <div className="flex items-baseline justify-between">
            <h2 className="text-[17px] font-bold text-foreground">复核并提交</h2>
            <span className="text-[11px] text-muted-foreground">
              已录 {doneCount}/{EXAM_ITEMS.length} 项
            </span>
          </div>

          <div className="mt-2.5 grid grid-cols-2 gap-2">
            <div className="rounded-2xl bg-surface p-3 shadow-sm ring-1 ring-border/60">
              <p className={`text-2xl font-extrabold ${abnormalCount > 0 ? "text-danger" : "text-success"}`}>
                {abnormalCount}
              </p>
              <p className="text-[11px] text-muted-foreground">超范围项</p>
            </div>
            <div className="rounded-2xl bg-surface p-3 shadow-sm ring-1 ring-border/60">
              <p className={`text-2xl font-extrabold ${retestCount > 0 ? "text-warm" : "text-success"}`}>
                {retestCount}
              </p>
              <p className="text-[11px] text-muted-foreground">标记需重测</p>
            </div>
          </div>

          {critCount > 0 && (
            <div
              className={`mt-2 rounded-2xl px-3 py-2.5 ring-1 ${
                openCrits.length > 0
                  ? "bg-danger/10 ring-danger/25"
                  : "bg-success/10 ring-success/25"
              }`}
            >
              <p className="flex items-center gap-1.5 text-[12px] font-bold text-foreground">
                {openCrits.length > 0 ? (
                  <Siren className="h-3.5 w-3.5 text-danger" />
                ) : (
                  <ShieldAlert className="h-3.5 w-3.5 text-success" />
                )}
                危机值 {critCount} 项（危急值 {criticalCount} 项）
              </p>
              <p className="mt-0.5 text-[10.5px] text-muted-foreground">
                {openCrits.length > 0
                  ? `${openCrits.map((it) => it.label).join("、")} 处置未闭环，需完成后方可提交`
                  : "全部危机值已按方案闭环，已上报危急值台账"}
              </p>
            </div>
          )}


          {emptyManual.length > 0 && (
            <button
              onClick={fillManualNormal}
              className="mt-2 flex items-center justify-center gap-1.5 rounded-2xl bg-teal/15 py-2.5 text-[12px] font-semibold text-teal ring-1 ring-teal/25 active:scale-[0.99]"
            >
              <Zap className="h-3.5 w-3.5" />
              手动项一键正常（{emptyManual.length} 项待填）
            </button>
          )}

          <ul className="no-scrollbar mt-2 min-h-0 flex-1 space-y-1.5 overflow-y-auto">
            {EXAM_ITEMS.map((it, i) => {
              const st = statuses[i];
              const v = values[it.id];
              return (
                <li key={it.id}>
                  <button
                    onClick={() => scrollTo(i)}
                    className="flex w-full items-center gap-2.5 rounded-xl bg-surface px-3 py-2.5 text-left shadow-sm ring-1 ring-border/60 active:scale-[0.99]"
                  >
                    <span className="text-base">
                      <EIcon e={it.icon} className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[12.5px] text-foreground">{it.label}</span>
                    {v?.retest && (
                      <span className="shrink-0 rounded-full bg-warm/15 px-1.5 py-0.5 text-[9px] font-medium text-warm">
                        需重测
                      </span>
                    )}
                    <span
                      className={`shrink-0 text-[12.5px] font-bold tabular-nums ${
                        st === "abnormal"
                          ? "text-danger"
                          : st === "normal"
                            ? "text-foreground"
                            : "text-muted-foreground"
                      }`}
                    >
                      {readout(it, v)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <button
            onClick={submit}
            className="mt-2.5 flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-teal py-3.5 text-sm font-bold text-teal-foreground shadow-sm active:scale-[0.98]"
          >
            提交并同步
            {nextUser ? (
              <>
                <ArrowRight className="h-4 w-4" />
                下一位 {nextUser.name}
              </>
            ) : null}
          </button>
          {retestCount > 0 && (
            <p className="mt-1.5 shrink-0 text-center text-[10px] text-muted-foreground">
              {retestCount} 项将回传班主任，通知家长带孩子返场重测
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

function readout(item: ExamItem, v?: ExamValue): string {
  const st = evalItem(item, v);
  if (st === "empty") return "待填";
  if (item.kind === "choice") return v?.choice ?? "待填";
  if (item.kind === "bp") return `${fmt(v?.value)}/${fmt(v?.valueDia)}`;
  return `${fmt(v?.value)}${item.unit ? " " + item.unit : ""}`;
}

function ItemCard({
  item,
  index,
  total,
  status,
  value,
  crit,
  critDone,
  onToggleCritStep,
  isLast,
  onChange,
  onToggleRetest,
  onNext,
}: {
  item: ExamItem;
  index: number;
  total: number;
  status: ItemStatus;
  value?: ExamValue;
  crit: CritRule | null;
  critDone: number[];
  onToggleCritStep: (idx: number) => void;
  isLast: boolean;
  onChange: (patch: Partial<ExamValue>) => void;
  onToggleRetest: () => void;
  onNext: () => void;
}) {
  const abnormal = status === "abnormal";
  const isBp = item.kind === "bp";
  const critClosed = !!crit && critDone.length >= crit.plan.length;
  // 触发危机值时默认展开处置方案；医生可切回键盘继续改数值
  const [showPlan, setShowPlan] = useState(true);
  const planOpen = !!crit && showPlan;
  // 键盘编辑缓冲：直接按数字录入，比 +/- 步进快得多
  const [sys, setSys] = useState(value?.value != null ? String(value.value) : "");
  const [dia, setDia] = useState(value?.valueDia != null ? String(value.valueDia) : "");
  const [field, setField] = useState<"sys" | "dia">("sys");


  function press(k: string) {
    if (isBp && field === "dia") {
      const nt = applyKey(dia, k);
      setDia(nt);
      onChange({ valueDia: nt === "" ? undefined : Number(nt) });
      return;
    }
    const nt = applyKey(sys, k);
    setSys(nt);
    onChange({ value: nt === "" ? undefined : Number(nt) });
  }


  return (
    <section className="flex h-full snap-start flex-col px-4 pb-3 pt-2.5">
      {/* 序号 + 采集方式 */}
      <div className="flex shrink-0 items-center justify-between">
        <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] font-semibold tabular-nums text-muted-foreground ring-1 ring-border/60">
          {index + 1} / {total}
        </span>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
            item.source === "auto" ? "bg-teal/15 text-teal" : "bg-warm/15 text-warm"
          }`}
        >
          {item.source === "auto" ? "设备自动同步" : "医生手动填写"}
        </span>
      </div>

      {/* 项目标题 */}
      <div className="mt-2 flex shrink-0 items-center gap-2.5">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-surface text-[22px] shadow-sm ring-1 ring-border/60">
          <EIcon e={item.icon} className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />
        </span>
        <div className="min-w-0">
          <h2 className="text-[17px] font-bold leading-tight text-foreground">{item.label}</h2>
          <p className="mt-0.5 text-[10.5px] leading-snug text-muted-foreground">{item.hint}</p>
        </div>
      </div>

      {/* 危机值告警条 */}
      {crit ? (
        <div
          className={`mt-2 flex shrink-0 items-center gap-2 rounded-2xl px-3 py-2 ring-1 ${
            crit.level === "危急值"
              ? "bg-danger/12 text-danger ring-danger/30"
              : "bg-warm/12 text-warm ring-warm/30"
          }`}
        >
          {crit.level === "危急值" ? (
            <Siren className="h-4 w-4 shrink-0 animate-pulse" />
          ) : (
            <ShieldAlert className="h-4 w-4 shrink-0" />
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12px] font-bold">
              {crit.level} · {crit.title}
            </p>
            <p className="truncate text-[10px] opacity-80">
              {crit.rule} · 处置时限 {crit.timeLimit}
            </p>
          </div>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[9.5px] font-semibold ${
              critClosed ? "bg-success text-success-foreground" : "bg-surface text-muted-foreground"
            }`}
          >
            {critClosed ? "已闭环" : `${critDone.length}/${crit.plan.length}`}
          </span>
        </div>
      ) : CRIT_RULES[item.id] ? (
        <p className="mt-2 shrink-0 rounded-2xl bg-surface px-3 py-1.5 text-[10px] text-muted-foreground ring-1 ring-border/60">
          危机值判定标准（示例）：
          {CRIT_RULES[item.id].map((r) => `${r.level} ${r.rule}`).join("；")}
        </p>
      ) : null}


      {/* 数值 / 选项 */}
      {item.kind !== "choice" ? (
        <>
          {/* 读数卡 */}
          <div
            className={`mt-2.5 shrink-0 rounded-3xl px-4 py-3 text-center shadow-sm ring-1 ${
              abnormal
                ? "bg-danger/10 ring-danger/25"
                : status === "normal"
                  ? "bg-success/10 ring-success/25"
                  : "bg-surface ring-border/60"
            }`}
          >
            {isBp ? (
              <div className="flex items-end justify-center gap-2">
                <BpField
                  label="收缩压"
                  text={sys}
                  activeField={field === "sys"}
                  abnormal={abnormal}
                  onFocus={() => setField("sys")}
                />
                <span className="pb-2 text-2xl font-bold text-muted-foreground">/</span>
                <BpField
                  label="舒张压"
                  text={dia}
                  activeField={field === "dia"}
                  abnormal={abnormal}
                  onFocus={() => setField("dia")}
                />
              </div>
            ) : (
              <div className="flex items-end justify-center gap-1.5">
                <span
                  className={`text-[46px] font-extrabold leading-none tabular-nums ${
                    abnormal ? "text-danger" : "text-foreground"
                  }`}
                >
                  {sys === "" ? "--" : sys}
                </span>
                {item.unit ? (
                  <span className="pb-1.5 text-[13px] font-medium text-muted-foreground">{item.unit}</span>
                ) : null}
              </div>
            )}

            {/* 状态 / 参考范围 */}
            <div className="mt-1.5 flex items-center justify-center">
              {abnormal ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-danger px-2.5 py-1 text-[11px] font-semibold text-danger-foreground">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-danger-foreground" />
                  超出范围 · {rangeLabel(item)}
                </span>
              ) : status === "normal" ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-success px-2.5 py-1 text-[11px] font-semibold text-success-foreground">
                  <Check className="h-3.5 w-3.5" /> 正常 · {rangeLabel(item)}
                </span>
              ) : (
                <span className="rounded-full bg-surface-2 px-2.5 py-1 text-[11px] text-muted-foreground">
                  {rangeLabel(item)}
                </span>
              )}
            </div>
          </div>

          {planOpen ? (
            <CritPanel
              crit={crit!}
              done={critDone}
              onToggle={onToggleCritStep}
              onBack={() => setShowPlan(false)}
            />
          ) : (
            <>
              {crit && (
                <button
                  onClick={() => setShowPlan(true)}
                  className="mt-2 shrink-0 rounded-2xl bg-danger/10 px-3 py-2 text-[11.5px] font-semibold text-danger ring-1 ring-danger/25"
                >
                  返回危机值处置方案（{critDone.length}/{crit.plan.length}）
                </button>
              )}
              {/* 数字键盘 · 直接录入 */}
              <div className="mt-2.5 grid min-h-0 flex-1 grid-cols-3 gap-1.5">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "del"].map((k) => (
                  <button
                    key={k}
                    onClick={() => press(k)}
                    aria-label={k === "del" ? "退格" : k}
                    className="grid place-items-center rounded-2xl bg-surface text-[20px] font-semibold text-foreground shadow-sm ring-1 ring-border/60 transition active:scale-95 active:bg-surface-2"
                  >
                    {k === "del" ? <Delete className="h-5 w-5 text-muted-foreground" /> : k}
                  </button>
                ))}
              </div>
            </>
          )}
        </>
      ) : (
        <div className="mt-3 flex min-h-0 flex-1 flex-col">
          {/* 正常项做成主按钮：入学体检绝大多数一次点中 */}
          <button
            onClick={() => onChange({ choice: item.normalOption })}
            className={`flex shrink-0 items-center justify-center gap-2 rounded-3xl py-5 text-base font-bold shadow-sm transition active:scale-[0.98] ${
              value?.choice === item.normalOption
                ? "bg-success text-success-foreground"
                : "bg-surface text-foreground ring-1 ring-success/25"
            }`}
          >
            <Check className="h-5 w-5" />
            {item.normalOption}
          </button>
          <p className="mt-2 shrink-0 text-center text-[10.5px] text-muted-foreground">
            如有异常，选择下方具体情况
          </p>
          <div className="no-scrollbar mt-1.5 shrink-0 space-y-1.5 overflow-y-auto">
            {item.options!
              .filter((o) => o !== item.normalOption)
              .map((opt) => {
                const on = value?.choice === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => onChange({ choice: opt })}
                    className={`w-full rounded-2xl px-3 py-3 text-[13.5px] font-medium shadow-sm transition active:scale-[0.98] ${
                      on
                        ? "bg-danger text-danger-foreground"
                        : "bg-surface text-foreground ring-1 ring-border/60"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
          </div>
          {crit ? (
            <CritPanel crit={crit} done={critDone} onToggle={onToggleCritStep} />
          ) : (
            <div className="min-h-0 flex-1" />
          )}
        </div>
      )}


      {/* 底部操作条 */}
      <div className="mt-2.5 flex shrink-0 items-center gap-2">
        <button
          onClick={onToggleRetest}
          className={`flex shrink-0 items-center gap-1 rounded-2xl px-3 py-3 text-[11.5px] font-semibold transition active:scale-95 ${
            value?.retest
              ? "bg-warm text-warm-foreground"
              : "bg-surface text-muted-foreground ring-1 ring-border/60"
          }`}
        >
          <RotateCcw className="h-3.5 w-3.5" />
          {value?.retest ? "需重测" : "标重测"}
        </button>
        <button
          onClick={() => {
            if (crit && !critClosed) {
              setShowPlan(true);
              toast.error(`${crit.level}未闭环`, {
                description: `请逐条确认「${crit.title}」的处置措施后再进入下一项`,
              });
              return;
            }
            onNext();
          }}
          className={`flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-2xl py-3 text-[13.5px] font-bold shadow-sm active:scale-[0.98] ${
            crit && !critClosed
              ? "bg-surface text-muted-foreground ring-1 ring-border/60"
              : "bg-deep text-deep-foreground"
          }`}
        >
          <ChevronUp className="h-4 w-4" />
          {crit && !critClosed ? "危机值待闭环" : isLast ? "确认 · 去复核" : "确认 · 下一项"}
        </button>
      </div>
    </section>
  );
}

/** 危机值处置方案：逐条勾选闭环 */
function CritPanel({
  crit,
  done,
  onToggle,
  onBack,
}: {
  crit: CritRule;
  done: number[];
  onToggle: (idx: number) => void;
  onBack?: () => void;
}) {
  const closed = done.length >= crit.plan.length;
  return (
    <div className="no-scrollbar mt-2.5 min-h-0 flex-1 overflow-y-auto rounded-2xl bg-surface p-3 shadow-sm ring-1 ring-danger/20">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[12.5px] font-bold text-foreground">危机值处置方案</p>
        {onBack && (
          <button
            onClick={onBack}
            className="rounded-full bg-surface-2 px-2 py-0.5 text-[10px] text-muted-foreground"
          >
            改数值
          </button>
        )}
      </div>
      <p className="mt-0.5 text-[10px] text-muted-foreground">
        处置时限 {crit.timeLimit} · 逐条确认后自动写入质控留痕台账
      </p>
      <ul className="mt-2 space-y-1.5">
        {crit.plan.map((step, i) => {
          const on = done.includes(i);
          return (
            <li key={step}>
              <button
                onClick={() => onToggle(i)}
                className={`flex w-full items-start gap-2 rounded-xl px-2.5 py-2 text-left transition active:scale-[0.99] ${
                  on ? "bg-success/10 ring-1 ring-success/25" : "bg-surface-2 ring-1 ring-border/60"
                }`}
              >
                <span
                  className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full ${
                    on ? "bg-success text-success-foreground" : "bg-surface ring-1 ring-border"
                  }`}
                >
                  {on ? <Check className="h-3 w-3" /> : null}
                </span>
                <span
                  className={`text-[12px] leading-snug ${on ? "text-muted-foreground line-through" : "text-foreground"}`}
                >
                  {step}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <p
        className={`mt-2 rounded-xl px-2.5 py-1.5 text-[10.5px] font-medium ${
          closed ? "bg-success/12 text-success" : "bg-danger/10 text-danger"
        }`}
      >
        {closed
          ? "已闭环 · 张医生 于本次录检完成全部处置并双人签名"
          : `待闭环 ${crit.plan.length - done.length} 步 · 未完成不可进入下一项`}
      </p>
    </div>
  );
}


function BpField({
  label,
  text,
  activeField,
  abnormal,
  onFocus,
}: {
  label: string;
  text: string;
  activeField: boolean;
  abnormal: boolean;
  onFocus: () => void;
}) {
  return (
    <button onClick={onFocus} className="flex flex-col items-center px-1">
      <span
        className={`text-[40px] font-extrabold leading-none tabular-nums transition ${
          abnormal ? "text-danger" : "text-foreground"
        } ${activeField ? "" : "opacity-45"}`}
      >
        {text === "" ? "--" : text}
      </span>
      <span
        className={`mt-1 rounded-full px-2 py-0.5 text-[9.5px] font-medium transition ${
          activeField ? "bg-deep text-deep-foreground" : "bg-surface-2 text-muted-foreground"
        }`}
      >
        {label}
      </span>
    </button>
  );
}
