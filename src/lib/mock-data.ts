// Shared mock data for the three-end prototype
export const child = {
  name: "李小雨",
  gender: "女",
  age: 8,
  grade: "三年级",
  className: "3班",
  school: "阳光小学",
  studentId: "20230318",
  avatar: "",
  height: 128,
  weight: 27.5,
  bmi: 16.8,
  bmiStatus: "偏轻",
  lastExam: "2025-03-18",
  riskLevel: "黄色",
  riskColor: "warning",
  focus: ["体重偏轻", "过敏性鼻炎倾向"],
};

/** 家长端只保留「饮食」「运动」两类打卡，与首页任务保持一致 */
export const todayTasks = [
  { id: 1, icon: "", title: "饮食打卡 · 晚餐", tag: "饮食", done: true, time: "18:00" },
  { id: 2, icon: "", title: "运动打卡 · 亲子跳绳", tag: "运动", done: false, time: "19:00" },
];

export const abnormalItems = [
  { name: "体重指数 BMI", value: "16.8", status: "偏轻", level: "warning" },
  { name: "视力（右）", value: "4.8", status: "轻度近视", level: "warning" },
  { name: "过敏原筛查", value: "尘螨阳性", status: "需关注", level: "warning" },
  { name: "肺功能", value: "正常", status: "正常", level: "success" },
];

export const reviewPlan = [
  { when: "1个月后", type: "体重复评", date: "2025-04-18", pending: true },
  { when: "3个月后", type: "呼吸随访", date: "2025-06-18", pending: false },
  { when: "6个月后", type: "综合复评", date: "2025-09-18", pending: false },
];

// School side
export const schoolStats = {
  totalStudents: 486,
  examined: 312,
  authorized: 452,
  unauthorized: 18,
  questionnaireDone: 401,
  absent: 6,
  needFocus: 34,
  reportUnread: 89,
};

export const classSchedule = [
  { name: "一年级 1班", time: "08:30", location: "体检车 A", status: "已完成", count: 42 },
  { name: "一年级 2班", time: "09:00", location: "体检车 A", status: "进行中", count: 40 },
  { name: "二年级 1班", time: "09:30", location: "体检车 B", status: "待到场", count: 45 },
  { name: "二年级 2班", time: "10:00", location: "体检车 B", status: "待到场", count: 44 },
  { name: "三年级 1班", time: "10:30", location: "体检车 A", status: "待到场", count: 43 },
];

export const focusStudents = [
  { name: "王小明", class: "二年级2班", type: "体重管理", risk: "黄", note: "BMI 22.4 超重" },
  { name: "李小雨", class: "三年级3班", type: "呼吸/运动", risk: "黄", note: "运动后咳嗽" },
  { name: "张小乐", class: "一年级1班", type: "过敏风险", risk: "橙", note: "疑似花粉过敏" },
  { name: "陈小美", class: "四年级2班", type: "睡眠作息", risk: "黄", note: "夜间打鼾" },
  { name: "刘小强", class: "五年级1班", type: "体重管理", risk: "红", note: "肥胖伴腰围偏大" },
];

// Doctor side
export const doctorStats = {
  todaySchool: "阳光小学",
  todayCount: 214,
  pendingQC: 12,
  pendingReview: 47,
  focusPool: 34,
  urgent: 3,
};

export const focusPool = [
  { name: "刘小强", school: "阳光小学", class: "5年1班", level: "红", tag: "肥胖", bmi: 26.4 },
  { name: "张小乐", school: "阳光小学", class: "1年1班", level: "橙", tag: "过敏", bmi: 15.2 },
  { name: "王小明", school: "阳光小学", class: "2年2班", level: "黄", tag: "超重", bmi: 22.4 },
  { name: "李小雨", school: "阳光小学", class: "3年3班", level: "黄", tag: "呼吸", bmi: 16.8 },
  { name: "陈小美", school: "阳光小学", class: "4年2班", level: "黄", tag: "睡眠", bmi: 19.1 },
];

export const riskColorMap: Record<string, string> = {
  红: "bg-danger text-danger-foreground",
  橙: "bg-warm text-warm-foreground",
  黄: "bg-warning text-warning-foreground",
  绿: "bg-success text-success-foreground",
  蓝: "bg-teal text-teal-foreground",
};
