export type ExamStatus =
  | "待检"
  | "进行中"
  | "已检-正常"
  | "已检-异常"
  | "需复核"
  | "方案确认";

export type ExamUser = {
  id: string;
  name: string;
  gender: "男" | "女";
  age: number;
  grade: string;
  status: ExamStatus;
  note?: string;
  tags?: string[];
  to?: "/doctor/review" | "/doctor/qc" | "/doctor/plan" | "/doctor/riskreview";
  progress?: { done: number; total: number; current?: string };
  eta?: string;
};

export const EXAM_USERS: ExamUser[] = [
  { id: "20230617", name: "王小豆", gender: "男", age: 10, grade: "四年级 2 班", status: "需复核", note: "BMI 24.6 · 空腹血糖 6.3", tags: ["肥胖", "血糖偏高"], to: "/doctor/riskreview" },
  { id: "20230318", name: "李小雨", gender: "女", age: 9, grade: "三年级 3 班", status: "方案确认", note: "AI 方案 v0.3 · 健管师已同步", tags: ["BMI 偏轻", "夜间咳嗽"], to: "/doctor/plan" },
  { id: "20230412", name: "陈静雅", gender: "女", age: 9, grade: "三年级 3 班", status: "已检-异常", note: "视力 4.6 / 4.7 · 临界", tags: ["视力"], to: "/doctor/review" },
  { id: "20230508", name: "李娜", gender: "女", age: 9, grade: "三年级 3 班", status: "已检-正常", note: "各项指标正常 · 3 个月复查" },
  { id: "20230521", name: "王晨曦", gender: "男", age: 9, grade: "三年级 3 班", status: "已检-正常", note: "各项指标正常" },
  { id: "20230604", name: "刘思远", gender: "男", age: 9, grade: "三年级 3 班", status: "已检-异常", note: "龋齿 2 颗 · 建议就诊", tags: ["口腔"], to: "/doctor/review" },
  { id: "20230711", name: "赵一鸣", gender: "男", age: 9, grade: "三年级 3 班", status: "进行中", note: "已完成 身高体重 / 视力", progress: { done: 2, total: 6, current: "血压 / 心率" } },
  { id: "20230802", name: "孙欣然", gender: "女", age: 9, grade: "三年级 3 班", status: "进行中", note: "已完成 身高体重", progress: { done: 1, total: 6, current: "视力" } },
  { id: "20230725", name: "钱佳琪", gender: "女", age: 9, grade: "三年级 3 班", status: "待检", eta: "预计 09:20 到场 · 排队 1 号" },
  { id: "20230819", name: "周乐言", gender: "男", age: 9, grade: "三年级 3 班", status: "待检", eta: "预计 09:25 到场 · 排队 2 号" },
];

export function findExamUser(id: string) {
  return EXAM_USERS.find((u) => u.id === id);
}

export function nextPendingExamUser(currentId: string) {
  const idx = EXAM_USERS.findIndex((u) => u.id === currentId);
  const rest = [...EXAM_USERS.slice(idx + 1), ...EXAM_USERS.slice(0, idx)];
  return rest.find((u) => u.status === "待检" || u.status === "进行中");
}
