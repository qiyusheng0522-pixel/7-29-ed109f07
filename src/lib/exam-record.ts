// Data model for the immersive (TikTok-style) exam recorder.
// Each item is one full-screen "card" the doctor swipes through.

export type ExamItemKind = "number" | "bp" | "choice";

export type ExamItem = {
  id: string;
  label: string;
  icon: string;
  /** 采集方式：设备自动 or 医生手动 */
  source: "auto" | "manual";
  kind: ExamItemKind;
  unit?: string;
  /** 正常参考范围（number / bp 用） */
  min?: number;
  max?: number;
  /** 舒张压范围（bp 用） */
  minDia?: number;
  maxDia?: number;
  /** 预采集初值（模拟设备自动同步 / 医生复核前的读数） */
  value?: number;
  valueDia?: number;
  /** choice 用 */
  options?: string[];
  normalOption?: string;
  /** 说明文案 */
  hint?: string;
};

// 9 岁儿童参考范围（示例值，用于原型演示）
// 采集设备：身高体脂分析仪 / 视力筛查仪 / 腰臀围尺 / 血压测量仪 / 脊柱侧弯测量尺（手工）+ 人工龋齿检查
export const EXAM_ITEMS: ExamItem[] = [
  {
    id: "height",
    label: "身高",
    icon: "📏",
    source: "auto",
    kind: "number",
    unit: "cm",
    min: 125,
    max: 142,
    value: 133,
    hint: "身高体脂分析仪自动同步",
  },
  {
    id: "weight",
    label: "体重",
    icon: "⚖️",
    source: "auto",
    kind: "number",
    unit: "kg",
    min: 24,
    max: 34,
    value: 38.6,
    hint: "身高体脂分析仪自动同步",
  },
  {
    id: "bodyfat",
    label: "体脂率",
    icon: "🧬",
    source: "auto",
    kind: "number",
    unit: "%",
    min: 12,
    max: 24,
    value: 27.5,
    hint: "身高体脂分析仪自动同步",
  },
  {
    id: "vision-l",
    label: "视力（左）",
    icon: "👁️",
    source: "auto",
    kind: "number",
    unit: "",
    min: 5.0,
    max: 5.3,
    value: 4.7,
    hint: "视力筛查仪自动同步 · 低于 5.0 需关注",
  },
  {
    id: "vision-r",
    label: "视力（右）",
    icon: "👁️",
    source: "auto",
    kind: "number",
    unit: "",
    min: 5.0,
    max: 5.3,
    value: 5.0,
    hint: "视力筛查仪自动同步 · 低于 5.0 需关注",
  },
  {
    id: "waist",
    label: "腰围",
    icon: "📐",
    source: "auto",
    kind: "number",
    unit: "cm",
    min: 50,
    max: 63,
    value: 68,
    hint: "腰臀围尺测量 · 腰围身高比参考 < 0.48",
  },
  {
    id: "hip",
    label: "臀围",
    icon: "📐",
    source: "auto",
    kind: "number",
    unit: "cm",
    min: 60,
    max: 76,
    value: 74,
    hint: "腰臀围尺测量",
  },
  {
    id: "bp",
    label: "血压",
    icon: "🩸",
    source: "auto",
    kind: "bp",
    unit: "mmHg",
    min: 85,
    max: 115,
    minDia: 55,
    maxDia: 75,
    value: 132,
    valueDia: 78,
    hint: "血压测量仪自动同步 · 收缩压 / 舒张压",
  },
  {
    id: "spine",
    label: "脊柱侧弯（ATR）",
    icon: "🦴",
    source: "manual",
    kind: "number",
    unit: "°",
    min: 0,
    max: 5,
    hint: "脊柱侧弯测量尺手工录入 · 前屈试验躯干旋转角",
  },
  {
    id: "oral",
    label: "口腔 · 龋齿",
    icon: "🦷",
    source: "manual",
    kind: "choice",
    options: ["正常", "龋齿 1-2 颗", "龋齿 3+ 颗", "牙龈异常"],
    normalOption: "正常",
    hint: "医生目测填写",
  },
];


export type ExamValue = {
  value?: number;
  valueDia?: number;
  choice?: string;
  /** 医生手动标记需重测（超范围时默认开启） */
  retest?: boolean;
};

export type ItemStatus = "normal" | "abnormal" | "empty";

export function evalItem(item: ExamItem, v: ExamValue | undefined): ItemStatus {
  if (!v) return item.source === "auto" ? evalItem(item, seedValue(item)) : "empty";
  if (item.kind === "choice") {
    if (!v.choice) return "empty";
    return v.choice === item.normalOption ? "normal" : "abnormal";
  }
  if (item.kind === "bp") {
    if (v.value == null || v.valueDia == null) return "empty";
    const sysBad = v.value < (item.min ?? -Infinity) || v.value > (item.max ?? Infinity);
    const diaBad = v.valueDia < (item.minDia ?? -Infinity) || v.valueDia > (item.maxDia ?? Infinity);
    return sysBad || diaBad ? "abnormal" : "normal";
  }
  if (v.value == null) return "empty";
  const bad = v.value < (item.min ?? -Infinity) || v.value > (item.max ?? Infinity);
  return bad ? "abnormal" : "normal";
}

export function seedValue(item: ExamItem): ExamValue {
  if (item.kind === "bp") return { value: item.value, valueDia: item.valueDia };
  if (item.kind === "number") return { value: item.value };
  return {};
}

export function rangeLabel(item: ExamItem): string {
  if (item.kind === "bp") return `收缩 ${item.min}–${item.max} / 舒张 ${item.minDia}–${item.maxDia}`;
  if (item.kind === "number") return `正常 ${item.min}–${item.max}${item.unit ? " " + item.unit : ""}`;
  return `正常：${item.normalOption}`;
}

/* ===================== 危机值（危急值 / 预警值）判定与处置 ===================== */

export type CritLevel = "危急值" | "预警值";

export type CritRule = {
  level: CritLevel;
  /** 触发条件文案（展示用） */
  rule: string;
  /** 数值触发阈值 */
  low?: number;
  high?: number;
  /** choice 触发项 */
  choices?: string[];
  /** 处置时限 */
  timeLimit: string;
  /** 结论摘要 */
  title: string;
  /** 处置方案步骤（需逐条勾选闭环） */
  plan: string[];
};

/**
 * 危机值判定标准（示例数据）
 * 仅对严重影响儿童健康、需要现场干预的 3 项指标启用：血压、视力、脊柱侧弯。
 * 其余项目（身高/体重/体脂/腰臀围/龋齿）只做异常提示，不进入危机值闭环。
 */
export const CRIT_RULES: Record<string, CritRule[]> = {
  bp: [
    {
      level: "危急值",
      rule: "收缩压 ≥ 130 mmHg",
      high: 130,
      timeLimit: "立即（30 分钟内）",
      title: "儿童高血压危急值",
      plan: [
        "体检医生静坐 5 分钟后换袖带复测并确认均值",
        "体检医生完成头痛/头晕/视物模糊症状评估",
        "体检医生确认已通知家长并开具心内科转诊",
      ],
    },
  ],
  "vision-l": [
    {
      level: "预警值",
      rule: "裸眼视力 ≤ 4.8",
      low: 4.8,
      timeLimit: "本次录检内",
      title: "视力低常预警（左眼）",
      plan: [
        "体检医生单眼遮盖复测一次并确认读数",
        "体检医生确认已询问配镜与用眼情况",
        "体检医生确认已开具眼科转诊建议",
      ],
    },
  ],
  "vision-r": [
    {
      level: "预警值",
      rule: "裸眼视力 ≤ 4.8",
      low: 4.8,
      timeLimit: "本次录检内",
      title: "视力低常预警（右眼）",
      plan: [
        "体检医生单眼遮盖复测一次并确认读数",
        "体检医生确认已询问配镜与用眼情况",
        "体检医生确认已开具眼科转诊建议",
      ],
    },
  ],
  spine: [
    {
      level: "预警值",
      rule: "躯干旋转角 ATR ≥ 7°",
      high: 7,
      timeLimit: "24 小时内",
      title: "脊柱侧弯高度可疑",
      plan: [
        "体检医生前屈试验复测 ATR 并确认角度",
        "体检医生确认已检查双肩/骨盆对称性与身高变化",
        "体检医生确认已开具骨科（脊柱专科）转诊并告知家长",
      ],
    },
  ],
};


/** 命中的危机值规则（未录入或正常则返回 null） */
export function critFor(item: ExamItem, v: ExamValue | undefined): CritRule | null {
  const rules = CRIT_RULES[item.id];
  if (!rules) return null;
  const val = v ?? (item.source === "auto" ? seedValue(item) : undefined);
  if (!val) return null;
  for (const r of rules) {
    if (r.choices && val.choice && r.choices.includes(val.choice)) return r;
    if (r.high != null && val.value != null && val.value >= r.high) return r;
    if (r.low != null && val.value != null && val.value <= r.low) return r;
  }
  return null;
}

