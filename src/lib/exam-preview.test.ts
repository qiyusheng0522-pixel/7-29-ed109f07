import { describe, test } from "node:test";
import { strict as assert } from "node:assert";
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
    assert.equal(readProgress("pre", store)[student.uid].consent, true);
  });
  test("post-exam historical authorization does not authorize the pre-exam flow", () => {
    const store = storage(); saveProgress("post", initialProgress("post"), store);
    assert.equal(readProgress("post", store)[previewStudents[0].uid].consent, true);
    assert.equal(readProgress("pre", store)[previewStudents[0].uid].consent, false);
  });
  test("all demo students are middle-school students", () => {
    assert.equal(previewStudents.length, 6);
    assert.equal(previewStudents.every(s => ["初一", "初二", "初三"].includes(s.grade) && s.age >= 12), true);
  });
  test("BMI is derived from the report measurements, not independent mock values", () => {
    assert.equal(bmiOf(previewStudents[0]), 26.6);
  });
  test("live parent authorization is not cleared on revisit", () => {
    const store = storage(); writeConsent(store, "agreed");
    assert.equal(readConsent(store), "agreed");
    writeConsent(store, "declined"); assert.equal(readConsent(store), "declined");
  });
});