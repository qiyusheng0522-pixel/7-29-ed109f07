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
    hint: "身高体重秤自动同步",
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
    hint: "身高体重秤自动同步",
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
    value: 108,
    valueDia: 70,
    hint: "电子血压计自动同步 · 收缩压 / 舒张压",
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
  {
    id: "internal",
    label: "内科 · 心肺",
    icon: "🫁",
    source: "manual",
    kind: "choice",
    options: ["正常", "心律不齐", "呼吸音异常", "其他"],
    normalOption: "正常",
    hint: "听诊后填写",
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
