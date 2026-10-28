import { describe, test } from "node:test";
import { strict as assert } from "node:assert";
import { buildParentExam } from "./parent-exam";
import type { DbResult } from "./students-db";

const record = (uid: string, station: string, values: DbResult["item_values"], date = "2026-10-28T11:00:00Z"): DbResult => ({
  student_uid: uid, station_id: station, doctor: "测试医生", item_values: values, crit_count: 0, created_at: date,
});
describe("parent reports use only the bound child's saved exam", () => {
  test("another child's measurements never enter the report or follow-up baseline", () => {
    const exam = buildParentExam([record("A", "s1", { height: { value: 160 }, weight: { value: 68 } }), record("B", "s1", { height: { value: 138 } })], "A");
    assert.equal(exam.items.find(i => i.id === "height")?.display, "160 cm");
    assert.equal(exam.bmi, "26.6");
    assert.equal(exam.records.length, 1);
  });
  test("missing results do not fall back to recorder seeds or sample content", () => {
    const exam = buildParentExam([], "A");
    assert.equal(exam.recordedCount, 0);
    assert.equal(exam.bmi, null);
    assert.equal(exam.latestDate, null);
    assert.equal(exam.items.every(i => i.display === null), true);
  });
  test("multiple stations merge; latest submitted values replace older ones", () => {
    const exam = buildParentExam([record("A", "s1", { height: { value: 138 } }, "2026-10-20T11:00:00Z"), record("A", "s2", { bp: { value: 118, valueDia: 76 } }), record("A", "s1", { height: { value: 160 } })], "A");
    assert.equal(exam.items.find(i => i.id === "height")?.display, "160 cm");
    assert.equal(exam.items.find(i => i.id === "bp")?.display, "118 / 76 mmHg");
    assert.equal(exam.recordedCount, 2);
  });
  test("follow-up flags come only from persisted doctor retest markers", () => {
    const exam = buildParentExam([record("A", "s1", { height: { value: 180 }, "vision-l": { value: 4.7, retest: true } })], "A");
    assert.deepEqual(exam.reviewItems.map(i => i.id), ["vision-l"]);
  });
  test("incomplete readings stay missing and BMI requires both saved measurements", () => {
    const exam = buildParentExam([record("A", "s2", { bp: { value: 118 }, weight: { value: 68 }, oral: { choice: "正常" } })], "A");
    assert.equal(exam.items.find(i => i.id === "bp")?.display, null);
    assert.equal(exam.items.find(i => i.id === "oral")?.display, "正常");
    assert.equal(exam.bmi, null);
  });
});