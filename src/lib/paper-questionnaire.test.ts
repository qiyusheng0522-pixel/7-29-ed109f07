import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { matchPaperStudents, paperScore, validatePaper, type PaperQuestionnaire } from "./paper-questionnaire";
const paper: PaperQuestionnaire = { identity: { name: "张三", sno: "123", uid: null, school: null, gradeClass: null, gender: null, birthDate: null, ethnicity: null, identityNumber: null }, allergy: Array(6).fill("未填写"), psychology: Array(6).fill("不符合"), signaturePresent: null, warnings: [] };
const student = { uid: "320102010303030110", name: "张三", sno: "123", school: "学校甲", grade: "初一", cls: "1班", gender: "男" };
describe("paper questionnaire rules", () => {
  it("requires six questions in each section", () => assert.throws(() => validatePaper({ ...paper, allergy: ["是"] })));
  it("does not match name alone", () => assert.deepEqual(matchPaperStudents({ ...paper.identity, sno: null }, [student]), []));
  it("keeps duplicate school candidates for explicit review", () => assert.equal(matchPaperStudents(paper.identity, [student, { ...student, uid: "other", school: "学校乙" }]).length, 2));
  it("rejects identity disagreement for a decoded ID", () => assert.equal(matchPaperStudents({ ...paper.identity, uid: student.uid, name: "李四" }, [student]).length, 0));
  it("scores question three in reverse without a risk diagnosis", () => assert.equal(paperScore(paper), 2));
  it("does not score unresolved answers", () => assert.equal(paperScore({ ...paper, psychology: Array(6).fill("无法辨认") }), null));
});