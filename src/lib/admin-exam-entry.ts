import type { ExamItem, ExamValue } from "@/lib/exam-record";

export const ADMIN_STATION_ID = "admin-entry";
export const ADMIN_STATION_NAME = "管理后台补录";

export const SPINE_SEGMENTS = [
  { id: "thoracic", label: "胸段", key: "spine-thoracic" },
  { id: "thoracolumbar", label: "腰胸段", key: "spine-thoracolumbar" },
  { id: "lumbar", label: "腰段", key: "spine-lumbar" },
] as const;

export type SpineAngleKey = (typeof SPINE_SEGMENTS)[number]["key"];
export type SpineResult = "" | "阴性" | "阳性";
export type AdminExamForm = {
  waist: string;
  spineResult: SpineResult;
  feno: string;
  angles: Record<SpineAngleKey, string>;
};

const angleKeys = SPINE_SEGMENTS.map((segment) => segment.key);
/** 旧数据按左右两侧录入，读取时取两侧较大值作为该节段角度。 */
const legacySideKeys = (segment: (typeof SPINE_SEGMENTS)[number]) => [`${segment.key}-left`, `${segment.key}-right`];

export function emptyAdminExamForm(): AdminExamForm {
  return {
    waist: "",
    spineResult: "",
    feno: "",
    angles: Object.fromEntries(angleKeys.map((key) => [key, ""])) as Record<SpineAngleKey, string>,
  };
}

export function readAdminExamForm(values: Record<string, ExamValue>): AdminExamForm {
  const form = emptyAdminExamForm();
  form.waist = values.waist?.value == null ? "" : String(values.waist.value);
  form.feno = values.feno?.value == null ? "" : String(values.feno.value);
  form.spineResult = values.spine?.choice === "阴性" || values.spine?.choice === "阳性" ? values.spine.choice : "";
  for (const segment of SPINE_SEGMENTS) {
    const value = values[segment.key]?.value;
    if (value != null) {
      form.angles[segment.key] = String(value);
      continue;
    }
    const legacy = legacySideKeys(segment)
      .map((sideKey) => values[sideKey]?.value)
      .filter((n): n is number => typeof n === "number" && Number.isFinite(n));
    form.angles[segment.key] = legacy.length ? String(Math.max(...legacy)) : "";
  }
  return form;
}

function validOptionalNumber(raw: string, allowZero: boolean): boolean {
  if (!raw.trim()) return true;
  const value = Number(raw);
  return Number.isFinite(value) && (allowZero ? value >= 0 : value > 0);
}

export function validateAdminExamForm(form: AdminExamForm): string[] {
  const errors: string[] = [];
  if (!validOptionalNumber(form.waist, false)) errors.push("腰围应为大于 0 的有效数字");
  if (!validOptionalNumber(form.feno, true)) errors.push("一氧化氮数值应为大于或等于 0 的有效数字");
  for (const segment of SPINE_SEGMENTS) {
    if (!validOptionalNumber(form.angles[segment.key], true)) errors.push(`${segment.label}角度应为大于或等于 0 的有效数字`);
  }
  const hasAngle = angleKeys.some((key) => form.angles[key].trim() !== "");
  if (form.spineResult === "阳性" && !hasAngle) errors.push("脊柱侧弯为阳性时，请至少录入一个节段的角度");
  if (!form.waist.trim() && !form.feno.trim() && !form.spineResult) errors.push("请至少填写腰围、脊柱侧弯结果或一氧化氮数值");
  return errors;
}

/** 后台补录单独保存，最大 ATR 由已填的节段角度计算，不覆盖医生其他工位的数据。 */
export function buildAdminExamValues(form: AdminExamForm): Record<string, ExamValue> {
  const values: Record<string, ExamValue> = {};
  if (form.waist.trim()) values.waist = { value: Number(form.waist) };
  if (form.feno.trim()) values.feno = { value: Number(form.feno) };
  if (form.spineResult) values.spine = { choice: form.spineResult };
  if (form.spineResult === "阳性") {
    const angles: number[] = [];
    for (const key of angleKeys) {
      if (!form.angles[key].trim()) continue;
      const angle = Number(form.angles[key]);
      values[key] = { value: angle };
      angles.push(angle);
    }
    if (angles.length) values.spine = { choice: "阳性", value: Math.max(...angles) };
  }
  return values;
}

export function formatAdminSpineSummary(values: Record<string, ExamValue>): string | undefined {
  const result = values.spine?.choice;
  const parts = SPINE_SEGMENTS.flatMap((segment) => {
    const angle = values[segment.key]?.value;
    if (angle == null) return [];
    return [`${segment.label} ${angle}°`];
  });
  const max = values.spine?.value;
  if (result === "阴性") return "阴性";
  if (result === "阳性") return parts.length ? ["阳性", ...parts].join("；") : (max == null ? "阳性" : `阳性；最大 ATR ${max}°`);
  if (parts.length) return parts.join("；");
  return max == null ? undefined : `ATR ${max}°`;
}

/** 家长报告补充展示的后台录入项目；不改变医生工位项目清单。 */
export const ADMIN_EXAM_ITEMS: ExamItem[] = [
  ...SPINE_SEGMENTS.map((segment): ExamItem => ({
    id: segment.key, label: `${segment.label} ATR`, icon: "🦴", source: "manual", kind: "number", unit: "°", hint: "管理后台录入",
  })),
  { id: "feno", label: "呼出气一氧化氮（FeNO）", icon: "🌬️", source: "manual", kind: "number", unit: "ppb", hint: "管理后台录入" },
];
