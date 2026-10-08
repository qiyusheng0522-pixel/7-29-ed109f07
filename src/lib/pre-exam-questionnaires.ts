export type PreExamQuestionnaireId = "allergy" | "psychology";

export type PreExamQuestionnaire = {
  id: PreExamQuestionnaireId;
  title: string;
  subtitle?: string;
  instruction?: string;
  questions: { text: string; options: { label: string; score?: number }[] }[];
};

const yesNo = [{ label: "是" }, { label: "否" }];
const psychologicalOptions = (reverse = false) => [
  { label: "不符合", score: reverse ? 2 : 0 },
  { label: "有点符合", score: 1 },
  { label: "完全符合", score: reverse ? 0 : 2 },
];

export const preExamQuestionnaires: Record<PreExamQuestionnaireId, PreExamQuestionnaire> = {
  allergy: {
    id: "allergy",
    title: "过敏 · 体检前问卷",
    questions: [
      { text: "您家孩子近 1 年，无感冒时，是否经常揉鼻子、抠鼻子、揉眼睛挤眼睛，或者反复鼻塞、打喷嚏、流清鼻涕？", options: yesNo },
      { text: "您家孩子接触尘螨、花草、宠物、冷空气后，鼻炎症状会加重？", options: yesNo },
      { text: "您家孩子常有夜间睡觉张口呼吸、打鼾？", options: yesNo },
      { text: "您家孩子经常反复干咳，尤其晚夜间、起床后、运动后、哭叫或遇冷空气时加重？", options: yesNo },
      { text: "您家孩子有胸闷、气短，活动后明显，休息或用药后症状可以较快缓解？", options: yesNo },
      { text: "家人有过敏性鼻炎、哮喘、湿疹等过敏性疾病？", options: yesNo },
    ],
  },
  psychology: {
    id: "psychology",
    title: "心理行为问题筛查",
    subtitle: "家长版 | 4-17 岁",
    instruction: "请根据您的孩子近 6 个月（或本学年）的表现，在每一题右侧最符合的选项格内打“√”。",
    questions: [
      { text: "坐立不安，过分活跃，不能长久安静，没有耐心等待", options: psychologicalOptions() },
      { text: "做事时容易分心、注意力难以集中", options: psychologicalOptions() },
      { text: "做事之前会思考，能坚持完成任务", options: psychologicalOptions(true) },
      { text: "情绪波动大，经常发脾气或总是忧心忡忡", options: psychologicalOptions() },
      { text: "与同龄人相处困难（欺负别人，被孤立或倾向独处）", options: psychologicalOptions() },
      { text: "经常抱怨头痛、肚子痛等身体不舒服", options: psychologicalOptions() },
    ],
  },
};