import { createFileRoute, Link } from "@tanstack/react-router";
import { StatusBar } from "@/components/MobileFrame";
import { Button } from "@/components/ui/button";
import { ParentExamState } from "@/components/ParentExamState";
import { EIcon } from "@/components/EIcon";
import { useParentExam } from "@/hooks/use-parent-exam";
import { buildCarePlan, examDate } from "@/lib/parent-exam";
import { findStation } from "@/lib/exam-stations";
import child3d from "@/assets/child-3d.png";

export const Route = createFileRoute("/parent/report")({
  head: () => ({ meta: [
    { title: "孩子的体检报告 · 阳光校园健康" },
    { name: "description", content: "查看绑定孩子已提交的体检指标、医生及采集记录。" },
    { property: "og:title", content: "孩子的体检报告 · 阳光校园健康" },
    { property: "og:description", content: "孩子的实际体检数据与检后复核信息。" },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }), component: ReportPage,
});

function ReportPage() {
  const state = useParentExam();
  const data = state.data;
  if (state.loading || state.isError || !data) return <div><StatusBar title="体检报告" /><div className="px-5"><ParentExamState state={state} /></div></div>;
  const { student, exam } = data;
  const groups = [...new Set(exam.items.map(i => i.group))];
  return <div><StatusBar title="体检报告" /><div className="px-5 pb-8 pt-2">
    <header className="mb-4 border-b border-border pb-4">
      <div className="flex items-center justify-between gap-3"><div className="min-w-0"><h1 className="text-xl font-bold">{student.name}的体检报告</h1><p className="mt-2 text-xs text-muted-foreground">{student.school} · {student.grade}{student.cls}</p><p className="mt-1 break-all text-xs text-muted-foreground">{student.gender} · 学号 {student.sno}</p></div><img src={child3d} alt="儿童健康形象" className="h-24 w-16 shrink-0 object-contain" /></div>
      <p className="mt-2 text-xs text-muted-foreground">最近提交：{examDate(exam.latestDate)}</p>
    </header>
    {exam.recordedCount === 0 ? <section className="py-8 text-center"><h2 className="text-base font-semibold">暂无已提交的体检数据</h2><p className="mt-2 text-xs text-muted-foreground">体检医生提交并同步后，报告将在这里显示。</p></section> : <>
      <section className="mb-5 border-y border-border py-4">
        <div className="grid grid-cols-3 gap-2 text-center"><div><p className="text-xl font-bold text-teal">{exam.recordedCount}</p><p className="text-xs text-muted-foreground">已录入项目</p></div><div><p className="text-xl font-bold">{exam.items.length - exam.recordedCount}</p><p className="text-xs text-muted-foreground">尚未录入</p></div><div><p className="text-xl font-bold text-warm">{exam.reviewItems.length}</p><p className="text-xs text-muted-foreground">医生标记复核</p></div></div>
        <p className="mt-4 text-xs text-muted-foreground">综合风险等级：待医生评估</p>
        {exam.criticalCount > 0 && <p className="mt-2 text-xs text-danger">本次录入记录含 {exam.criticalCount} 项风险值处理标记；详细处置记录尚未提供，请联系体检医生核实。</p>}
      </section>
      {groups.map(group => <details key={group} open className="mb-3 rounded-lg border border-border bg-surface">
        <summary className="cursor-pointer p-3 text-sm font-semibold">{group}</summary>
        <ul className="divide-y divide-border px-3">{exam.items.filter(i => i.group === group).map(item => <li key={item.id} className="py-3">
          <div className="flex items-start justify-between gap-3"><span className="flex items-center gap-2 text-xs"><EIcon e={item.icon} />{item.label}</span><span className="text-right text-sm font-semibold">{item.display ?? "未录入"}</span></div>
          {item.display && <p className="mt-1 text-right text-[11px] text-muted-foreground">{item.record?.doctor ?? "医生未记录"} · {examDate(item.record?.created_at ?? null)}</p>}
          {item.needsReview && <div className="mt-2 flex flex-wrap items-center justify-between gap-2"><span className="text-xs text-warm">医生已标记需复核</span><Button asChild variant="outline" size="sm"><Link to="/parent/comm" search={{ topic: item.label, from: "report" }}>立即咨询</Link></Button></div>}
        </li>)}{group === "体格发育" && <li className="flex justify-between gap-3 py-3 text-xs"><span>BMI（根据身高、体重计算）</span><span className="font-semibold">{exam.bmi ?? "数据不足"}</span></li>}</ul>
      </details>)}
      <section className="mt-5 border-t border-border pt-4"><h2 className="text-sm font-semibold">体检提交记录</h2><ul className="mt-2 divide-y divide-border">{exam.records.map(record => <li key={record.station_id} className="py-3 text-xs"><p className="font-medium">{findStation(record.station_id)?.name ?? record.station_id}</p><p className="mt-1 text-muted-foreground">{record.doctor ?? "医生未记录"} · {examDate(record.created_at)}</p></li>)}</ul></section>
      {(() => { const plan = buildCarePlan(exam.values, data.student.gender, exam.bmi); return <section className="mt-4 border-t border-border pt-4"><h2 className="text-sm font-semibold">{data.student.name}的专属呵护方案</h2><p className="mt-2 rounded-xl bg-surface-2 p-3 text-xs leading-relaxed">{plan.summary}</p>{plan.sections.map(sec => <div key={sec.title} className="mt-3"><p className="text-xs font-semibold text-teal">{sec.title}</p><ul className="mt-1 list-disc space-y-1 pl-4 text-xs text-foreground/80">{sec.tips.map(t => <li key={t}>{t}</li>)}</ul></div>)}<p className="mt-3 text-[11px] text-muted-foreground">方案依据本次体检数据自动生成，具体诊疗以医生意见为准。</p></section>; })()}
    </>}
    <Button asChild variant="outline" className="mt-5 w-full"><Link to="/parent/review">查看复评随访</Link></Button>
  </div></div>;
}
