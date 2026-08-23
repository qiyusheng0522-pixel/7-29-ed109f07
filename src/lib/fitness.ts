// 体适能（国家学生体质健康标准·三年级示例）——体育老师录入用的评分与花名册
export type Gender = "男" | "女";
export type FitGrade = "优秀" | "良好" | "及格" | "不及格";

export type FitItem = {
  key: string;
  label: string;
  icon: string;
  unit: string;
  /** 数值越小越好（如跑步用时） */
  lowerBetter?: boolean;
  /** 及格 / 良好 / 优秀 阈值（按性别） */
  cut: Record<Gender, { pass: number; good: number; great: number }>;
  tip: string;
};

/** 三年级（约 9 岁）示例标准，原型用简化阈值 */
export const FIT_ITEMS: FitItem[] = [
  {
    key: "sprint50",
    label: "50 米跑",
    icon: "🏃",
    unit: "秒",
    lowerBetter: true,
    cut: { 男: { pass: 11.2, good: 9.6, great: 9.0 }, 女: { pass: 11.6, good: 10.0, great: 9.4 } },
    tip: "起跑口令统一，电子计时，取一次有效成绩",
  },
  {
    key: "sitreach",
    label: "坐位体前屈",
    icon: "🧘",
    unit: "cm",
    cut: { 男: { pass: 0.6, good: 7.5, great: 11.5 }, 女: { pass: 3.6, good: 10.6, great: 14.5 } },
    tip: "双腿伸直不屈膝，缓慢前推，取两次最好成绩",
  },
  {
    key: "jump",
    label: "立定跳远",
    icon: "🦘",
    unit: "cm",
    cut: { 男: { pass: 112, good: 138, great: 152 }, 女: { pass: 106, good: 130, great: 144 } },
    tip: "双脚起跳不得踩线，测量最近着地点",
  },
  {
    key: "rope",
    label: "1 分钟跳绳",
    icon: "🪢",
    unit: "个",
    cut: { 男: { pass: 60, good: 109, great: 129 }, 女: { pass: 63, good: 117, great: 137 } },
    tip: "计时 1 分钟，中断可续跳，记累计个数",
  },
  {
    key: "situp",
    label: "1 分钟仰卧起坐",
    icon: "💪",
    unit: "个",
    cut: { 男: { pass: 10, good: 24, great: 32 }, 女: { pass: 12, good: 26, great: 34 } },
    tip: "双手抱头，肩胛离垫、肘触膝记 1 个",
  },
  {
    key: "vital",
    label: "肺活量",
    icon: "🫁",
    unit: "mL",
    cut: { 男: { pass: 1100, good: 1600, great: 1900 }, 女: { pass: 900, good: 1400, great: 1700 } },
    tip: "一次性深吸尽呼，测两次取最好值",
  },
];

export function gradeOf(item: FitItem, gender: Gender, raw: string): FitGrade | null {
  const v = Number(raw);
  if (!raw.trim() || Number.isNaN(v)) return null;
  const c = item.cut[gender];
  if (item.lowerBetter) {
    if (v <= c.great) return "优秀";
    if (v <= c.good) return "良好";
    if (v <= c.pass) return "及格";
    return "不及格";
  }
  if (v >= c.great) return "优秀";
  if (v >= c.good) return "良好";
  if (v >= c.pass) return "及格";
  return "不及格";
}

export const GRADE_STYLE: Record<FitGrade, string> = {
  优秀: "bg-success/15 text-success",
  良好: "bg-teal/15 text-teal",
  及格: "bg-warning/20 text-warning-foreground",
  不及格: "bg-danger/15 text-danger",
};

/** 综合评定：任一不及格 → 不及格；否则取最低等级 */
export function overallGrade(grades: (FitGrade | null)[]): FitGrade | null {
  const g = grades.filter(Boolean) as FitGrade[];
  if (!g.length) return null;
  const order: FitGrade[] = ["不及格", "及格", "良好", "优秀"];
  return g.reduce((a, b) => (order.indexOf(b) < order.indexOf(a) ? b : a));
}

export type FitStudent = {
  id: string;
  name: string;
  gender: Gender;
  cls: string;
  /** 已录入成绩（原型初始示例数据） */
  scores?: Record<string, string>;
};

export const PE_TEACHER = "李老师";
/** 体育老师任教班级 */
export const PE_CLASSES = ["3年3班", "3年4班"] as const;

export const fitStudents: FitStudent[] = [
  {
    id: "20230412",
    name: "陈静雅",
    gender: "女",
    cls: "3年3班",
    scores: { sprint50: "10.4", sitreach: "12.8", jump: "132", rope: "121", situp: "27", vital: "1480" },
  },
  {
    id: "20230711",
    name: "赵一鸣",
    gender: "男",
    cls: "3年3班",
    scores: { sprint50: "11.8", sitreach: "-1.2", jump: "104", rope: "52", situp: "8", vital: "1020" },
  },
  { id: "20230920", name: "周子航", gender: "男", cls: "3年3班" },
  { id: "20231005", name: "吴梦洁", gender: "女", cls: "3年3班" },
  {
    id: "20230118",
    name: "孙浩然",
    gender: "男",
    cls: "3年3班",
    scores: { sprint50: "9.2", sitreach: "9.6", jump: "150", rope: "126", situp: "30", vital: "1780" },
  },
  { id: "20230233", name: "李小雨", gender: "女", cls: "3年3班" },
  {
    id: "20230451",
    name: "郑一诺",
    gender: "女",
    cls: "3年4班",
    scores: { sprint50: "9.8", sitreach: "11.2", jump: "138", rope: "118", situp: "26", vital: "1520" },
  },
  { id: "20230462", name: "何嘉树", gender: "男", cls: "3年4班" },
];
