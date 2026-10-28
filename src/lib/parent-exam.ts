import { EXAM_ITEMS, type ExamValue } from "./exam-record";
import type { DbResult } from "./students-db";

const groups: Record<string, string> = {
  height: "体格发育", weight: "体格发育", bodyfat: "体格发育", waist: "体格发育", hip: "体格发育",
  "vision-l": "视力筛查", "vision-r": "视力筛查", bp: "血压", spine: "脊柱", oral: "口腔",
};

export function formatExamValue(id: string, value: ExamValue | undefined): string | null {
  const item = EXAM_ITEMS.find(i => i.id === id);
  if (!item || !value) return null;
  if (item.kind === "choice") return value.choice?.trim() || null;
  if (typeof value.value !== "number" || !Number.isFinite(value.value)) return null;
  if (item.kind === "bp") {
    if (typeof value.valueDia !== "number" || !Number.isFinite(value.valueDia)) return null;
    return `${value.value} / ${value.valueDia} ${item.unit ?? ""}`.trim();
  }
  return `${value.value}${item.unit ? ` ${item.unit}` : ""}`;
}

/** Only persisted values are eligible: recorder seeds and preview reference ranges are not clinical data. */
export function buildParentExam(results: DbResult[], uid: string) {
  const latest = new Map<string, DbResult>();
  for (const result of results.filter(r => r.student_uid === uid).sort((a, b) => a.created_at.localeCompare(b.created_at))) {
    latest.set(result.station_id, result);
  }
  const records = [...latest.values()].sort((a, b) => b.created_at.localeCompare(a.created_at));
  const values: Record<string, ExamValue> = {};
  const owners = new Map<string, DbResult>();
  for (const record of [...records].reverse()) {
    for (const [id, value] of Object.entries(record.item_values ?? {})) {
      values[id] = value; owners.set(id, record);
    }
  }
  const items = EXAM_ITEMS.map(item => {
    const value = values[item.id];
    const display = formatExamValue(item.id, value);
    return { id: item.id, label: item.label, icon: item.icon, group: groups[item.id], display,
      needsReview: display !== null && value?.retest === true, record: owners.get(item.id) };
  });
  const height = values.height?.value;
  const weight = values.weight?.value;
  const bmi = typeof height === "number" && Number.isFinite(height) && height > 0 &&
    typeof weight === "number" && Number.isFinite(weight) && weight > 0
    ? (weight / (height / 100) ** 2).toFixed(1) : null;
  return { items, records, bmi, values, latestDate: records[0]?.created_at ?? null,
    recordedCount: items.filter(i => i.display !== null).length,
    reviewItems: items.filter(i => i.needsReview),
    criticalCount: records.reduce((sum, r) => sum + r.crit_count, 0) };
}

export function examDate(date: string | null) {
  if (!date) return "未记录";
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? "未记录" : parsed.toLocaleDateString("zh-CN", { timeZone: "Asia/Shanghai" });
}
export type CareSection = { title: string; tips: string[] };
/** 青少年（12–16 岁）呵护方案：仅依据已持久化的体检值生成，缺失项不推断。 */
export function buildCarePlan(values: Record<string, ExamValue>, gender: string, bmi: string | null) {
  const findings: string[] = [];
  const diet: string[] = [], sport: string[] = [], eye: string[] = [], life: string[] = [], follow: string[] = [];
  const b = bmi ? Number(bmi) : null;
  if (b !== null) {
    if (b >= 24) { findings.push(`BMI ${bmi}，超过青少年肥胖界值`); diet.push("每日减少含糖饮料与油炸食品，主食一半换成粗粮杂豆", "晚餐七分饱，睡前 2 小时不加餐"); sport.push("每天中高强度有氧运动 ≥60 分钟（快走、游泳、骑行）", "每周 3 次跳绳或抗阻练习，每次 20 分钟"); follow.push("1 个月后复测体重、腰围，可预约儿童医院肥胖门诊"); }
    else if (b >= 22) { findings.push(`BMI ${bmi}，处于超重区间`); diet.push("控制零食和奶茶，每餐保证一拳蔬菜"); sport.push("每天户外运动 ≥60 分钟，减少久坐"); follow.push("3 个月后复测身高体重"); }
    else if (b < 16.5) { findings.push(`BMI ${bmi}，偏瘦`); diet.push("保证三餐规律，每天 300ml 奶 + 1 个鸡蛋 + 适量瘦肉"); sport.push("以力量和柔韧训练为主，避免过度耐力消耗"); }
  }
  const vl = values["vision-l"]?.value, vr = values["vision-r"]?.value;
  const vmin = [vl, vr].filter((v): v is number => typeof v === "number");
  if (vmin.length) {
    const m = Math.min(...vmin);
    if (m <= 4.0) { findings.push(`裸眼视力 ${m}，重度视力不良`); eye.push("尽快到眼科进行散瞳验光，按处方配镜", "遵医嘱评估角膜塑形镜或低浓度阿托品"); follow.push("2 周内完成眼科就诊，每 3 个月复查视力"); }
    else if (m < 4.9) { findings.push(`裸眼视力 ${m}，视力不良`); eye.push("到医院验光确认近视度数", "每天户外 2 小时，遵循 20-20-20 用眼法则"); follow.push("3 个月后复查视力"); }
    else eye.push("保持读写姿势，连续用眼 40 分钟休息 10 分钟");
  }
  const bp = values.bp;
  if (typeof bp?.value === "number" && typeof bp.valueDia === "number") {
    if (bp.value >= 140 || bp.valueDia >= 90) { findings.push(`血压 ${bp.value}/${bp.valueDia} mmHg，偏高明显`); diet.push("清淡饮食，每日盐 <5g，少吃腌制和加工肉类"); follow.push("1 周内非同日复测血压，持续偏高需到儿科心血管门诊"); }
    else if (bp.value >= 120 || bp.valueDia >= 80) { findings.push(`血压 ${bp.value}/${bp.valueDia} mmHg，正常高值`); diet.push("减少高盐零食（辣条、薯片）"); follow.push("1 个月后复测血压"); }
  }
  const atr = values.spine?.value;
  if (typeof atr === "number") {
    if (atr >= 7) { findings.push(`躯干旋转角 ${atr}°，疑似脊柱侧弯`); sport.push("暂停单侧负重运动，进行游泳等对称性运动"); follow.push("尽快到骨科拍摄全脊柱 X 光确诊"); }
    else if (atr >= 4) { findings.push(`躯干旋转角 ${atr}°，体态需关注`); sport.push("每天做 10 分钟脊柱拉伸和核心训练"); life.push("双肩背书包，书包重量不超过体重 10%"); follow.push("6 个月后复查脊柱"); }
  }
  const oral = values.oral?.choice;
  if (oral && oral !== "正常") { findings.push(`口腔检查：${oral}`); life.push("早晚使用含氟牙膏刷牙各 2 分钟，饭后漱口"); follow.push("1 个月内到口腔科补牙或做窝沟封闭"); }
  const wa = values.waist?.value, hp = values.hip?.value;
  if (typeof wa === "number" && typeof hp === "number" && hp > 0 && wa / hp >= (gender === "女" ? 0.85 : 0.9)) findings.push(`腰臀比 ${(wa / hp).toFixed(2)}，腹部脂肪偏多`);
  life.push("保证每晚 9 小时睡眠，23:00 前入睡", "每天电子屏幕娱乐时间 <2 小时");
  if (!diet.length) diet.push("均衡膳食：每天 12 种以上食物，奶类 300ml，少喝含糖饮料");
  if (!sport.length) sport.push("每天校内外累计中高强度运动 ≥60 分钟");
  if (!follow.length) follow.push("各项指标良好，下一学年常规体检即可");
  const summary = findings.length ? `本次体检发现 ${findings.length} 项需要关注：${findings.join("；")}。` : "本次体检各项指标均在青少年正常范围内，请继续保持良好习惯。";
  const sections: CareSection[] = [
    { title: "饮食", tips: diet }, { title: "运动", tips: sport }, { title: "护眼", tips: eye },
    { title: "生活与护理", tips: life }, { title: "复查随访", tips: follow },
  ].filter(s => s.tips.length);
  return { summary, findings, sections };
}
