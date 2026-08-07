/** 全端统一的五色风险分层梯度（家长端 / 学校端 / 医生端 / 社区端保持一致） */
export type RiskKey = "绿色" | "蓝色" | "黄色" | "橙色" | "红色";

export type RiskLevel = {
  key: RiskKey;
  /** 风险等级 */
  level: string;
  /** 下一步动作 */
  action: string;
  /** 责任主体 */
  owner: string;
  /** 面向家长的通俗注释 */
  note: string;
  /** 判定依据示例 */
  basis: string;
  dot: string;
  chip: string;
};

export const RISK_LEVELS: RiskLevel[] = [
  {
    key: "绿色",
    level: "正常",
    action: "健康教育 + 年度复评",
    owner: "学校 + 家庭",
    note: "各项指标都在同龄儿童正常范围内，保持现有的饮食、运动和作息即可，一年后再体检一次。",
    basis: "全部指标处于同年龄同性别参考区间内",
    dot: "#22a35b",
    chip: "bg-success/15 text-success",
  },
  {
    key: "蓝色",
    level: "轻度风险",
    action: "AI 提醒 + 家庭自管",
    owner: "家庭 + AI",
    note: "有个别指标接近临界值，还不需要就医。小程序会按时提醒您在家做好饮食、运动、用眼等自我管理。",
    basis: "1 项指标处于临界区间，无临床症状",
    dot: "#2f6fe0",
    chip: "bg-deep/15 text-deep",
  },
  {
    key: "黄色",
    level: "重点关注",
    action: "学校 / 家庭 / 健管师干预",
    owner: "学校 + 健管师",
    note: "有指标已经偏离正常范围，需要学校和家庭一起配合，健康管理师会给到具体的家庭任务并定期随访。",
    basis: "1–2 项指标轻中度异常，需行为干预",
    dot: "#f0b429",
    chip: "bg-warning/25 text-warning-foreground",
  },
  {
    key: "橙色",
    level: "医学复核",
    action: "线上 / 线下复核",
    owner: "儿童医院专科",
    note: "指标异常达到需要医生复核的程度，建议尽快线上问诊或到儿童医院专科门诊复查确认。",
    basis: "指标明显异常或复测仍异常，需专科评估",
    dot: "#f2820c",
    chip: "bg-warm/20 text-warm",
  },
  {
    key: "红色",
    level: "高风险 / 危机",
    action: "绿色通道 + 危机处置",
    owner: "医院 + 健管师 + 校家",
    note: "出现危急值或高风险情况，需要立即处理。系统会开通就诊绿色通道，并同时通知学校和家长。",
    basis: "触发危急值阈值或存在急性风险",
    dot: "#e03131",
    chip: "bg-danger/15 text-danger",
  },
];

export const riskByKey = (key: string): RiskLevel =>
  RISK_LEVELS.find((r) => r.key === key) ?? RISK_LEVELS[0];
