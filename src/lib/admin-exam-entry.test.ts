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
  form.angles["spine-thoracic"] = "5";
  form.angles["spine-thoracolumbar"] = "3.5";
  form.angles["spine-lumbar"] = "7";
  return form;
}

describe("admin exam entry", () => {
  test("positive screening stores one angle per segment", () => {
    const values = buildAdminExamValues(positiveForm());
    assert.equal(values.waist?.value, 72.5);
    assert.equal(values.feno?.value, 38);
    assert.equal(values["spine-thoracic"]?.value, 5);
    assert.equal(values["spine-thoracolumbar"]?.value, 3.5);
    assert.equal(values["spine-lumbar"]?.value, 7);
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
    assert.equal(values["spine-thoracic"], undefined);
  });

  test("saved values reload into the same editable form", () => {
    const original = positiveForm();
    assert.deepEqual(readAdminExamForm(buildAdminExamValues(original)), original);
  });

  test("legacy left/right angles reload as that segment's angle", () => {
    const form = readAdminExamForm({
      spine: { choice: "阳性", value: 6 },
      "spine-thoracic-left": { value: 5 },
      "spine-thoracic-right": { value: 6 },
    });
    assert.equal(form.spineResult, "阳性");
    assert.equal(form.angles["spine-thoracic"], "6");
    assert.equal(form.angles["spine-lumbar"], "");
  });

  test("spine summary lists segments without sides and shows negative result", () => {
    assert.match(formatAdminSpineSummary(buildAdminExamValues(positiveForm())) ?? "", /胸段 5°/);
    const negative = positiveForm();
    negative.spineResult = "阴性";
    assert.equal(formatAdminSpineSummary(buildAdminExamValues(negative)), "阴性");
  });
});
