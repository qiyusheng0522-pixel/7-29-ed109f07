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
  return { items, records, bmi, latestDate: records[0]?.created_at ?? null,
    recordedCount: items.filter(i => i.display !== null).length,
    reviewItems: items.filter(i => i.needsReview),
    criticalCount: records.reduce((sum, r) => sum + r.crit_count, 0) };
}

export function examDate(date: string | null) {
  if (!date) return "未记录";
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? "未记录" : parsed.toLocaleDateString("zh-CN", { timeZone: "Asia/Shanghai" });
}