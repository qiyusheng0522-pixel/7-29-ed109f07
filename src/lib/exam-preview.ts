import type { RiskKey } from "@/lib/risk-levels";

export type PreviewStage = "pre" | "post";
export type PreviewStudent = {
  uid: string; name: string; sno: string; school: string; grade: string; cls: string;
  age: number; gender: string; height: number; weight: number; bodyfat: number;
  waist: number; hip: number; vision: string; bp: string; spine: number; oral: number;
  risk: RiskKey; issues: string[]; dept: string; summary: string;
};

// Isolated fictional cohort: never write these records into the live roster.
export const PREVIEW_EXAM_DATE = "2026-10-20";
export const PREVIEW_TODAY = "2026-10-28";
export const previewStudents: PreviewStudent[] = [
  { uid: "202610200701010001", name: "李小阳", sno: "2026070101", school: "阳光初级中学（示例）", grade: "初一", cls: "1班", age: 13, gender: "男", height: 160, weight: 68, bodyfat: 29, waist: 86, hip: 94, vision: "4.8 / 4.9", bp: "118 / 76", spine: 3, oral: 0, risk: "橙色", issues: ["体重及体脂偏高，需专科评估", "裸眼视力下降，需眼科复查"], dept: "肥胖科", summary: "体重与体脂筛查异常，建议肥胖科复核；裸眼视力下降需眼科复查。筛查不等同于诊断，暂未触发危急值。" },
  { uid: "202610200701010002", name: "王小雨", sno: "2026070102", school: "阳光初级中学（示例）", grade: "初一", cls: "1班", age: 13, gender: "女", height: 158, weight: 46, bodyfat: 22, waist: 63, hip: 82, vision: "4.7 / 4.8", bp: "108 / 68", spine: 2, oral: 1, risk: "黄色", issues: ["裸眼视力下降", "龋齿1颗，需口腔检查"], dept: "眼科", summary: "视力及口腔筛查需重点关注，建议复查并建立用眼、口腔护理习惯。" },
  { uid: "202610200701010003", name: "陈子轩", sno: "2026070103", school: "阳光初级中学（示例）", grade: "初一", cls: "1班", age: 13, gender: "男", height: 165, weight: 55, bodyfat: 18, waist: 69, hip: 85, vision: "5.0 / 5.0", bp: "112 / 72", spine: 2, oral: 0, risk: "绿色", issues: [], dept: "儿童保健科", summary: "本次筛查未发现需干预异常，保持均衡饮食、规律运动及年度体检。" },
  { uid: "202610200701020004", name: "赵欣然", sno: "2026070201", school: "阳光初级中学（示例）", grade: "初一", cls: "2班", age: 13, gender: "女", height: 160, weight: 49, bodyfat: 23, waist: 64, hip: 84, vision: "4.9 / 5.0", bp: "110 / 70", spine: 2, oral: 0, risk: "蓝色", issues: ["右眼视力临界，需用眼管理"], dept: "眼科", summary: "右眼视力处于临界状态，家庭做好用眼管理并按期复查。" },
  { uid: "202610200702010005", name: "刘浩然", sno: "2026080101", school: "阳光初级中学（示例）", grade: "初二", cls: "1班", age: 14, gender: "男", height: 168, weight: 61, bodyfat: 20, waist: 73, hip: 89, vision: "5.0 / 5.0", bp: "182 / 122", spine: 3, oral: 0, risk: "红色", issues: ["血压复测182/122 mmHg，触发危急值"], dept: "急诊 / 心血管专科", summary: "现场血压复测仍为182/122 mmHg，医生已完成复测、家长告知和紧急转诊；检后继续追踪就诊回执，不重复作为待处置任务。" },
  { uid: "202610200702010006", name: "周思涵", sno: "2026080102", school: "阳光初级中学（示例）", grade: "初二", cls: "1班", age: 14, gender: "女", height: 163, weight: 50, bodyfat: 22, waist: 64, hip: 85, vision: "5.0 / 5.0", bp: "114 / 72", spine: 8, oral: 0, risk: "橙色", issues: ["躯干旋转角8°，需脊柱专科复核"], dept: "骨科 / 脊柱专科", summary: "脊柱筛查异常不等同确诊，需专科复查评估。避免自行开展矫正训练。" },
];

export const bmiOf = (student: PreviewStudent) => Number((student.weight / (student.height / 100) ** 2).toFixed(1));
export const needsReferral = (student: PreviewStudent) => student.risk === "橙色" || student.risk === "红色";
export type StudentProgress = {
  consent: boolean; questionnaires: string[]; planConfirmed: boolean; reportRead: boolean;
  referralSent: boolean; appointment: boolean; checkins: string[]; followup: string | null; planSummary: string | null;
};
export function initialProgress(stage: PreviewStage): Record<string, StudentProgress> {
  return Object.fromEntries(previewStudents.map((student) => [student.uid, {
    consent: stage === "post", questionnaires: stage === "post" ? ["allergy", "psychology"] : [],
    planConfirmed: stage === "post", reportRead: false, referralSent: student.risk === "红色" && stage === "post",
    appointment: false, checkins: [], followup: null, planSummary: null,
  }]));
}
export function progressKey(stage: PreviewStage) { return `exam-preview-${stage}-v1`; }
export function readProgress(stage: PreviewStage, storage: Pick<Storage, "getItem">): Record<string, StudentProgress> {
  const defaults = initialProgress(stage);
  try {
    const saved = JSON.parse(storage.getItem(progressKey(stage)) ?? "{}");
    for (const student of previewStudents) {
      if (saved[student.uid]) defaults[student.uid] = { ...defaults[student.uid], ...saved[student.uid] };
    }
  } catch { /* Ignore invalid or obsolete preview storage. */ }
  return defaults;
}
export function saveProgress(stage: PreviewStage, progress: Record<string, StudentProgress>, storage: Pick<Storage, "setItem">) {
  storage.setItem(progressKey(stage), JSON.stringify(progress));
}