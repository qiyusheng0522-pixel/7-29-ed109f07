import { createFileRoute, Link } from "@tanstack/react-router";
import { StatusBar } from "@/components/MobileFrame";
import { Button } from "@/components/ui/button";
import { ParentExamState } from "@/components/ParentExamState";
import { useParentExam } from "@/hooks/use-parent-exam";
import { examDate } from "@/lib/parent-exam";

export const Route = createFileRoute("/parent/review")({
  head: () => ({ meta: [
    { title: "孩子的复评随访 · 阳光校园健康" },
    { name: "description", content: "查看绑定孩子的真实体检基线与待复核项目。" },
    { property: "og:title", content: "孩子的复评随访 · 阳光校园健康" },
    { property: "og:description", content: "基于孩子已提交体检结果的复评随访信息。" },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }), component: ReviewPage,
});

function ReviewPage() {
  const state = useParentExam();
  const data = state.data;
  if (state.loading || state.isError || !data) return <div><StatusBar title="复评随访" /><div className="px-5"><ParentExamState state={state} /></div></div>;
  const { student, exam } = data;
  return <div><StatusBar title="复评随访" /><div className="px-5 pb-8 pt-2">
    <header className="mb-5"><h1 className="text-xl font-bold">{student.name}的复评随访</h1><p className="mt-2 text-xs text-muted-foreground">{student.school} · {student.grade}{student.cls}</p><p className="mt-1 text-xs text-muted-foreground">学号 {student.sno}</p></header>
    {exam.recordedCount === 0 ? <section className="border-y border-border py-8 text-center"><h2 className="text-base font-semibold">暂无体检基线</h2><p className="mt-2 text-xs text-muted-foreground">体检数据提交后，可查看孩子的复评参考指标。</p></section> : <>
      <section className="border-y border-border py-4"><h2 className="text-sm font-semibold">本次体检基线</h2><p className="mt-1 text-xs text-muted-foreground">最近提交 {examDate(exam.latestDate)} · 已录入 {exam.recordedCount} 项</p><dl className="mt-3 divide-y divide-border">{exam.items.filter(i => i.display !== null).map(item => <div key={item.id} className="flex justify-between gap-3 py-2 text-xs"><dt>{item.label}</dt><dd className="text-right font-medium">{item.display}</dd></div>)}{exam.bmi && <div className="flex justify-between py-2 text-xs"><dt>BMI</dt><dd className="font-medium">{exam.bmi}</dd></div>}</dl></section>
      <section className="py-4"><h2 className="text-sm font-semibold">医生标记的复核项目</h2>{exam.reviewItems.length ? <ul className="mt-2 divide-y divide-border">{exam.reviewItems.map(item => <li key={item.id} className="py-3"><p className="text-xs font-medium">{item.label} · {item.display}</p><p className="mt-1 text-[11px] text-muted-foreground">{item.record?.doctor ?? "医生未记录"} · {examDate(item.record?.created_at ?? null)}</p><p className="mt-1 text-xs text-warm">需复核，复查时间待医生确认</p></li>)}</ul> : <p className="mt-2 text-xs text-muted-foreground">暂无医生标记的复核项目；不代表已完成综合健康评估。</p>}{exam.criticalCount > 0 && <p className="mt-2 text-xs text-danger">体检记录含 {exam.criticalCount} 项风险值处理标记，请向体检医生核实后续安排。</p>}</section>
    </>}
    <section className="border-t border-border py-5"><h2 className="text-sm font-semibold">随访计划与记录</h2><p className="mt-3 text-sm text-muted-foreground">暂无已保存的随访计划或随访记录</p><p className="mt-2 text-xs text-muted-foreground">下一次复评日期、就诊反馈及完成状态尚未记录。</p></section>
    <Button asChild variant="outline" className="w-full"><Link to="/parent/report">查看完整体检报告</Link></Button>
  </div></div>;
}
