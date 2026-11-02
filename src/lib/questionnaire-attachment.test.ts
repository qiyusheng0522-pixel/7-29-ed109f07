import { describe, test } from "node:test";
import { strict as assert } from "node:assert";
import { bloodReportError, needsBloodReport } from "./questionnaire-attachment";

describe("blood report guidance", () => {
  test("any allergy yes answer requests a report", () => {
    for (let i = 0; i < 6; i++) assert.equal(needsBloodReport("allergy", { [i]: "是" }), true);
    assert.equal(needsBloodReport("allergy", { 0: "否", 1: "否" }), false);
    assert.equal(needsBloodReport("allergy", {}), false);
  });
  test("psychology never requests a blood report", () => {
    assert.equal(needsBloodReport("psychology", { 0: "是" }), false);
  });
  test("only images and PDF accepted", () => {
    for (const type of ["image/jpeg", "image/png", "application/pdf"]) assert.equal(bloodReportError({ type, size: 1024 }), undefined);
    assert.ok(bloodReportError({ type: "text/plain", size: 1024 }));
  });
  test("10MB accepted but larger and empty rejected", () => {
    assert.equal(bloodReportError({ type: "application/pdf", size: 10 * 1024 * 1024 }), undefined);
    assert.ok(bloodReportError({ type: "application/pdf", size: 10 * 1024 * 1024 + 1 }));
    assert.ok(bloodReportError({ type: "application/pdf", size: 0 }));
  });
});