// 社区端在管儿童患者档案数据。
// 数据来源分两类：家长 / 儿童侧上传（打卡、智能设备、家长记录）与体检数据。

export type Level = "ok" | "warn" | "bad";

export type ExamItem = { name: string; value: string; ref: string; level: Level };
export type ExamSection = { title: string; items: ExamItem[] };

export type Src = "服务包" | "复诊转入";

export type Patient = {
  id: string;
  name: string;
  gender: "男" | "女";
  age: number;
  src: Src;
  plan: string;
  planStage: string;
  from: string;
  next: string;
  adherence: number;
  tags: string[];
  guardian: { relation: string; name: string; phone: string };
  // 家长 / 儿童上传数据
  uploads: {
    // 打卡（来自家长端饮食 / 运动打卡）
    checkin: { diet: number; exercise: number; days: number; lastAt: string };
    // 智能设备 / 手动录入的关键指标
    metrics: { label: string; value: string; sub: string; level: Level }[];
    // 近 6 次体重 / BMI 趋势（家长上传体脂秤数据）
    weightTrend: number[];
    bmiTrend: number[];
    // 儿童手表 / 手环同步
    watch: { steps: string; sleep: string; heartRate: string; active: string };
    // 用药依从（复诊转入患者）
    medication?: { name: string; adherence: string; note: string };
    // 家长手记
    parentNotes: { date: string; text: string }[];
  };
  // 体检数据
  exam: {
    date: string;
    org: string;
    conclusion: string;
    abnormal: number;
    sections: ExamSection[];
  };
};

export const patients: Patient[] = [
  {
    id: "liu",
    name: "刘小强",
    gender: "男",
    age: 10,
    src: "服务包",
    plan: "儿童体重管理季度包",
    planStage: "第 3 周 / 共 12 周",
    from: "家长于 04-01 开通服务包",
    next: "04-15 上门随访 · 测体重腰围",
    adherence: 82,
    tags: ["BMI 24.6", "运动打卡 ↑"],
    guardian: { relation: "母亲", name: "赵敏", phone: "138****6021" },
    uploads: {
      checkin: { diet: 18, exercise: 15, days: 21, lastAt: "今天 19:20" },
      metrics: [
        { label: "体重", value: "41.2 kg", sub: "近 3 周 −0.8 kg", level: "warn" },
        { label: "BMI", value: "24.6", sub: "P95 · 偏高", level: "bad" },
        { label: "腰围", value: "72 cm", sub: "偏高", level: "warn" },
        { label: "体脂率", value: "28%", sub: "偏高", level: "bad" },
      ],
      weightTrend: [42.6, 42.4, 42.1, 41.8, 41.5, 41.2],
      bmiTrend: [25.4, 25.3, 25.1, 24.9, 24.8, 24.6],
      watch: { steps: "8,240 步/日", sleep: "8.4 小时", heartRate: "静息 78 bpm", active: "运动 46 分钟/日" },
      parentNotes: [
        { date: "04-12", text: "跳绳从 15 分钟加到 20 分钟，孩子说不太累了。" },
        { date: "04-08", text: "晚餐已按食谱减少主食，甜饮料停掉。" },
      ],
    },
    exam: {
      date: "2026-03-18",
      org: "南京市儿童医院体检中心",
      conclusion: "单纯性肥胖（超 P95），建议控制体重、增加有氧运动并 3 个月复评。",
      abnormal: 3,
      sections: [
        {
          title: "体格发育",
          items: [
            { name: "身高", value: "142 cm", ref: "P75", level: "ok" },
            { name: "体重", value: "42.6 kg", ref: "P95 · 偏重", level: "bad" },
            { name: "BMI", value: "21.1", ref: "14.9–19.0", level: "bad" },
            { name: "腰围", value: "73 cm", ref: "≤ 68 cm", level: "warn" },
          ],
        },
        {
          title: "内科",
          items: [
            { name: "心率", value: "84 bpm", ref: "70–110", level: "ok" },
            { name: "肝脏 B 超", value: "轻度脂肪肝", ref: "正常", level: "warn" },
            { name: "空腹血糖", value: "5.2 mmol/L", ref: "3.9–6.1", level: "ok" },
          ],
        },
        {
          title: "视力与眼健康",
          items: [
            { name: "裸眼视力 (左)", value: "5.0", ref: "≥ 5.0", level: "ok" },
            { name: "裸眼视力 (右)", value: "4.9", ref: "≥ 5.0", level: "warn" },
          ],
        },
      ],
    },
  },
  {
    id: "chen",
    name: "陈小美",
    gender: "女",
    age: 9,
    src: "复诊转入",
    plan: "哮喘长期维持 · 家庭雾化指导",
    planStage: "维持期 · 第 6 周",
    from: "市儿童医院 呼吸科 李主任 04-10 转入",
    next: "04-24 家庭访视",
    adherence: 65,
    tags: ["峰流速稳定", "夜咳 ↓"],
    guardian: { relation: "父亲", name: "陈国华", phone: "139****3388" },
    uploads: {
      checkin: { diet: 12, exercise: 9, days: 21, lastAt: "昨天 20:05" },
      metrics: [
        { label: "峰流速 PEF", value: "260 L/min", sub: "个人最佳 85%", level: "ok" },
        { label: "夜间咳嗽", value: "1 次/周", sub: "较上月 ↓", level: "warn" },
        { label: "急救药使用", value: "0 次/周", sub: "控制良好", level: "ok" },
        { label: "体重", value: "27.4 kg", sub: "P50", level: "ok" },
      ],
      weightTrend: [26.9, 27.0, 27.1, 27.2, 27.3, 27.4],
      bmiTrend: [15.6, 15.6, 15.7, 15.7, 15.8, 15.8],
      watch: { steps: "6,120 步/日", sleep: "9.1 小时", heartRate: "静息 82 bpm", active: "运动 28 分钟/日" },
      medication: { name: "布地奈德福莫特罗吸入剂", adherence: "65% · 偶有漏吸", note: "早晚各一次，家长反馈晚间偶尔忘记。" },
      parentNotes: [
        { date: "04-11", text: "换季后夜里咳嗽减少，雾化坚持每天做。" },
        { date: "04-05", text: "周末爬山后有轻微喘息，休息后缓解。" },
      ],
    },
    exam: {
      date: "2026-03-20",
      org: "南京市儿童医院 呼吸科",
      conclusion: "支气管哮喘（部分控制），继续吸入维持治疗，加强用药依从与环境控制。",
      abnormal: 2,
      sections: [
        {
          title: "过敏与呼吸",
          items: [
            { name: "过敏原-尘螨", value: "阳性 (+++)", ref: "阴性", level: "bad" },
            { name: "肺功能 FEV1", value: "82%", ref: "≥ 80%", level: "ok" },
            { name: "呼出气 NO (FeNO)", value: "38 ppb", ref: "< 20", level: "warn" },
          ],
        },
        {
          title: "体格发育",
          items: [
            { name: "身高", value: "132 cm", ref: "P50", level: "ok" },
            { name: "体重", value: "27.0 kg", ref: "P50", level: "ok" },
            { name: "BMI", value: "15.5", ref: "13.5–17.2", level: "ok" },
          ],
        },
        {
          title: "内科",
          items: [
            { name: "肺部听诊", value: "偶闻哮鸣音", ref: "呼吸音清", level: "warn" },
            { name: "心率", value: "86 bpm", ref: "70–110", level: "ok" },
          ],
        },
      ],
    },
  },
  {
    id: "wang",
    name: "王小美",
    gender: "女",
    age: 8,
    src: "服务包",
    plan: "近视防控半年包",
    planStage: "第 2 月 / 共 6 月",
    from: "家长于 03-05 开通服务包",
    next: "04-18 屈光复查",
    adherence: 90,
    tags: ["裸眼 4.8", "户外 ≥2h/日"],
    guardian: { relation: "母亲", name: "李静", phone: "137****9152" },
    uploads: {
      checkin: { diet: 20, exercise: 19, days: 21, lastAt: "今天 18:40" },
      metrics: [
        { label: "裸眼视力 (左)", value: "4.8", sub: "参考 ≥ 5.0", level: "warn" },
        { label: "裸眼视力 (右)", value: "4.9", sub: "参考 ≥ 5.0", level: "warn" },
        { label: "户外时长", value: "2.3 小时/日", sub: "达标", level: "ok" },
        { label: "近距用眼", value: "累计 3.1 小时", sub: "偏多", level: "warn" },
      ],
      weightTrend: [24.2, 24.3, 24.4, 24.5, 24.6, 24.7],
      bmiTrend: [15.1, 15.1, 15.2, 15.2, 15.3, 15.3],
      watch: { steps: "9,560 步/日", sleep: "9.4 小时", heartRate: "静息 80 bpm", active: "户外 138 分钟/日" },
      parentNotes: [
        { date: "04-14", text: "每天放学后户外活动，减少 iPad 时间。" },
        { date: "04-06", text: "书桌台灯已更换为护眼灯，读写姿势有提醒。" },
      ],
    },
    exam: {
      date: "2026-03-05",
      org: "南京市儿童医院 眼科",
      conclusion: "双眼低度近视倾向（假性为主），加强户外与用眼管理，半年内屈光复查。",
      abnormal: 2,
      sections: [
        {
          title: "视力与眼健康",
          items: [
            { name: "裸眼视力 (左)", value: "4.8", ref: "≥ 5.0", level: "warn" },
            { name: "裸眼视力 (右)", value: "4.9", ref: "≥ 5.0", level: "warn" },
            { name: "屈光度 (左)", value: "−0.75D", ref: "±0.50D", level: "warn" },
            { name: "眼轴长度", value: "23.4 mm", ref: "≤ 23.5", level: "ok" },
          ],
        },
        {
          title: "体格发育",
          items: [
            { name: "身高", value: "128 cm", ref: "P60", level: "ok" },
            { name: "体重", value: "24.2 kg", ref: "P55", level: "ok" },
            { name: "BMI", value: "14.8", ref: "13.2–16.9", level: "ok" },
          ],
        },
      ],
    },
  },
  {
    id: "zhang",
    name: "张小乐",
    gender: "男",
    age: 6,
    src: "复诊转入",
    plan: "过敏性鼻炎季节维持",
    planStage: "季节维持 · 第 4 周",
    from: "区妇幼保健院 04-08 转入",
    next: "04-20 电话随访",
    adherence: 48,
    tags: ["用药依从 ↓", "需家长强化"],
    guardian: { relation: "祖母", name: "王桂芳", phone: "135****7744" },
    uploads: {
      checkin: { diet: 8, exercise: 6, days: 21, lastAt: "3 天前" },
      metrics: [
        { label: "鼻塞 / 喷嚏", value: "每日晨起", sub: "症状较重", level: "bad" },
        { label: "用药记录", value: "3 次/周", sub: "漏用较多", level: "bad" },
        { label: "睡眠影响", value: "偶有张口呼吸", sub: "需关注", level: "warn" },
        { label: "体重", value: "21.0 kg", sub: "P50", level: "ok" },
      ],
      weightTrend: [20.6, 20.7, 20.8, 20.8, 20.9, 21.0],
      bmiTrend: [15.0, 15.0, 15.1, 15.1, 15.1, 15.2],
      watch: { steps: "未绑定设备", sleep: "家长手动记录 9 小时", heartRate: "—", active: "—" },
      medication: { name: "氯雷他定糖浆 + 鼻喷激素", adherence: "48% · 漏用偏多", note: "祖母代为照护，家长需协助建立用药提醒。" },
      parentNotes: [
        { date: "04-13", text: "早上打喷嚏厉害，鼻喷有时忘记用。" },
        { date: "04-09", text: "家里已更换防螨床品。" },
      ],
    },
    exam: {
      date: "2026-03-25",
      org: "区妇幼保健院",
      conclusion: "过敏性鼻炎（中度），规律用药依从性不足，建议家长强化用药管理与随访。",
      abnormal: 2,
      sections: [
        {
          title: "过敏与呼吸",
          items: [
            { name: "过敏原-尘螨", value: "阳性 (++)", ref: "阴性", level: "bad" },
            { name: "鼻黏膜", value: "苍白水肿", ref: "正常", level: "bad" },
            { name: "肺功能", value: "年龄小未查", ref: "—", level: "ok" },
          ],
        },
        {
          title: "体格发育",
          items: [
            { name: "身高", value: "118 cm", ref: "P55", level: "ok" },
            { name: "体重", value: "20.6 kg", ref: "P50", level: "ok" },
            { name: "BMI", value: "14.8", ref: "13.4–16.6", level: "ok" },
          ],
        },
        {
          title: "耳鼻喉",
          items: [
            { name: "扁桃体", value: "II 度肥大", ref: "≤ I 度", level: "warn" },
            { name: "听力筛查", value: "通过", ref: "通过", level: "ok" },
          ],
        },
      ],
    },
  },
];

export function findPatient(id: string): Patient | undefined {
  return patients.find((p) => p.id === id);
}
