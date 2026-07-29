// 学校端视角（卫生保健老师 / 班主任）——跨页面共享的轻量状态
import { useSyncExternalStore } from "react";

export type SchoolView = "health" | "teacher";

/** 班主任视角固定为「三年级 3 班 · 王老师」 */
export const MY_CLASS = "3年3班";
export const MY_CLASS_LABEL = "三年级 3 班";
export const MY_TEACHER = "王老师";

let view: SchoolView = "health";
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function setSchoolView(v: SchoolView) {
  if (v === view) return;
  view = v;
  emit();
}

export function useSchoolView(): [SchoolView, (v: SchoolView) => void] {
  const cur = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => view,
    () => view,
  );
  return [cur, setSchoolView];
}
