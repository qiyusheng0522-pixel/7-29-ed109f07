import { describe, expect, test } from "bun:test";
import { bloodReportError, needsBloodReport } from "./questionnaire-attachment";

describe("blood report guidance", () => {
  test("any allergy yes answer requests a report", () => {
    for (let i = 0; i < 6; i++) expect(needsBloodReport("allergy", { [i]: "是" })).toBe(true);
    expect(needsBloodReport("allergy", { 0: "否", 1: "否" })).toBe(false);
    expect(needsBloodReport("allergy", {})).toBe(false);
  });
  test("psychology never requests a blood report", () => {
    expect(needsBloodReport("psychology", { 0: "是" })).toBe(false);
  });
  test("only images and PDF accepted", () => {
    for (const type of ["image/jpeg", "image/png", "application/pdf"]) expect(bloodReportError({ type, size: 1024 })).toBeUndefined();
    expect(bloodReportError({ type: "text/plain", size: 1024 })).toBeDefined();
  });
  test("10MB accepted but larger and empty rejected", () => {
    expect(bloodReportError({ type: "application/pdf", size: 10 * 1024 * 1024 })).toBeUndefined();
    expect(bloodReportError({ type: "application/pdf", size: 10 * 1024 * 1024 + 1 })).toBeDefined();
    expect(bloodReportError({ type: "application/pdf", size: 0 })).toBeDefined();
  });
});