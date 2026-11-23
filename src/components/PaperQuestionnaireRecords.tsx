import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listPaperRecords } from "@/lib/paper-questionnaire.functions";
import { paperSections } from "@/lib/paper-questionnaire";
import { Button } from "@/components/ui/button";

type PaperAnswers = {
  allergy?: string[];
  psychology?: string[];
  warnings?: string[];
  psychologyScore?: number | null;
};

export function PaperQuestionnaireRecords({ uid, refresh = 0, answersOnly = false }: {
  uid: string | null;
  refresh?: number;
  answersOnly?: boolean;
}) {
  const read = useServerFn(listPaperRecords);
  const [records, setRecords] = useState<Awaited<ReturnType<typeof listPaperRecords>>>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    read({ data: { uid } })
      .then(r => { if (active) { setRecords(r); setError(""); } })
      .catch(e => { if (active) setError(e.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [uid, refresh, read]);

  return <section className="space-y-3">
    {loading ? <p className="text-sm text-muted-foreground">正在读取问卷…</p> : error ? <p role="alert" className="text-sm text-danger">请先登录采集账号后查看有权限的问卷档案。</p> : !records.length ? <p className="py-6 text-center text-sm text-muted-foreground">暂无已归档问卷</p> : records.map(r => {
      const answers = r.answers as PaperAnswers;
      const identity = r.identity as { name?: string; sno?: string };
      const questionSections = paperSections.map(s => <div key={s.id}>
        <h3 className="mb-2 text-sm font-bold">{s.title}</h3>
        {s.questions.map((q, i) => <div key={q} className="border-b border-border py-3 text-sm last:border-b-0">
          <p>{i + 1}. {q}</p>
          <p className="mt-2 font-semibold text-deep">答：{answers[s.id]?.[i] ?? "未填写"}</p>
        </div>)}
      </div>);

      if (answersOnly) return <div key={r.id} className="space-y-6">{questionSections}</div>;

      return <details key={r.id} className="rounded-lg border border-border bg-surface p-3">
        <summary className="cursor-pointer text-sm font-semibold">{identity.name || "学生问卷"} · {identity.sno || r.student_uid}<span className="mt-1 block text-xs font-normal text-muted-foreground">已核对归档 · {new Date(r.created_at).toLocaleString("zh-CN")}</span></summary>
        <div className="mt-3 space-y-4">
          {questionSections}
          {answers.psychologyScore != null && <p className="text-xs text-muted-foreground">心理行为问卷合计得分：{answers.psychologyScore} 分（仅按原问卷计分，不作风险判断）</p>}
          {!!answers.warnings?.length && <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground"><p className="mb-1 font-semibold">识别核对说明</p>{answers.warnings.map((warning, index) => <p key={index}>· {warning}</p>)}</div>}
          <p className="text-xs text-muted-foreground">家长签名：{r.signature_present === null ? "无法确认" : r.signature_present ? "原图有签名" : "未见签名"} · 不替代授权协议</p>
          {r.originalUrl && <Button asChild variant="outline" size="sm"><a href={r.originalUrl} target="_blank" rel="noreferrer">查看问卷原图</a></Button>}
        </div>
      </details>;
    })}
  </section>;
}
