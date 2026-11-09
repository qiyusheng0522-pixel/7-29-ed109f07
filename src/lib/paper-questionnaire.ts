import { z } from "zod";
import type { DbStudent } from "./students-db";
import { preExamQuestionnaires } from "./pre-exam-questionnaires";

export const paperSections = [
  { id: "allergy", title: "过敏相关健康情况", instruction: "请根据孩子近 1 年的实际情况作答。", options: ["是", "否"], questions: [
    "近 1 年，无感冒时，孩子是否经常揉鼻子、抠鼻子、揉眼睛、挤眼睛，或反复鼻塞、打喷嚏、流清鼻涕？",
    "孩子接触尘螨、花草、宠物、冷空气后，鼻炎症状是否会加重？",
    "孩子是否常有夜间睡觉张口呼吸、打呼噜？",
    "孩子是否经常反复干咳，尤其晚夜间、起床后、运动后、哭叫或遇冷空气时加重？",
    "您家孩子有胸闷、间断呼吸不畅、深呼吸、长叹气、气短，休息后缓解？",
    "家人是否有过敏性鼻炎、哮喘、湿疹等过敏性疾病？",
  ] },
  { id: "psychology", title: "心理行为问题简单筛查（适用于 4—17 岁）", instruction: "请根据孩子近 6 个月（或本学年）的表现，在每题最符合的选项内打“√”。每题只选一项。", options: ["不符合", "有点符合", "完全符合"], questions: preExamQuestionnaires.psychology.questions.map(q => q.text) },
] as const;
export const unresolvedAnswers = ["未填写", "多选", "无法辨认"] as const;
const identitySchema = z.object({ name: z.string().nullable(), sno: z.string().nullable(), uid: z.string().nullable(), school: z.string().nullable(), gradeClass: z.string().nullable(), gender: z.string().nullable(), birthDate: z.string().nullable(), ethnicity: z.string().nullable(), identityNumber: z.string().nullable() });
export const paperSchema = z.object({
  identity: identitySchema,
  allergy: z.array(z.enum(["是", "否", ...unresolvedAnswers])),
  psychology: z.array(z.enum(["不符合", "有点符合", "完全符合", ...unresolvedAnswers])),
  signaturePresent: z.boolean().nullable(),
  warnings: z.array(z.string()),
});
export type PaperQuestionnaire = z.infer<typeof paperSchema>;
export function validatePaper(value: unknown): PaperQuestionnaire {
  const data = paperSchema.parse(value);
  if (data.allergy.length !== 6 || data.psychology.length !== 6) throw new Error("两份问卷必须各有 6 题");
  return data;
}
const normalize = (s: string | null | undefined) => (s ?? "").replace(/\s/g, "");
export function matchPaperStudents(identity: PaperQuestionnaire["identity"], students: DbStudent[]) {
  return students.filter(s => {
    if (identity.uid) return normalize(s.uid) === normalize(identity.uid) && (!identity.name || normalize(s.name) === normalize(identity.name));
    if (!identity.name || !identity.sno) return false;
    return normalize(s.name) === normalize(identity.name) && normalize(s.sno) === normalize(identity.sno) && (!identity.school || normalize(s.school) === normalize(identity.school));
  });
}
export function paperScore(data: PaperQuestionnaire) {
  if (data.psychology.some(a => !(paperSections[1].options as readonly string[]).includes(a))) return null;
  return data.psychology.reduce((sum, a, i) => sum + (preExamQuestionnaires.psychology.questions[i].options.find(o => o.label === a)?.score ?? 0), 0);
}