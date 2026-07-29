/**
 * 打卡数据层（家长端）
 *
 * 家长端只保留两类打卡：饮食 与 运动。
 * 运动打卡会回收「时长 / 强度 / 疲惫度」，用于判断当前推荐方案
 * 对孩子是否合适 —— 见 evaluateExercise()。
 *
 * 原型阶段用 localStorage 持久化，与本项目其他页面保持一致。
 */

export type CheckinKind = "diet" | "exercise";

/** 饮食打卡的三种记录方式 */
export type DietInputMode = "photo" | "voice" | "text";

export type DietRecord = {
  kind: "diet";
  meal: string;
  mode: DietInputMode;
  /** 文字描述，或语音转写后的文本 */
  text: string;
  /** 拍照模式下的图片数量（原型不持久化图片本体） */
  photoCount: number;
  /** 语音时长（秒） */
  voiceSec: number;
  kcal: number;
  at: string;
};

export type ExerciseRecord = {
  kind: "exercise";
  item: string;
  /** 实际完成时长（分钟） */
  minutes: number;
  /** 主观强度 1–3：轻松 / 适中 / 吃力 */
  intensity: number;
  /** 运动后疲惫度 1–5 */
  fatigue: number;
  note: string;
  at: string;
};

export type CheckinRecord = DietRecord | ExerciseRecord;

const KEY = "parent.checkin.v1";
/** 当天的推荐运动时长（分钟），用于计算完成度 */
export const TARGET_MINUTES = 20;
/** 当天晚餐推荐热量上限（kcal） */
export const TARGET_KCAL = 600;

type Store = Partial<Record<CheckinKind, CheckinRecord>>;

export function readCheckins(): Store {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? "{}") as Store;
  } catch {
    // 数据损坏时按「今天还没打卡」处理，避免整页崩溃
    return {};
  }
}

export function saveCheckin(rec: CheckinRecord) {
  if (typeof window === "undefined") return;
  const next = { ...readCheckins(), [rec.kind]: rec };
  window.localStorage.setItem(KEY, JSON.stringify(next));
  // 同一标签页内 storage 事件不会触发，用自定义事件通知首页刷新
  window.dispatchEvent(new Event("checkin-updated"));
}

export function clearCheckins() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("checkin-updated"));
}

/* ------------------------------------------------------------------ */
/* 方案匹配度评估                                                      */
/* ------------------------------------------------------------------ */

export type Verdict = {
  /** fit=方案合适；hard=偏难需下调；easy=偏松可加量 */
  level: "fit" | "hard" | "easy";
  title: string;
  detail: string;
  /** 给出的下一步调整建议 */
  advice: string;
};

/**
 * 依据「完成时长 + 主观强度 + 疲惫度」判断运动推荐是否匹配孩子。
 *
 * 判断逻辑（原型规则，真实场景应由模型结合心率等数据给出）：
 * - 疲惫度高（≥4）或吃力且未达标 → 偏难，需要下调
 * - 达标且疲惫低（≤2）且不吃力 → 偏松，可以加量
 * - 其余 → 合适
 */
export function evaluateExercise(r: {
  minutes: number;
  intensity: number;
  fatigue: number;
}): Verdict {
  const reached = r.minutes >= TARGET_MINUTES;
  const ratio = Math.round((r.minutes / TARGET_MINUTES) * 100);

  if (r.fatigue >= 4 || (r.intensity === 3 && !reached)) {
    return {
      level: "hard",
      title: "当前强度偏高，建议下调",
      detail: `完成 ${r.minutes} 分钟（目标 ${TARGET_MINUTES} 分钟，${ratio}%），疲惫度 ${r.fatigue}/5、强度偏吃力。`,
      advice: `下次改为 ${Math.max(10, r.minutes - 5)} 分钟，中途加 1 次 2 分钟休息；若连续 3 天疲惫度 ≥ 4，请咨询健管师调整方案。`,
    };
  }

  if (reached && r.fatigue <= 2 && r.intensity <= 2) {
    return {
      level: "easy",
      title: "孩子适应良好，可适当加量",
      detail: `完成 ${r.minutes} 分钟（达标 ${ratio}%），疲惫度仅 ${r.fatigue}/5，说明还有余力。`,
      advice: `下次可加到 ${r.minutes + 5} 分钟，或把强度提到「适中偏快」，逐步接近每日 60 分钟中等强度目标。`,
    };
  }

  return {
    level: "fit",
    title: "方案匹配，保持当前节奏",
    detail: `完成 ${r.minutes} 分钟（${ratio}%），强度与疲惫度都在合理区间。`,
    advice: reached
      ? "继续按现有清单执行，每周保持 5 次即可。"
      : `再补 ${TARGET_MINUTES - r.minutes} 分钟就能达标，可拆成餐后散步完成。`,
  };
}

/** 饮食打卡的热量对照评估 */
export function evaluateDiet(kcal: number): Verdict {
  if (kcal > TARGET_KCAL) {
    return {
      level: "hard",
      title: `超出推荐 ${kcal - TARGET_KCAL} kcal`,
      detail: `本餐约 ${kcal} kcal，推荐上限 ${TARGET_KCAL} kcal。`,
      advice: "主食再减 1/3，油炸类换成清蒸；晚上加 15 分钟散步抵消。",
    };
  }
  if (kcal < TARGET_KCAL - 200) {
    return {
      level: "easy",
      title: "摄入偏少，注意长个儿",
      detail: `本餐约 ${kcal} kcal，低于推荐区间 ${TARGET_KCAL - 200}–${TARGET_KCAL} kcal。`,
      advice: "可加 1 个鸡蛋或 200 ml 牛奶补足蛋白质，避免影响生长发育。",
    };
  }
  return {
    level: "fit",
    title: "热量在推荐区间内",
    detail: `本餐约 ${kcal} kcal，符合 ${TARGET_KCAL - 200}–${TARGET_KCAL} kcal 的建议。`,
    advice: "保持「先菜后饭」的进餐顺序，继续按食谱执行。",
  };
}
