import { useState } from "react";
import { ActionSheet } from "@/components/ActionSheet";
import { Button } from "@/components/ui/button";
import type { PreExamQuestionnaire } from "@/lib/pre-exam-questionnaires";

export function PreExamQuestionnaireSheet({ questionnaire, submitted, onSubmit }: {
  questionnaire: PreExamQuestionnaire;
  submitted: boolean;
  onSubmit: () => void;
}) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const answered = questionnaire.questions.filter((_, i) => answers[i] !== undefined).length;
  const complete = answered === questionnaire.questions.length;

  return (
    <ActionSheet
      fitToFrame
      trigger={<Button size="sm" className="bg-warm text-warm-foreground hover:bg-warm/90">{submitted ? "查看问卷" : "去填写"}</Button>}
      title={questionnaire.title}
      description={questionnaire.subtitle}
      confirmText={complete ? (submitted ? "确认修改" : "提交问卷") : "请完成全部题目"}
      disabled={!complete}
      onConfirm={onSubmit}
      toastMessage="问卷已提交"
    >
      <div className="space-y-4 pb-3">
        {questionnaire.instruction && <p className="text-xs leading-relaxed text-foreground">{questionnaire.instruction}</p>}
        <p className="text-xs text-muted-foreground">已填写 {answered} / {questionnaire.questions.length}</p>
        {questionnaire.questions.map((question, index) => (
          <fieldset key={index} className="min-w-0 border-b border-border pb-4">
            <legend className="mb-2 text-sm leading-relaxed">{index + 1}. {question.text}</legend>
            <div className="grid grid-flow-col auto-cols-fr gap-2">
              {question.options.map((option) => (
                <label key={option.label} className="min-w-0 cursor-pointer">
                  <input
                    type="radio"
                    name={`${questionnaire.id}-${index}`}
                    value={option.label}
                    checked={answers[index] === option.label}
                    onChange={() => setAnswers((current) => ({ ...current, [index]: option.label }))}
                    className="peer sr-only"
                  />
                  <span className="flex min-h-11 flex-col items-center justify-center rounded-lg border border-border bg-surface px-1 py-2 text-center text-xs text-muted-foreground peer-checked:border-warm peer-checked:bg-warm/10 peer-checked:text-foreground peer-focus-visible:ring-2 peer-focus-visible:ring-ring">
                    <span>{option.label}</span>
                    {option.score !== undefined && <span className="mt-1">{option.score}</span>}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        ))}
      </div>
    </ActionSheet>
  );
}