// 学校端视角（卫生保健老师 / 班主任）——跨页面共享的轻量状态
import { useEffect, useSyncExternalStore } from "react";

export type SchoolView = "health" | "teacher";

/** 班主任视角固定为「三年级 3 班 · 王老师」 */
export const MY_CLASS = "3年3班";
export const MY_CLASS_LABEL = "三年级 3 班";
export const MY_TEACHER = "王老师";

const KEY = "school-view";
let view: SchoolView = "health";
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function setSchoolView(v: SchoolView) {
  if (v === view) return;
  view = v;
  try {
    sessionStorage.setItem(KEY, v);
  } catch {
    /* ignore */
  }
  emit();
}

/** 刷新后恢复视角（在 effect 中执行，避免 SSR 水合不一致） */
function hydrate() {
  if (hydrated) return;
  hydrated = true;
  try {
    const saved = sessionStorage.getItem(KEY) as SchoolView | null;
    if (saved && saved !== view) {
      view = saved;
      emit();
    }
  } catch {
    /* ignore */
  }
}

export function useSchoolView(): [SchoolView, (v: SchoolView) => void] {
  const cur = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => view,
    () => "health" as SchoolView,
  );
  useEffect(hydrate, []);
  return [cur, setSchoolView];
}

