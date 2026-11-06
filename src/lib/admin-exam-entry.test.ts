import { describe, test } from "node:test";
import { strict as assert } from "node:assert";
import {
  buildAdminExamValues,
  emptyAdminExamForm,
  formatAdminSpineSummary,
  readAdminExamForm,
  validateAdminExamForm,
} from "./admin-exam-entry";

function positiveForm() {
  const form = emptyAdminExamForm();
  form.waist = "72.5";
  form.feno = "38";
  form.spineResult = "阳性";
  form.angles["spine-thoracic-left"] = "5";
  form.angles["spine-thoracic-right"] = "3.5";
  form.angles["spine-lumbar-right"] = "7";
  return form;
}

describe("admin exam entry", () => {
  test("positive screening keeps left and right angles for each entered segment", () => {
    const values = buildAdminExamValues(positiveForm());
    assert.equal(values.waist?.value, 72.5);
    assert.equal(values.feno?.value, 38);
    assert.equal(values["spine-thoracic-left"]?.value, 5);
    assert.equal(values["spine-thoracic-right"]?.value, 3.5);
    assert.equal(values["spine-lumbar-right"]?.value, 7);
    assert.equal(values.spine?.value, 7);
    assert.equal(values.spine?.choice, "阳性");
  });

  test("positive screening requires at least one segment angle", () => {
    const form = positiveForm();
    form.angles = emptyAdminExamForm().angles;
    assert.ok(validateAdminExamForm(form).some((error) => error.includes("至少录入一个节段")));
  });

  test("negative screening saves no segment angles", () => {
    const form = positiveForm();
    form.spineResult = "阴性";
    const values = buildAdminExamValues(form);
    assert.equal(values.spine?.choice, "阴性");
    assert.equal(values.spine?.value, undefined);
    assert.equal(values["spine-thoracic-left"], undefined);
  });

  test("saved values reload into the same editable form", () => {
    const original = positiveForm();
    assert.deepEqual(readAdminExamForm(buildAdminExamValues(original)), original);
  });

  test("spine summary includes segment sides and negative result", () => {
    assert.match(formatAdminSpineSummary(buildAdminExamValues(positiveForm())) ?? "", /胸段 左5° \/ 右3.5°/);
    const negative = positiveForm();
    negative.spineResult = "阴性";
    assert.equal(formatAdminSpineSummary(buildAdminExamValues(negative)), "阴性");
  });
});
