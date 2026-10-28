/// <reference types="bun" />
import { describe, expect, test } from "bun:test";
import { initialProgress, readProgress, saveProgress, previewStudents, bmiOf } from "./exam-preview";
import { readConsent, writeConsent } from "./parent-consent";

const storage = () => {
  const values = new Map<string, string>();
  return { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } };
};
describe("exam preview business rules", () => {
  test("pre-exam authorization persists after revisiting", () => {
    const store = storage(); const progress = initialProgress("pre");
    const student = previewStudents[0]; progress[student.uid].consent = true;
    saveProgress("pre", progress, store);
    expect(readProgress("pre", store)[student.uid].consent).toBe(true);
  });
  test("post-exam historical authorization does not authorize the pre-exam flow", () => {
    const store = storage(); saveProgress("post", initialProgress("post"), store);
    expect(readProgress("post", store)[previewStudents[0].uid].consent).toBe(true);
    expect(readProgress("pre", store)[previewStudents[0].uid].consent).toBe(false);
  });
  test("all demo students are middle-school students", () => {
    expect(previewStudents.length).toBe(6);
    expect(previewStudents.every(s => ["初一", "初二", "初三"].includes(s.grade) && s.age >= 12)).toBe(true);
  });
  test("BMI is derived from the report measurements, not independent mock values", () => {
    expect(bmiOf(previewStudents[0])).toBe(26.6);
  });
  test("live parent authorization is not cleared on revisit", () => {
    const store = storage(); writeConsent(store, "agreed");
    expect(readConsent(store)).toBe("agreed");
    writeConsent(store, "declined"); expect(readConsent(store)).toBe("declined");
  });
});