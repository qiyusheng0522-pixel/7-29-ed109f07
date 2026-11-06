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
  test("admin supplemental spine segments and FeNO appear in the child's report", () => {
    const exam = buildParentExam([record("A", "admin-entry", {
      spine: { choice: "阳性", value: 7 },
      "spine-thoracic": { value: 5 },
      "spine-lumbar": { value: 7 },
      feno: { value: 38 },
    })], "A");
    assert.equal(exam.items.find(i => i.id === "spine")?.display, "阳性 · 最大 ATR 7°");
    assert.equal(exam.items.find(i => i.id === "spine-thoracic")?.display, "5 °");
    assert.equal(exam.items.find(i => i.id === "feno")?.display, "38 ppb");
  });
  test("a negative spine screening remains explicit without inventing an angle", () => {
    const exam = buildParentExam([record("A", "admin-entry", { spine: { choice: "阴性" } })], "A");
    assert.equal(exam.items.find(i => i.id === "spine")?.display, "阴性");
    assert.equal(exam.values.spine?.value, undefined);
  });
});
import { buildCarePlan as _bcp } from "./parent-exam";
describe("care plan rules", () => {
  test("BMI >= 24 is obesity", () => assert.ok(_bcp({}, "男", "25.0").findings[0].includes("肥胖")));
  test("vision <= 4.0 is severe", () => assert.ok(_bcp({ "vision-l": { value: 4.0 } }, "女", null).findings[0].includes("重度")));
  test("spine ATR >= 7 suspected scoliosis", () => assert.ok(_bcp({ spine: { value: 7 } }, "男", null).findings[0].includes("脊柱侧弯")));
  test("normal data has no findings", () => assert.equal(_bcp({ "vision-l": { value: 5.0 }, spine: { value: 1 } }, "男", "20.0").findings.length, 0));
});
