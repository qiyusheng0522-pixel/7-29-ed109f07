import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { EIcon } from "@/components/EIcon";
import { VerdictCard } from "@/components/VerdictCard";
import {
  evaluateDiet,
  evaluateExercise,
  saveCheckin,
  TARGET_KCAL,
  TARGET_MINUTES,
  type DietInputMode,
} from "@/lib/checkin";

/**
 * 饮食 / 运动打卡现在以底部弹窗（Sheet）形式在当前页展开，
 * 参照居家健康提醒的「去记录」交互，避免整页跳转。
 *
 * 两个组件都自管 open 状态；打卡成功后在弹窗内展示匹配度结论，
 * 关闭时通过 saveCheckin 触发的 checkin-updated 事件让首页刷新。
 */

const MEALS = ["早餐", "午餐", "晚餐", "加餐"];

const QUICK_FOODS = [
  { name: "杂粮饭 1 碗", kcal: 220 },
  { name: "白米饭 1 碗", kcal: 260 },
  { name: "清蒸鱼", kcal: 130 },
  { name: "鸡胸肉", kcal: 120 },
  { name: "西兰花", kcal: 40 },
  { name: "炒时蔬", kcal: 90 },
  { name: "鸡蛋 1 个", kcal: 75 },
  { name: "牛奶 250ml", kcal: 160 },
  { name: "炸鸡块", kcal: 300 },
  { name: "含糖饮料", kcal: 180 },
];

const PHOTO_GUESSES = [
  { name: "杂粮饭", kcal: 220 },
  { name: "清蒸鲈鱼", kcal: 140 },
  { name: "炒青菜", kcal: 80 },
  { name: "紫菜蛋花汤", kcal: 60 },
];

const VOICE_TRANSCRIPT = "晚饭吃了一小碗杂粮饭、半条清蒸鱼、一份炒西兰花，没有喝饮料。";
const VOICE_ITEMS = [
  { name: "杂粮饭（小碗）", kcal: 180 },
  { name: "清蒸鱼（半条）", kcal: 110 },
  { name: "炒西兰花", kcal: 70 },
];

/** 底部弹窗外壳：统一圆角、抓手、标题与滚动区域 */
function SheetShell({
  trigger,
  open,
  onOpenChange,
  title,
  desc,
  children,
  footer,
}: {
  trigger: ReactNode;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  desc: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent
        side="bottom"
        className="mx-auto flex max-h-[88%] max-w-md flex-col rounded-t-3xl border-0 bg-surface-2 p-0"
      >
        <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-muted" />
        <SheetHeader className="shrink-0 px-5 pb-1 pt-2 text-left">
          <SheetTitle className="text-base">{title}</SheetTitle>
          <SheetDescription className="text-[11px]">{desc}</SheetDescription>
        </SheetHeader>
        <div className="no-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3">
          {children}
        </div>
        <div className="shrink-0 border-t border-border/60 bg-surface px-4 py-3">{footer}</div>
      </SheetContent>
    </Sheet>
  );
}

export function DietCheckinSheet({ trigger }: { trigger: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [meal, setMeal] = useState("晚餐");
  const [mode, setMode] = useState<DietInputMode>("photo");

  const fileRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [recognizing, setRecognizing] = useState(false);
  const [recognized, setRecognized] = useState<typeof PHOTO_GUESSES>([]);

  const [recording, setRecording] = useState(false);
  const [voiceSec, setVoiceSec] = useState(0);
  const [transcript, setTranscript] = useState("");

  const [text, setText] = useState("");
  const [picked, setPicked] = useState<string[]>([]);

  const [saved, setSaved] = useState(false);

  // 每次打开都恢复到初始状态，保证是一次全新的记录
  const reset = () => {
    setMeal("晚餐");
    setMode("photo");
    setPhotos([]);
    setRecognizing(false);
    setRecognized([]);
    setRecording(false);
    setVoiceSec(0);
    setTranscript("");
    setText("");
    setPicked([]);
    setSaved(false);
  };

  useEffect(() => {
    if (!recording) return;
    const id = setInterval(() => setVoiceSec((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [recording]);

  useEffect(() => () => photos.forEach((p) => URL.revokeObjectURL(p)), [photos]);

  const addPhotos = (files: FileList | null) => {
    if (!files?.length) return;
    const urls = Array.from(files)
      .slice(0, 4 - photos.length)
      .map((f) => URL.createObjectURL(f));
    setPhotos((p) => [...p, ...urls]);
    setRecognizing(true);
    setTimeout(() => {
      setRecognized(PHOTO_GUESSES.slice(0, Math.min(4, photos.length + urls.length + 1)));
      setRecognizing(false);
    }, 1200);
  };

  const stopRecording = () => {
    setRecording(false);
    setTimeout(() => setTranscript(VOICE_TRANSCRIPT), 600);
  };

  const togglePick = (name: string) =>
    setPicked((p) => (p.includes(name) ? p.filter((x) => x !== name) : [...p, name]));

  const kcal =
    mode === "photo"
      ? recognized.reduce((s, r) => s + r.kcal, 0)
      : mode === "voice"
        ? transcript
          ? VOICE_ITEMS.reduce((s, r) => s + r.kcal, 0)
          : 0
        : QUICK_FOODS.filter((f) => picked.includes(f.name)).reduce((s, f) => s + f.kcal, 0);

  const desc =
    mode === "photo"
      ? recognized.map((r) => r.name).join("、")
      : mode === "voice"
        ? transcript
        : [picked.join("、"), text].filter(Boolean).join("；");

  const ready = kcal > 0;

  const submit = () => {
    if (!ready) return;
    saveCheckin({
      kind: "diet",
      meal,
      mode,
      text: desc,
      photoCount: photos.length,
      voiceSec,
      kcal,
      at: new Date().toISOString(),
    });
    setSaved(true);
  };

  const MODES: { key: DietInputMode; icon: string; label: string }[] = [
    { key: "photo", icon: "📷", label: "拍照" },
    { key: "voice", icon: "🎤", label: "语音" },
    { key: "text", icon: "✍️", label: "文字" },
  ];

  return (
    <SheetShell
      trigger={trigger}
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v) reset();
      }}
      title="饮食打卡"
      desc={`推荐上限 ${TARGET_KCAL} kcal · 记录后自动核对是否匹配`}
      footer={
        saved ? (
          <button
            onClick={() => setOpen(false)}
            className="w-full rounded-full bg-rose py-3 text-sm font-semibold text-rose-foreground"
          >
            完成
          </button>
        ) : (
          <button
            onClick={submit}
            disabled={!ready}
            className="w-full rounded-full bg-rose py-3 text-sm font-semibold text-rose-foreground transition disabled:bg-muted disabled:text-muted-foreground"
          >
            {ready ? "提交打卡" : "请先记录本餐内容"}
          </button>
        )
      }
    >
      {saved ? (
        <>
          <div className="rounded-2xl bg-surface p-5 text-center shadow-sm ring-1 ring-border/60">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-success/15 text-xl text-success">
              <EIcon e="✓" />
            </span>
            <p className="mt-2 text-sm font-bold">{meal}打卡完成</p>
            <p className="mt-1 text-[11px] text-muted-foreground text-pretty">{desc}</p>
          </div>
          <VerdictCard v={evaluateDiet(kcal)} />
        </>
      ) : (
        <>
          {/* 餐次 */}
          <section className="rounded-2xl bg-surface p-3.5 shadow-sm ring-1 ring-border/60">
            <p className="mb-2 text-[12px] font-semibold">餐次</p>
            <div className="flex gap-2">
              {MEALS.map((m) => (
                <button
                  key={m}
                  onClick={() => setMeal(m)}
                  className={`flex-1 rounded-xl py-2 text-[12px] font-medium transition ${
                    meal === m ? "bg-rose text-rose-foreground" : "bg-surface-2 text-muted-foreground"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </section>

          {/* 记录方式 */}
          <section className="rounded-2xl bg-surface p-3.5 shadow-sm ring-1 ring-border/60">
            <p className="mb-2 text-[12px] font-semibold">记录方式</p>
            <div className="flex gap-2">
              {MODES.map((m) => (
                <button
                  key={m.key}
                  onClick={() => setMode(m.key)}
                  className={`flex flex-1 flex-col items-center gap-1 rounded-xl py-2.5 text-[11px] font-medium ring-1 transition ${
                    mode === m.key
                      ? "bg-rose/10 text-rose ring-rose/40"
                      : "bg-surface-2 text-muted-foreground ring-transparent"
                  }`}
                >
                  <span className="text-[15px]">
                    <EIcon e={m.icon} />
                  </span>
                  {m.label}
                </button>
              ))}
            </div>

            {mode === "photo" && (
              <div className="mt-3">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  multiple
                  className="sr-only"
                  onChange={(e) => addPhotos(e.target.files)}
                />
                <div className="flex flex-wrap gap-2">
                  {photos.map((src, i) => (
                    <div key={src} className="relative h-20 w-20 overflow-hidden rounded-xl ring-1 ring-border">
                      <img src={src} alt={`餐食照片 ${i + 1}`} className="h-full w-full object-cover" />
                      <button
                        onClick={() => setPhotos((p) => p.filter((x) => x !== src))}
                        aria-label="删除照片"
                        className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-black/55 text-[10px] text-white"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {photos.length < 4 && (
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="grid h-20 w-20 place-items-center gap-1 rounded-xl border-2 border-dashed border-border text-muted-foreground"
                    >
                      <span className="text-lg">
                        <EIcon e="📷" />
                      </span>
                      <span className="text-[10px]">拍照/上传</span>
                    </button>
                  )}
                </div>
                <p className="mt-2 text-[10px] text-muted-foreground">最多 4 张 · 拍清整桌菜识别更准</p>

                {recognizing && (
                  <p className="mt-2 flex items-center gap-1.5 text-[11px] text-rose">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-rose" />
                    AI 正在识别菜品…
                  </p>
                )}
                {!recognizing && recognized.length > 0 && (
                  <div className="mt-2 rounded-xl bg-surface-2 p-2.5">
                    <p className="text-[11px] font-semibold">识别结果（可确认）</p>
                    <ul className="mt-1.5 space-y-1">
                      {recognized.map((r) => (
                        <li key={r.name} className="flex items-center justify-between text-[11px]">
                          <span className="min-w-0 flex-1 truncate text-muted-foreground">{r.name}</span>
                          <span className="shrink-0 font-medium">{r.kcal} kcal</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {mode === "voice" && (
              <div className="mt-3 flex flex-col items-center">
                <button
                  onClick={() =>
                    recording ? stopRecording() : (setVoiceSec(0), setTranscript(""), setRecording(true))
                  }
                  className={`grid h-20 w-20 place-items-center rounded-full text-2xl transition ${
                    recording
                      ? "animate-pulse bg-rose text-rose-foreground"
                      : "bg-rose/10 text-rose ring-1 ring-rose/30"
                  }`}
                  aria-label={recording ? "停止录音" : "开始录音"}
                >
                  <EIcon e="🎤" />
                </button>
                <p className="mt-2 text-[12px] font-semibold tabular-nums">
                  {recording ? `录音中 ${voiceSec}s` : voiceSec > 0 ? `已录 ${voiceSec}s` : "点击开始说话"}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {recording ? "再次点击结束" : "例如「晚饭吃了一碗杂粮饭和清蒸鱼」"}
                </p>

                {recording && (
                  <div className="mt-2 flex h-6 items-end gap-0.5">
                    {Array.from({ length: 16 }).map((_, i) => (
                      <span
                        key={i}
                        className="w-1 animate-pulse rounded-full bg-rose/60"
                        style={{ height: `${8 + ((i * 7) % 16)}px`, animationDelay: `${i * 60}ms` }}
                      />
                    ))}
                  </div>
                )}

                {transcript && (
                  <div className="mt-3 w-full rounded-xl bg-surface-2 p-2.5">
                    <p className="text-[11px] font-semibold">语音转写</p>
                    <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground text-pretty">
                      {transcript}
                    </p>
                    <ul className="mt-2 space-y-1 border-t border-border/60 pt-2">
                      {VOICE_ITEMS.map((r) => (
                        <li key={r.name} className="flex items-center justify-between text-[11px]">
                          <span className="min-w-0 flex-1 truncate text-muted-foreground">{r.name}</span>
                          <span className="shrink-0 font-medium">{r.kcal} kcal</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {mode === "text" && (
              <div className="mt-3">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={3}
                  placeholder="补充说明，如「主食只吃了半碗」"
                  className="w-full resize-none rounded-xl bg-surface-2 p-2.5 text-[12px] outline-none ring-1 ring-transparent placeholder:text-muted-foreground focus:ring-rose/40"
                />
                <p className="mb-1.5 mt-2 text-[11px] font-semibold">选择本餐食物</p>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_FOODS.map((f) => (
                    <button
                      key={f.name}
                      onClick={() => togglePick(f.name)}
                      className={`rounded-full px-2.5 py-1 text-[11px] transition ${
                        picked.includes(f.name)
                          ? "bg-rose text-rose-foreground"
                          : "bg-surface-2 text-muted-foreground"
                      }`}
                    >
                      {f.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>

          {ready && (
            <section className="rounded-2xl bg-surface p-3.5 shadow-sm ring-1 ring-border/60">
              <div className="flex items-baseline justify-between">
                <p className="text-[12px] font-semibold">本餐合计</p>
                <p className="text-[12px]">
                  <b className="text-lg">{kcal}</b>
                  <span className="text-muted-foreground"> / {TARGET_KCAL} kcal</span>
                </p>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-2">
                <div
                  className={`h-full rounded-full ${kcal > TARGET_KCAL ? "bg-warning" : "bg-success"}`}
                  style={{ width: `${Math.min(100, (kcal / TARGET_KCAL) * 100)}%` }}
                />
              </div>
            </section>
          )}
        </>
      )}
    </SheetShell>
  );
}

const ITEMS = [
  { name: "亲子跳绳", icon: "🤸" },
  { name: "快走", icon: "🚶" },
  { name: "骑行", icon: "🚲" },
  { name: "球类", icon: "⚽" },
];

const MINUTE_PRESETS = [10, 15, 20, 30, 45];

const INTENSITIES = [
  { v: 1, label: "轻松", hint: "能正常说话 · 心率 <110" },
  { v: 2, label: "适中", hint: "微喘但能交流 · 心率 110–150" },
  { v: 3, label: "吃力", hint: "说话困难 · 心率 >150" },
];

const FATIGUES = [
  { v: 1, label: "不累" },
  { v: 2, label: "略累" },
  { v: 3, label: "一般" },
  { v: 4, label: "很累" },
  { v: 5, label: "累瘫" },
];

export function ExerciseCheckinSheet({ trigger }: { trigger: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [item, setItem] = useState(ITEMS[0].name);
  const [minutes, setMinutes] = useState(TARGET_MINUTES);
  const [intensity, setIntensity] = useState(0);
  const [fatigue, setFatigue] = useState(0);
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);

  const reset = () => {
    setItem(ITEMS[0].name);
    setMinutes(TARGET_MINUTES);
    setIntensity(0);
    setFatigue(0);
    setNote("");
    setSaved(false);
  };

  const ready = intensity > 0 && fatigue > 0;
  const verdict = ready ? evaluateExercise({ minutes, intensity, fatigue }) : null;

  const submit = () => {
    if (!ready) return;
    saveCheckin({
      kind: "exercise",
      item,
      minutes,
      intensity,
      fatigue,
      note,
      at: new Date().toISOString(),
    });
    setSaved(true);
  };

  return (
    <SheetShell
      trigger={trigger}
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v) reset();
      }}
      title="运动打卡"
      desc={`今日推荐 ${TARGET_MINUTES} 分钟 · 数据用于校准方案`}
      footer={
        saved ? (
          <button
            onClick={() => setOpen(false)}
            className="w-full rounded-full bg-rose py-3 text-sm font-semibold text-rose-foreground"
          >
            完成
          </button>
        ) : (
          <button
            onClick={submit}
            disabled={!ready}
            className="w-full rounded-full bg-rose py-3 text-sm font-semibold text-rose-foreground transition disabled:bg-muted disabled:text-muted-foreground"
          >
            {ready ? "提交打卡" : "请选择强度与疲惫度"}
          </button>
        )
      }
    >
      {saved && verdict ? (
        <>
          <div className="rounded-2xl bg-surface p-5 text-center shadow-sm ring-1 ring-border/60">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-success/15 text-xl text-success">
              <EIcon e="✓" />
            </span>
            <p className="mt-2 text-sm font-bold">运动打卡完成</p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {item} · {minutes} 分钟 · {INTENSITIES[intensity - 1].label} · 疲惫 {fatigue}/5
            </p>
          </div>
          <VerdictCard v={verdict} />
          <p className="text-center text-[10px] text-muted-foreground text-pretty">
            连续 7 天的数据会用于自动调整下周运动清单
          </p>
        </>
      ) : (
        <>
          {/* 项目 */}
          <section className="rounded-2xl bg-surface p-3.5 shadow-sm ring-1 ring-border/60">
            <p className="mb-2 text-[12px] font-semibold">运动项目</p>
            <div className="flex gap-2">
              {ITEMS.map((it) => (
                <button
                  key={it.name}
                  onClick={() => setItem(it.name)}
                  className={`flex flex-1 flex-col items-center gap-1 rounded-xl py-2.5 text-[11px] font-medium ring-1 transition ${
                    item === it.name
                      ? "bg-rose/10 text-rose ring-rose/40"
                      : "bg-surface-2 text-muted-foreground ring-transparent"
                  }`}
                >
                  <span className="text-[15px]">
                    <EIcon e={it.icon} />
                  </span>
                  <span className="truncate">{it.name}</span>
                </button>
              ))}
            </div>
          </section>

          {/* 时长 */}
          <section className="rounded-2xl bg-surface p-3.5 shadow-sm ring-1 ring-border/60">
            <div className="mb-2 flex items-baseline justify-between">
              <p className="text-[12px] font-semibold">实际时长</p>
              <p className="text-[12px]">
                <b className="text-lg tabular-nums">{minutes}</b>
                <span className="text-muted-foreground"> / {TARGET_MINUTES} 分钟</span>
              </p>
            </div>
            <input
              type="range"
              min={0}
              max={60}
              step={5}
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value))}
              aria-label="实际运动时长（分钟）"
              className="w-full accent-rose"
            />
            <div className="mt-2 flex gap-1.5">
              {MINUTE_PRESETS.map((m) => (
                <button
                  key={m}
                  onClick={() => setMinutes(m)}
                  className={`flex-1 rounded-lg py-1.5 text-[11px] transition ${
                    minutes === m ? "bg-rose text-rose-foreground" : "bg-surface-2 text-muted-foreground"
                  }`}
                >
                  {m}′
                </button>
              ))}
            </div>
          </section>

          {/* 强度 */}
          <section className="rounded-2xl bg-surface p-3.5 shadow-sm ring-1 ring-border/60">
            <p className="mb-2 text-[12px] font-semibold">
              运动强度 <span className="font-normal text-muted-foreground">（必填）</span>
            </p>
            <div className="space-y-1.5">
              {INTENSITIES.map((o) => (
                <button
                  key={o.v}
                  onClick={() => setIntensity(o.v)}
                  className={`flex w-full items-center gap-2.5 rounded-xl p-2.5 text-left ring-1 transition ${
                    intensity === o.v ? "bg-rose/10 ring-rose/40" : "bg-surface-2 ring-transparent"
                  }`}
                >
                  <span
                    className={`grid h-4 w-4 shrink-0 place-items-center rounded-full ring-1 ${
                      intensity === o.v ? "bg-rose ring-rose" : "ring-border"
                    }`}
                  >
                    {intensity === o.v && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[12px] font-medium">{o.label}</span>
                    <span className="block truncate text-[10px] text-muted-foreground">{o.hint}</span>
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* 疲惫度 */}
          <section className="rounded-2xl bg-surface p-3.5 shadow-sm ring-1 ring-border/60">
            <p className="mb-2 text-[12px] font-semibold">
              运动后疲惫度 <span className="font-normal text-muted-foreground">（必填）</span>
            </p>
            <div className="flex gap-1.5">
              {FATIGUES.map((f) => (
                <button
                  key={f.v}
                  onClick={() => setFatigue(f.v)}
                  className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl py-2 ring-1 transition ${
                    fatigue === f.v ? "bg-rose/10 ring-rose/40" : "bg-surface-2 ring-transparent"
                  }`}
                >
                  <span
                    className={`text-[13px] font-bold ${fatigue === f.v ? "text-rose" : "text-muted-foreground"}`}
                  >
                    {f.v}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{f.label}</span>
                </button>
              ))}
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="补充情况，如「中途休息了两次」「有点咳嗽」"
              className="mt-2.5 w-full resize-none rounded-xl bg-surface-2 p-2.5 text-[12px] outline-none ring-1 ring-transparent placeholder:text-muted-foreground focus:ring-rose/40"
            />
          </section>

          {verdict && <VerdictCard v={verdict} />}
        </>
      )}
    </SheetShell>
  );
}
