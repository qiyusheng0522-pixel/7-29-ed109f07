import { createFileRoute, useParams, useNavigate, Link } from "@tanstack/react-router";
import { StatusBar } from "@/components/MobileFrame";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { findExamUser, nextPendingExamUser } from "@/lib/exam-users";

import { EIcon } from "@/components/EIcon";
export const Route = createFileRoute("/doctor/entry/$id")({
  component: EntryPage,
});

type FieldType = "number" | "text";
type Source = "auto" | "manual";
type Crit = {
  low?: number;
  high?: number;
  name: string; // 危机值名称
  level: "危急值" | "预警值";
  plan: string[]; // 处理方案步骤
  timeLimit: string; // 处置时限
};
type Field = {
  key: string;
  label: string;
  type: FieldType;
  unit?: string;
  source: Source;
  ref?: string; // reference range hint
  min?: number; // 质控上下限
  max?: number;
  crit?: Crit; // 危机值规则
};
type Node = {
  key: string;
  name: string;
  icon: import("react").ReactNode;
  device?: string; // 自动采集设备名
  qc: {
    // 设备/方法学质控示例数据
    title: string;
    lines: string[];
    status: "在控" | "关注";
  };
  fields: Field[];
};

const NODES: Node[] = [
  {
    key: "body",
    name: "身高体重",
    icon: <EIcon e="📏" />,
    device: "身高体重一体机",
    qc: {
      title: "设备质控 · 身高体重一体机 SN-A103",
      status: "在控",
      lines: [
        "校准时间 今日 07:42 · 有效期内",
        "标准砝码 20.00 kg → 实测 20.01 kg（偏差 +0.05%，允差 ±0.5%）",
        "标准量杆 100.0 cm → 实测 100.1 cm（偏差 +0.1 cm，允差 ±0.5 cm）",
      ],
    },
    fields: [
      { key: "height", label: "身高", type: "number", unit: "cm", source: "auto", ref: "125–150", min: 125, max: 150 },
      { key: "weight", label: "体重", type: "number", unit: "kg", source: "auto", ref: "24–40", min: 24, max: 40 },
      {
        key: "bmi",
        label: "BMI",
        type: "number",
        source: "auto",
        ref: "14.5–16.8",
        min: 14.5,
        max: 16.8,
        crit: {
          high: 20,
          name: "重度肥胖（BMI ≥ 20，同龄 P99）",
          level: "预警值",
          timeLimit: "24 小时内",
          plan: [
            "现场复测身高体重并核对出生日期，排除录入错误",
            "加测腰围、血压，询问打鼾/嗜睡等合并症",
            "当日推送家长端预警通知，建议 2 周内内分泌/儿保门诊评估",
            "登记至重点关注名单，纳入 12 周体重管理随访",
          ],
        },
      },
    ],
  },
  {
    key: "vision",
    name: "视力",
    icon: <EIcon e="👁" />,
    device: "自动视力筛查仪",
    qc: {
      title: "设备质控 · 自动视力筛查仪 SN-V217",
      status: "在控",
      lines: [
        "环境照度 320 lux（要求 200–500 lux）· 检测距离 5.0 m",
        "标准视标卡比对：5.0 / 4.6 两档均一致",
        "规则：任一眼 < 4.9 必须间隔 5 分钟复测一次",
      ],
    },
    fields: [
      {
        key: "left",
        label: "左眼",
        type: "number",
        source: "auto",
        ref: "≥ 4.9",
        min: 4.9,
        crit: {
          low: 4.0,
          name: "重度视力低下（裸眼 ≤ 4.0）",
          level: "预警值",
          timeLimit: "当日内",
          plan: [
            "间隔 5 分钟遮盖单眼复测，排除配合不佳与镜片污损",
            "加做电脑验光与眼位检查，记录是否有眯眼、歪头",
            "当日推送家长端预警，建议 1 周内眼科散瞳验光",
            "登记至视力重点关注名单，安排 3 个月复查",
          ],
        },
      },
      { key: "right", label: "右眼", type: "number", source: "auto", ref: "≥ 4.9", min: 4.9 },
      { key: "visionNote", label: "备注", type: "text", source: "manual" },
    ],

  },
  {
    key: "bp",
    name: "血压 / 心率",
    icon: <EIcon e="💓" />,
    device: "电子血压计",
    qc: {
      title: "设备质控 · 电子血压计 SN-B088",
      status: "在控",
      lines: [
        "模拟压力源 120/80 → 实测 121/79（允差 ±3 mmHg）",
        "袖带规格：儿童袖带 9×18 cm，已按臂围复核",
        "规则：安静休息 5 分钟后测量，超限需间隔 2 分钟复测",
      ],
    },
    fields: [
      {
        key: "sbp",
        label: "收缩压",
        type: "number",
        unit: "mmHg",
        source: "auto",
        ref: "85–120",
        min: 85,
        max: 120,
        crit: {
          high: 130,
          low: 75,
          name: "血压危急（收缩压 ≥ 130 或 ≤ 75 mmHg）",
          level: "危急值",
          timeLimit: "30 分钟内",
          plan: [
            "立即安静休息 5 分钟后换臂复测，确认袖带规格匹配",
            "复测仍超限：现场心电+症状评估（头痛/视物模糊/心悸）",
            "30 分钟内电话通知家长与校医，签署知情告知",
            "启动绿色通道转诊市儿童医院心内科，专人陪同",
            "填写危急值登记表并上报科室质控组",
          ],
        },
      },
      { key: "dbp", label: "舒张压", type: "number", unit: "mmHg", source: "auto", ref: "50–78", min: 50, max: 78 },
      {
        key: "hr",
        label: "心率",
        type: "number",
        unit: "bpm",
        source: "auto",
        ref: "70–110",
        min: 70,
        max: 110,
        crit: {
          high: 140,
          low: 55,
          name: "心率危急（≥ 140 或 ≤ 55 bpm）",
          level: "危急值",
          timeLimit: "即刻",
          plan: [
            "即刻停止其余检查项目，就地平卧、监测指脉氧",
            "复测心率并加做心电图，记录有无胸闷、晕厥史",
            "即刻电话通知家长与校医，必要时呼叫 120",
            "转诊儿童心内科，交接单随行并留痕",
          ],
        },
      },
      {
        key: "spo2",
        label: "血氧饱和度",
        type: "number",
        unit: "%",
        source: "auto",
        ref: "≥ 95",
        min: 95,
        crit: {
          low: 92,
          name: "低氧血症（SpO₂ ≤ 92%）",
          level: "危急值",
          timeLimit: "即刻",
          plan: [
            "更换手指、擦净指甲油/污渍后即刻复测，确认波形稳定",
            "复测仍 ≤92%：就地半卧位吸氧，评估呼吸频率、口唇发绀",
            "即刻电话通知家长与校医，必要时呼叫 120",
            "绿色通道转诊儿童呼吸科，危急值登记双签字",
          ],
        },
      },
    ],

  },
  {
    key: "oral",
    name: "口腔",
    icon: <EIcon e="🦷" />,
    qc: {
      title: "手工项质控 · 口腔检查",
      status: "在控",
      lines: [
        "检查者 张医生（口腔科，资质校验通过）· 器械一人一用一消毒",
        "规则：龋齿 ≥ 4 颗需第二名医师双人核对",
        "本日一致性抽查：抽 5 人，符合率 100%",
      ],
    },
    fields: [
      {
        key: "caries",
        label: "龋齿颗数",
        type: "number",
        source: "manual",
        ref: "0–3",
        min: 0,
        max: 3,
        crit: {
          high: 6,
          name: "重度龋（≥ 6 颗，含可疑牙髓炎）",
          level: "预警值",
          timeLimit: "24 小时内",
          plan: [
            "第二名口腔科医师现场双人核对并拍照留痕",
            "评估是否有自发痛、面部肿胀等急性感染表现",
            "当日推送家长端预警，建议 1 周内口腔科就诊治疗",
            "纳入口腔重点关注名单，3 个月复查窝沟封闭情况",
          ],
        },
      },

      { key: "oralNote", label: "口腔检查描述", type: "text", source: "manual" },
    ],
  },
  {
    key: "internal",
    name: "内科查体",
    icon: <EIcon e="🩺" />,
    qc: {
      title: "手工项质控 · 内科查体",
      status: "在控",
      lines: [
        "检查者 李医生（儿科主治）· 听诊器已消毒",
        "规则：描述必须填写，异常体征需语音留痕并二次确认",
        "本日一致性抽查：抽 5 人，符合率 100%",
      ],
    },
    fields: [
      { key: "heartLung", label: "心肺听诊", type: "text", source: "manual" },
      { key: "abdomen", label: "腹部触诊", type: "text", source: "manual" },
    ],
  },
  {
    key: "lab",
    name: "实验室",
    icon: <EIcon e="🧪" />,
    device: "生化分析仪",
    qc: {
      title: "室内质控 · 生化分析仪 SN-L512",
      status: "关注",
      lines: [
        "血糖质控品 L2：靶值 5.55 ± 0.28 → 实测 5.60（在控，1-2s 未触发）",
        "血红蛋白质控品 N1：靶值 128 ± 6 → 实测 126（在控）",
        "⚠ 近 5 日血糖质控连续偏高（4-1s 预警），结果超限一律复查一次",
      ],
    },
    fields: [
      {
        key: "glu",
        label: "空腹血糖",
        type: "number",
        unit: "mmol/L",
        source: "auto",
        ref: "3.9–6.1",
        min: 3.9,
        max: 6.1,
        crit: {
          high: 7.0,
          low: 2.8,
          name: "血糖危急（≥ 7.0 或 ≤ 2.8 mmol/L）",
          level: "危急值",
          timeLimit: "15 分钟内",
          plan: [
            "即刻用指尖血糖仪复核一次，核对是否真空腹（≥8 小时）",
            "低血糖（≤2.8）：立即口服 15g 葡萄糖，15 分钟后复测",
            "高血糖（≥7.0）：加测尿酮体，询问多饮多尿多食、体重下降",
            "15 分钟内电话通知家长与校医并记录接收人、时间",
            "绿色通道转诊内分泌科当日就诊，危急值登记表双签字上报",
          ],
        },
      },
      {
        key: "hb",
        label: "血红蛋白",
        type: "number",
        unit: "g/L",
        source: "auto",
        ref: "115–150",
        min: 115,
        max: 150,
        crit: {
          low: 90,
          name: "中重度贫血（Hb ≤ 90 g/L）",
          level: "危急值",
          timeLimit: "2 小时内",
          plan: [
            "原样本复查一次，排除稀释/凝血等分析前误差",
            "评估面色、乏力、心率，必要时暂停后续运动类项目",
            "2 小时内通知家长与校医，建议当日血液科/儿科就诊",
            "危急值登记并纳入 1 个月复查随访",
          ],
        },
      },
    ],
  },
];

const MOCK_AUTO: Record<string, string> = {
  height: "138",
  weight: "39.2",
  bmi: "20.6", // 预警值示例：BMI ≥ 20（同龄 P99）
  left: "3.9", // 预警值示例：裸眼视力 ≤ 4.0
  right: "4.7",
  sbp: "134", // 危急值示例：收缩压 ≥ 130 mmHg
  dbp: "82",
  hr: "96",
  spo2: "97",
  glu: "7.4", // 危急值示例：空腹血糖 ≥ 7.0 mmol/L
  hb: "112",
};

// 复测示例值（第二次测量，用于质控留痕）
const MOCK_RETEST: Record<string, string> = {
  weight: "39.1",
  bmi: "20.5",
  left: "3.9",
  right: "4.8",
  sbp: "131",
  dbp: "80",
  hb: "113",
  glu: "7.3",
};


function outOfRange(f: Field, raw?: string) {
  if (f.type !== "number" || !raw) return false;
  const v = Number(raw);
  if (Number.isNaN(v)) return false;
  if (f.min !== undefined && v < f.min) return true;
  if (f.max !== undefined && v > f.max) return true;
  return false;
}

// 危机值判定
function isCritical(f: Field, raw?: string) {
  if (!f.crit || f.type !== "number" || !raw) return false;
  const v = Number(raw);
  if (Number.isNaN(v)) return false;
  if (f.crit.high !== undefined && v >= f.crit.high) return true;
  if (f.crit.low !== undefined && v <= f.crit.low) return true;
  return false;
}

// Simple Web Speech recognition wrapper
function useSpeech(onText: (t: string) => void) {
  const [listening, setListening] = useState(false);
  const recRef = useRef<any>(null);

  const start = () => {
    const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      toast.error("当前浏览器不支持语音识别", { description: "请手动输入或使用 Chrome" });
      return;
    }
    const rec = new SR();
    rec.lang = "zh-CN";
    rec.interimResults = false;
    rec.onresult = (e: any) => {
      const text = Array.from(e.results).map((r: any) => r[0].transcript).join("");
      onText(text);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    recRef.current = rec;
    rec.start();
    setListening(true);
  };
  const stop = () => {
    recRef.current?.stop?.();
    setListening(false);
  };
  return { listening, start, stop };
}

function TextFieldVoice({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const { listening, start, stop } = useSpeech((t) => onChange((value ? value + " " : "") + t));
  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full resize-y rounded-xl bg-surface-2 p-3 pr-12 text-[13px] leading-relaxed outline-none ring-1 ring-transparent focus:ring-deep"
      />
      <button
        type="button"
        onClick={listening ? stop : start}
        className={`absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full text-[13px] transition ${
          listening ? "bg-danger text-white animate-pulse" : "bg-deep/10 text-deep"
        }`}
        title={listening ? "停止录音" : "语音输入"}
      >
        {<EIcon e="🎤" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />}
      </button>
    </div>
  );
}

type QcLog = { time: string; text: string };

function nowStr() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

function EntryPage() {
  const { id } = useParams({ from: "/doctor/entry/$id" });
  const navigate = useNavigate();
  const user = findExamUser(id);
  const nextUser = nextPendingExamUser(id);
  const [values, setValues] = useState<Record<string, string>>({});
  const [retests, setRetests] = useState<Record<string, string>>({});
  const [verified, setVerified] = useState<Record<string, boolean>>({});
  // 危机值处置：每个字段已完成的处置步骤
  const [critSteps, setCritSteps] = useState<Record<string, number[]>>({});
  const [critDone, setCritDone] = useState<Record<string, boolean>>({});
  const [step, setStep] = useState(0); // 只能按项前进，禁止一次滑过多项
  const [submitted, setSubmitted] = useState(false);
  const [logs, setLogs] = useState<QcLog[]>([
    { time: nowStr(), text: "开始录入 · 已核验受检者身份（学号 + 校方名单双向匹配）" },
  ]);

  const active = NODES[step];

  // 模拟自动采集（进入节点时，若未填则回填 mock）
  useEffect(() => {
    const node = NODES[step];
    if (!node) return;
    setValues((prev) => {
      const next = { ...prev };
      node.fields.forEach((f) => {
        if (f.source === "auto" && !next[f.key] && MOCK_AUTO[f.key]) {
          next[f.key] = MOCK_AUTO[f.key];
        }
      });
      return next;
    });
  }, [step]);

  const progress = useMemo(() => {
    const done = NODES.filter((n) => verified[n.key]).length;
    return { done, total: NODES.length };
  }, [verified]);

  const setV = (k: string, v: string) => setValues((p) => ({ ...p, [k]: v }));

  const addLog = (text: string) => setLogs((p) => [...p, { time: nowStr(), text }]);

  const flagged = active.fields.filter((f) => outOfRange(f, values[f.key]));
  const pendingRetest = flagged.filter((f) => !retests[f.key]);
  const critFields = active.fields.filter((f) => isCritical(f, values[f.key]));
  const pendingCrit = critFields.filter((f) => !critDone[f.key]);

  const nodeComplete = active.fields.every((f) =>
    f.source === "auto" ? !!values[f.key] : f.type === "text" ? true : !!values[f.key],
  );

  const doRetest = (f: Field) => {
    const v = MOCK_RETEST[f.key] ?? values[f.key] ?? "";
    setRetests((p) => ({ ...p, [f.key]: v }));
    addLog(`${active.name} · ${f.label} 超出质控范围，已复测：${values[f.key]} → ${v}（双人核对：张医生 / 李医生）`);
    toast.success(`${f.label} 已完成复测`, { description: `复测值 ${v}${f.unit ? " " + f.unit : ""}` });
  };

  const toggleCritStep = (f: Field, idx: number) => {
    setCritSteps((p) => {
      const cur = p[f.key] ?? [];
      const next = cur.includes(idx) ? cur.filter((i) => i !== idx) : [...cur, idx];
      return { ...p, [f.key]: next };
    });
  };

  const closeCrit = (f: Field) => {
    const steps = critSteps[f.key] ?? [];
    if (!f.crit || steps.length < f.crit.plan.length) {
      toast.error("危机值处置未完成", { description: "请逐条勾选处置措施后再闭环" });
      return;
    }
    setCritDone((p) => ({ ...p, [f.key]: true }));
    addLog(
      `⚠ ${f.crit.level}｜${active.name} · ${f.label} ${values[f.key]}${f.unit ? " " + f.unit : ""} 触发「${f.crit.name}」，${f.crit.timeLimit}内完成 ${f.crit.plan.length} 项处置并闭环（报告人 张医生 / 接收人 李医生，家长已电话告知）`,
    );
    toast.success(`${f.label} 危机值已闭环`, { description: "已生成危急值登记并推送家长端" });
  };

  const verifyNode = () => {
    if (!nodeComplete) {
      toast.error("请补齐必填项");
      return;
    }
    if (pendingRetest.length > 0) {
      toast.error("质控未通过", { description: `${pendingRetest.map((f) => f.label).join("、")} 超出范围，需先复测` });
      return;
    }
    if (pendingCrit.length > 0) {
      toast.error("危机值未闭环", {
        description: `${pendingCrit.map((f) => f.label).join("、")} 触发危机值，请先执行处理方案`,
      });
      return;
    }
    setVerified((p) => ({ ...p, [active.key]: true }));
    addLog(
      `${active.name} 质控通过并归档（${active.qc.status}）· 项目 ${step + 1}/${NODES.length} · 核对人 李医生`,
    );
    toast.success(`${active.name} 质控通过`, { description: `第 ${step + 1}/${NODES.length} 项已归档` });
    if (step < NODES.length - 1) setStep(step + 1);
  };


  const pullAuto = () => {
    setValues((prev) => {
      const next = { ...prev };
      active.fields.forEach((f) => {
        if (f.source === "auto" && MOCK_AUTO[f.key]) next[f.key] = MOCK_AUTO[f.key];
      });
      return next;
    });
    addLog(`${active.name} · 从${active.device}读取原始数据（设备直连，不可手改）`);
    toast.success(`已从${active.device ?? "设备"}采集`);
  };

  const goPrev = () => {
    if (step > 0) setStep(step - 1);
  };
  const goNext = () => {
    if (!verified[active.key]) {
      toast.error("请先完成本项质控核对", { description: "按项推进，不可跳项" });
      return;
    }
    if (step < NODES.length - 1) setStep(step + 1);
  };

  return (
    <div className="min-h-full bg-muted/40">
      <StatusBar title="体检录入" />
      <div className="px-4 pb-24 pt-2">
        {/* Header — 与待检学生列表信息一致 */}
        <div className="mb-3 rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-border/60">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-deep/10 text-sm font-bold text-deep">
              {user?.name.slice(-1) ?? "?"}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-bold">
                {user?.name ?? "未知学生"}
                <span className="ml-2 text-[11px] font-normal text-muted-foreground">
                  {user ? `${user.grade} · ${user.age}岁${user.gender}` : "阳光小学"}
                </span>
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">学号 {id}</p>
              {user?.tags && user.tags.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {user.tags.map((t) => (
                    <span key={t} className="rounded bg-surface-2 px-1.5 py-0.5 text-[10px] text-muted-foreground">{t}</span>
                  ))}
                </div>
              )}
              {user?.eta && <p className="mt-1 text-[10px] text-warm">⏱ {user.eta}</p>}
            </div>
            <span className="shrink-0 rounded-full bg-deep/10 px-2.5 py-1 text-[11px] font-medium text-deep">
              进度 {progress.done}/{progress.total}
            </span>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full rounded-full bg-deep transition-all"
              style={{ width: `${(progress.done / progress.total) * 100}%` }}
            />
          </div>
        </div>

        {/* 步骤指示器 —— 固定不可横向滑动，只能按项推进 */}
        <div className="mb-3 rounded-2xl bg-surface p-3 shadow-sm ring-1 ring-border/60">
          <div className="flex items-center justify-between">
            {NODES.map((n, i) => {
              const done = verified[n.key];
              const on = i === step;
              return (
                <div key={n.key} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center gap-1">
                    <span
                      className={`grid h-6 w-6 place-items-center rounded-full text-[11px] font-bold ${
                        done
                          ? "bg-success text-white"
                          : on
                          ? "bg-deep text-deep-foreground"
                          : "bg-surface-2 text-muted-foreground"
                      }`}
                    >
                      {done ? "✓" : i + 1}
                    </span>
                    <span className={`text-[9.5px] ${on ? "text-deep font-medium" : "text-muted-foreground"}`}>
                      {n.name}
                    </span>
                  </div>
                  {i < NODES.length - 1 && (
                    <div className={`mx-1 mb-4 h-0.5 flex-1 rounded ${verified[n.key] ? "bg-success" : "bg-border"}`} />
                  )}
                </div>
              );
            })}
          </div>
          <p className="mt-2 text-center text-[10px] text-muted-foreground">
            按项质检推进 · 当前第 {step + 1}/{NODES.length} 项，未质控通过不可跳项
          </p>
        </div>

        {/* Active node card */}
        <div className="rounded-2xl bg-surface p-5 shadow-sm ring-1 ring-border/60">
          <div className="mb-3 flex items-center justify-between">
            <p className="flex items-center gap-2 text-[15px] font-semibold">
              <span>{active.icon}</span> {active.name}
            </p>
            {active.device && (
              <button
                onClick={pullAuto}
                className="rounded-full bg-deep/10 px-2.5 py-1 text-[11px] font-medium text-deep"
              >
                采集 {active.device}
              </button>
            )}
          </div>

          {/* 质控卡片 */}
          <div
            className={`mb-4 rounded-xl p-3 ring-1 ${
              active.qc.status === "在控" ? "bg-teal/8 ring-teal/25" : "bg-warm/10 ring-warm/30"
            }`}
          >
            <div className="mb-1 flex items-center justify-between">
              <p className={`text-[11.5px] font-semibold ${active.qc.status === "在控" ? "text-teal" : "text-warm"}`}>
                <EIcon e="🧭" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" /> {active.qc.title}
              </p>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  active.qc.status === "在控" ? "bg-teal/15 text-teal" : "bg-warm/20 text-warm"
                }`}
              >
                {active.qc.status}
              </span>
            </div>
            <ul className="space-y-0.5">
              {active.qc.lines.map((l) => (
                <li key={l} className="text-[10.5px] leading-relaxed text-muted-foreground">
                  · {l}
                </li>
              ))}
            </ul>
          </div>

          {/* 本项危机值判定标准（示例参考） */}
          {active.fields.some((f) => f.crit) && (
            <div className="mb-4 rounded-xl bg-muted/50 p-3 ring-1 ring-border">
              <p className="mb-1.5 text-[11.5px] font-semibold text-foreground">
                <EIcon e="📕" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" /> 本项危机值判定标准（示例）
              </p>
              <ul className="space-y-1">
                {active.fields
                  .filter((f) => f.crit)
                  .map((f) => (
                    <li key={f.key} className="flex items-start gap-2 text-[10.5px] leading-relaxed">
                      <span
                        className={`mt-[1px] shrink-0 rounded-full px-1.5 py-0.5 text-[9.5px] font-medium ${
                          f.crit!.level === "危急值" ? "bg-danger/15 text-danger" : "bg-warm/20 text-warm"
                        }`}
                      >
                        {f.crit!.level}
                      </span>
                      <span className="text-muted-foreground">
                        {f.label}：
                        {f.crit!.low !== undefined ? `≤ ${f.crit!.low}` : ""}
                        {f.crit!.low !== undefined && f.crit!.high !== undefined ? " 或 " : ""}
                        {f.crit!.high !== undefined ? `≥ ${f.crit!.high}` : ""}
                        {f.unit ? ` ${f.unit}` : ""} · {f.crit!.timeLimit}处置 · 共 {f.crit!.plan.length} 步闭环
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          )}

          {/* 危机值总提示 */}
          {critFields.length > 0 && (
            <div className="mb-4 rounded-xl bg-danger/10 p-3 ring-1 ring-danger/40">
              <p className="text-[12px] font-bold text-danger">
                <EIcon e="🚨" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" /> 检出危机值 {critFields.length} 项 · 需按处理方案闭环后方可归档
              </p>
              <p className="mt-1 text-[10.5px] text-danger/80">
                {critFields.map((f) => `${f.label} ${values[f.key]}${f.unit ?? ""}`).join("　")}
              </p>
            </div>
          )}

          <div className="space-y-3">
            {active.fields.map((f) => {
              const bad = outOfRange(f, values[f.key]);
              const retested = !!retests[f.key];
              const crit = isCritical(f, values[f.key]) ? f.crit! : null;
              const steps = critSteps[f.key] ?? [];

              return (
                <div key={f.key}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="text-[12px] text-muted-foreground">
                      {f.label}
                      {f.unit && <span className="ml-1 opacity-70">({f.unit})</span>}
                      <span
                        className={`ml-2 rounded px-1 py-0.5 text-[10px] ${
                          f.source === "auto" ? "bg-teal/10 text-teal" : "bg-warm/10 text-warm"
                        }`}
                      >
                        {f.source === "auto" ? "自动" : "手动"}
                      </span>
                    </label>
                    {f.ref && <span className="text-[10px] text-muted-foreground">质控范围 {f.ref}</span>}
                  </div>
                  {f.type === "text" ? (
                    <TextFieldVoice
                      value={values[f.key] ?? ""}
                      onChange={(v) => setV(f.key, v)}
                      placeholder="点击麦克风语音输入，或手动填写"
                    />
                  ) : (
                    <input
                      type="number"
                      inputMode="decimal"
                      value={values[f.key] ?? ""}
                      onChange={(e) => setV(f.key, e.target.value)}
                      className={`w-full rounded-xl bg-surface-2 px-3 py-2.5 text-[14px] outline-none ring-1 focus:ring-deep ${
                        bad ? "ring-danger/60" : "ring-transparent"
                      }`}
                      placeholder={f.source === "auto" ? "等待设备采集…" : "手动输入"}
                    />
                  )}

                  {bad && (
                    <div className="mt-1.5 rounded-lg bg-danger/8 p-2 ring-1 ring-danger/25">
                      <p className="text-[10.5px] text-danger">
                        <EIcon e="⚠" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" /> 触发质控规则：
                        {values[f.key]}
                        {f.unit ? ` ${f.unit}` : ""} 超出 {f.ref}，需复测确认后方可归档
                      </p>
                      {retested ? (
                        <p className="mt-1 text-[10.5px] text-success">
                          ✓ 复测值 {retests[f.key]}
                          {f.unit ? ` ${f.unit}` : ""} · 两次差值{" "}
                          {Math.abs(Number(retests[f.key]) - Number(values[f.key])).toFixed(2)} · 双人核对通过
                        </p>
                      ) : (
                        <button
                          onClick={() => doRetest(f)}
                          className="mt-1.5 rounded-full bg-danger px-2.5 py-1 text-[10.5px] font-medium text-white"
                        >
                          发起复测（双人核对）
                        </button>
                      )}
                    </div>
                  )}

                  {/* 危机值处理方案 */}
                  {crit && (
                    <div className="mt-2 overflow-hidden rounded-xl ring-1 ring-danger/50">
                      <div className="flex items-center justify-between bg-danger px-3 py-2">
                        <p className="text-[11.5px] font-bold text-white">
                          <EIcon e="🚨" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" /> {crit.level}｜{crit.name}
                        </p>
                        <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-medium text-white">
                          {crit.timeLimit}处置
                        </span>
                      </div>
                      <div className="bg-danger/5 p-3">
                        <p className="mb-2 text-[10.5px] text-danger">
                          实测 {values[f.key]}
                          {f.unit ? ` ${f.unit}` : ""}｜危机阈值{" "}
                          {crit.low !== undefined ? `≤ ${crit.low}` : ""}
                          {crit.low !== undefined && crit.high !== undefined ? " 或 " : ""}
                          {crit.high !== undefined ? `≥ ${crit.high}` : ""}
                          {f.unit ? ` ${f.unit}` : ""}
                        </p>
                        <p className="mb-1.5 text-[11px] font-semibold">处理方案（逐条执行并勾选）</p>
                        <ul className="space-y-1.5">
                          {crit.plan.map((s, i) => {
                            const on = steps.includes(i);
                            return (
                              <li key={s}>
                                <button
                                  type="button"
                                  disabled={critDone[f.key]}
                                  onClick={() => toggleCritStep(f, i)}
                                  className="flex w-full items-start gap-2 rounded-lg bg-surface p-2 text-left"
                                >
                                  <span
                                    className={`mt-[1px] grid h-4 w-4 shrink-0 place-items-center rounded-full text-[9px] ${
                                      on ? "bg-success text-white" : "bg-surface-2 text-muted-foreground"
                                    }`}
                                  >
                                    {on ? "✓" : i + 1}
                                  </span>
                                  <span className={`text-[10.5px] leading-relaxed ${on ? "text-muted-foreground line-through" : ""}`}>
                                    {s}
                                  </span>
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                        {critDone[f.key] ? (
                          <p className="mt-2 rounded-lg bg-success/10 px-2 py-1.5 text-[10.5px] text-success">
                            ✓ 危机值已闭环 · 报告人 张医生 / 接收人 李医生 · 家长与校医已告知 · 已生成危急值登记
                          </p>
                        ) : (
                          <button
                            onClick={() => closeCrit(f)}
                            className="mt-2 w-full rounded-lg bg-danger py-2 text-[11px] font-semibold text-white"
                          >
                            确认危机值处置完成并闭环（{steps.length}/{crit.plan.length}）
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

          </div>

          {/* 本项质控结论 */}
          <div className="mt-4 rounded-xl bg-surface-2 p-3">
            <p className="text-[11px] font-semibold">本项质控结论</p>
            <p className="mt-1 text-[10.5px] text-muted-foreground">
              必填完整性 {nodeComplete ? "✓ 通过" : "✗ 未通过"} · 阈值校验 {flagged.length === 0 ? "✓ 全部在范围内" : `⚠ ${flagged.length} 项超限`} ·
              复测闭环 {pendingRetest.length === 0 ? "✓ 已闭环" : `✗ 待复测 ${pendingRetest.length} 项`} ·
              危机值 {critFields.length === 0 ? "✓ 未触发" : pendingCrit.length === 0 ? `✓ ${critFields.length} 项已闭环` : `🚨 ${pendingCrit.length} 项待处置`}
            </p>
          </div>

          <button
            onClick={verifyNode}
            disabled={verified[active.key]}
            className={`mt-4 w-full rounded-xl py-3 text-sm font-medium transition ${
              verified[active.key] ? "bg-success/15 text-success" : "bg-deep text-deep-foreground"
            }`}
          >
            {verified[active.key] ? "✓ 本项已质控归档" : "质控核对并保存本项"}
          </button>

          {/* 按项推进导航 */}
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={goPrev}
              disabled={step === 0}
              className="flex-1 rounded-xl bg-surface-2 py-2.5 text-[12px] disabled:opacity-40"
            >
              ‹ 上一项
            </button>
            <span className="shrink-0 text-[11px] text-muted-foreground">
              {step + 1} / {NODES.length}
            </span>
            <button
              onClick={goNext}
              disabled={step === NODES.length - 1}
              className={`flex-1 rounded-xl py-2.5 text-[12px] disabled:opacity-40 ${
                verified[active.key] ? "bg-deep text-deep-foreground" : "bg-surface-2 text-muted-foreground"
              }`}
            >
              下一项 ›
            </button>
          </div>
        </div>

        {/* 质控留痕 */}
        <div className="mt-3 rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-border/60">
          <p className="mb-2 text-[12px] font-semibold">
            <EIcon e="📝" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" /> 质控留痕（不可篡改）
          </p>
          <ul className="space-y-1">
            {logs.map((l, i) => (
              <li key={i} className="flex gap-2 text-[10.5px] text-muted-foreground">
                <span className="shrink-0 tabular-nums text-foreground/70">{l.time}</span>
                <span>{l.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 完成 · 汇总所有检测项结果 */}
        {progress.done === progress.total && (
          <div className="mt-4 rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-success/30">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[14px] font-bold text-success">{<EIcon e="✓" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />} 本次体检已全部完成</p>
              <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] text-success">{NODES.length} 项</span>
            </div>
            <p className="mb-3 text-[11px] text-muted-foreground">
              {user?.name ?? "学生"} · 学号 {id} · 全部 {NODES.length} 项逐项质控通过，复测 {Object.keys(retests).length} 项。
            </p>
            <div className="space-y-2">
              {NODES.map((n) => (
                <div key={n.key} className="rounded-xl bg-surface-2 p-3">
                  <div className="mb-1.5 flex items-center justify-between">
                    <p className="text-[12px] font-semibold">{n.icon} {n.name}</p>
                    <span className="text-[10px] text-success">{<EIcon e="✓" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />} 质控通过</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {n.fields.map((f) => {
                      const v = values[f.key];
                      if (!v) return null;
                      return (
                        <div key={f.key} className="flex items-center justify-between rounded-lg bg-surface px-2 py-1">
                          <span className="text-[11px] text-muted-foreground">{f.label}</span>
                          <span className="text-[12px] font-medium">
                            {retests[f.key] ?? v}{f.unit ? ` ${f.unit}` : ""}
                            {retests[f.key] && <span className="ml-1 text-[9.5px] text-warm">复测</span>}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {!submitted ? (
              <button
                onClick={() => {
                  setSubmitted(true);
                  addLog("提交至报告审核 · 质控合格率 100%");
                  toast.success("已提交至报告审核", { description: `学号 ${id}` });
                }}
                className="mt-4 w-full rounded-xl bg-success py-3 text-sm font-medium text-white"
              >
                提交报告
              </button>
            ) : (
              <div className="mt-4 space-y-2">
                <p className="rounded-xl bg-success/10 px-3 py-2 text-center text-[12px] text-success">
                  {<EIcon e="✓" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />} 报告已提交，等待复核
                </p>
                {nextUser ? (
                  <button
                    onClick={() => {
                      navigate({ to: "/doctor/entry/$id", params: { id: nextUser.id } });
                      setValues({});
                      setRetests({});
                      setVerified({});
                      setStep(0);
                      setSubmitted(false);
                      setLogs([{ time: nowStr(), text: "开始录入 · 已核验受检者身份" }]);
                    }}
                    className="w-full rounded-xl bg-deep py-3 text-sm font-medium text-deep-foreground"
                  >
                    下一位体检 · {nextUser.name}（{nextUser.grade}）›
                  </button>
                ) : (
                  <Link
                    to="/doctor/exam"
                    className="block w-full rounded-xl bg-surface-2 py-3 text-center text-sm font-medium"
                  >
                    今日待检已全部完成 · 返回用户列表
                  </Link>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
