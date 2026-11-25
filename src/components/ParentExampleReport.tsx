import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronDown, ClipboardCheck, ShieldCheck } from "lucide-react";
import { StatusBar } from "@/components/MobileFrame";
import { Button } from "@/components/ui/button";
import { RiskLevelSheet } from "@/components/RiskLevelSheet";
import { previewStudents, bmiOf, PREVIEW_EXAM_DATE } from "@/lib/exam-preview";
import { riskByKey } from "@/lib/risk-levels";
import studentImage from "@/assets/child-3d.png";

export function ParentExampleReport() {
  const [showPlan, setShowPlan] = useState(false);
  const student = previewStudents[0];
  if (!student) return null;
  const risk = riskByKey(student.risk);
  const groups = [
    { title: "体格发育", rows: [["身高", `${student.height} cm`], ["体重", `${student.weight} kg`], ["BMI", `${bmiOf(student)} kg/m²`], ["体脂率", `${student.bodyfat}%`], ["腰围 / 臀围", `${student.waist} / ${student.hip} cm`]] },
    { title: "视力筛查", rows: [["裸眼视力（右 / 左）", student.vision]] },
    { title: "血压测量", rows: [["收缩压 / 舒张压", `${student.bp} mmHg`]] },
    { title: "脊柱与口腔", rows: [["躯干旋转角（ATR）", `${student.spine}°`], ["龋齿", `${student.oral} 颗`]] },
  ];
  return <div><StatusBar title="体检报告" /><div className="px-5 pb-8 pt-2">
    <header className="border-b border-border pb-4">
      <span className="rounded bg-teal/10 px-2 py-1 text-[11px] font-medium text-teal">示例报告 · 非真实诊疗记录</span>
      <div className="mt-3 flex items-center justify-between gap-3"><div className="min-w-0"><h1 className="text-xl font-bold">{student.name}的体检报告</h1><p className="mt-2 text-xs text-muted-foreground">{student.age} 岁 · {student.gender} · {student.grade}{student.cls}</p><p className="mt-1 text-xs text-muted-foreground">{student.school}</p><p className="mt-1 text-xs text-muted-foreground">学号 {student.sno}</p></div><img src={studentImage} alt="学生健康形象" className="h-24 w-16 shrink-0 object-contain" /></div>
      <p className="mt-3 flex items-center gap-1 text-[11px] text-muted-foreground"><ShieldCheck className="h-3.5 w-3.5 text-teal" />体检已完成 · {PREVIEW_EXAM_DATE}</p>
    </header>
    <section className="py-4">
      <RiskLevelSheet current={student.risk} trigger={<Button variant="outline" className={`h-auto w-full justify-between py-3 ${risk.chip}`}><span>{risk.key} · {risk.level}</span><span className="text-xs">等级说明 ⓘ</span></Button>} />
      <h2 className="mt-4 text-sm font-bold">本次体检 · 2 项需关注</h2>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{student.summary}</p>
      {student.issues.map((issue, index) => <div key={issue} className="mt-3 border-l-2 border-warm bg-warm/5 p-3"><p className="text-xs font-semibold">{issue}</p><div className="mt-2 flex items-center justify-between gap-2"><span className="text-[11px] text-muted-foreground">建议复查：{index === 0 ? "肥胖科" : "眼科"}</span><Button asChild variant="outline" size="sm"><Link to="/parent/comm" search={{ topic: index === 0 ? "体重与体脂偏高" : "裸眼视力下降", dept: index === 0 ? "肥胖科" : "眼科", from: "report" }}>立即咨询</Link></Button></div></div>)}
    </section>
    <h2 className="mb-2 text-base font-bold">体检结果明细</h2>
    {groups.map(group => <details key={group.title} open className="mb-3 rounded-lg border border-border bg-surface"><summary className="cursor-pointer p-3 text-sm font-semibold">{group.title}</summary><dl className="divide-y divide-border px-3">{group.rows.map(([label, value]) => <div key={label} className="flex justify-between gap-3 py-3 text-xs"><dt className="text-muted-foreground">{label}</dt><dd className="text-right font-semibold">{value}</dd></div>)}</dl></details>)}
    <section className="mt-5 border-t border-border pt-4"><h2 className="text-sm font-bold">医生筛查意见（示例）</h2><p className="mt-2 text-xs leading-relaxed">建议肥胖科评估体重与体脂情况；眼科复查裸眼视力。本次血压及脊柱筛查未触发危急值，无需紧急干预。</p><p className="mt-2 text-[11px] text-muted-foreground">王丽 · 体检医生 · 2026-10-23</p></section>
    <Button variant="outline" className="mt-5 w-full justify-between" onClick={() => setShowPlan(v => !v)} aria-expanded={showPlan}><span className="flex items-center gap-2"><ClipboardCheck className="h-4 w-4" />{student.name}的呵护方案</span><ChevronDown className={`h-4 w-4 transition-transform ${showPlan ? "rotate-180" : ""}`} /></Button>
    {showPlan && <section className="mt-2" aria-label="示例呵护方案">{[["建议概述", student.summary], ["饮食", "规律三餐，减少含糖饮料和高能量零食，不节食；每周记录体重。"], ["运动", "每天累计约60分钟适宜活动，循序渐进，不适时停止并咨询医生。"], ["用眼与护理", "安排眼科复查；增加户外活动，保持用眼休息，早晚刷牙。"], ["睡眠", "固定作息，初中生争取每天9小时睡眠。"], ["复查随访", "先到肥胖科、眼科复核，按专科医生意见安排复查与随访。"]].map(([title, text]) => <div key={title} className="border-b border-border py-3"><h3 className="text-xs font-semibold text-teal">{title}</h3><p className="mt-1 text-xs leading-relaxed">{text}</p></div>)}</section>}
    <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">以上为虚构初中生的报告示例，筛查不等同于诊断；未采集项目不展示检查结果。</p>
  </div></div>;
}