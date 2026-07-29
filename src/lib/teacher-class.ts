// 班主任视角数据：我班体检进度、漏检/错检重检待办、医生实时重检通知

export const teacherClass = {
  name: "三年级 3 班",
  teacher: "王老师",
  total: 45,
  examined: 42,
  normal: 38,
};

export type RecheckKind = "漏检补检" | "超范围重测";

export type RecheckItem = {
  id: string;
  name: string;
  kind: RecheckKind;
  reason: string;
  from: string;
  time: string;
  notified: boolean;
  urgent?: boolean;
};

export const recheckList: RecheckItem[] = [
  {
    id: "20230711",
    name: "赵一鸣",
    kind: "超范围重测",
    reason: "体重 38.6kg 超范围 · 血压偏高",
    from: "体检医生 · 现场回传",
    time: "刚刚",
    notified: false,
    urgent: true,
  },
  {
    id: "20230412",
    name: "陈静雅",
    kind: "超范围重测",
    reason: "视力 4.6 / 4.7 临界 · 建议复测",
    from: "体检医生 · 现场回传",
    time: "09:12",
    notified: false,
  },
  {
    id: "20230920",
    name: "周子航",
    kind: "漏检补检",
    reason: "体检当日请假缺席，全部项目未检",
    from: "现场考勤",
    time: "今日",
    notified: false,
  },
  {
    id: "20231005",
    name: "吴梦洁",
    kind: "漏检补检",
    reason: "迟到未完成 视力 / 口腔",
    from: "现场考勤",
    time: "今日",
    notified: true,
  },
];

// 医生实时重检通知流
export type LiveNotice = { id: string; name: string; item: string; time: string; isNew?: boolean };

export const liveNotices: LiveNotice[] = [
  { id: "20230711", name: "赵一鸣", item: "体重 / 血压超范围，需返场重测", time: "刚刚", isNew: true },
  { id: "20230412", name: "陈静雅", item: "视力临界，建议复测确认", time: "3 分钟前" },
];

export const escort = {
  cls: "三年级 3 班",
  time: "10:30",
  location: "体检车 A",
  note: "请提前 5 分钟到操场集合列队，携带班级花名册",
};
