import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Activity, ArrowRight, CalendarCheck, Check, ClipboardCheck, FileText, Send, ShieldCheck, Stethoscope } from "lucide-react";
import { toast } from "sonner";
import { MobileFrame, StatusBar } from "@/components/MobileFrame";
import { Button } from "@/components/ui/button";
import { ActionSheet } from "@/components/ActionSheet";
import { RiskLevelSheet } from "@/components/RiskLevelSheet";
import { PreExamQuestionnaireSheet } from "@/components/PreExamQuestionnaireSheet";
import { VoiceTextarea } from "@/components/VoiceTextarea";
import { preExamQuestionnaires } from "@/lib/pre-exam-questionnaires";
import { riskByKey } from "@/lib/risk-levels";
import { bmiOf, initialProgress, needsReferral, PREVIEW_EXAM_DATE, PREVIEW_TODAY, previewStudents, readProgress, saveProgress, type PreviewStage, type StudentProgress } from "@/lib/exam-preview";
import studentImage from "@/assets/child-3d.png";

type Role = "parent" | "school" | "doctor" | "community";
type View = "home" | "report" | "plan" | "notice" | "followup";
const roles: { key: Role; label: string }[] = [{ key: "parent", label: "家长" }, { key: "school", label: "学校" }, { key: "doctor", label: "医生" }, { key: "community", label: "社区" }];
const views: { key: View; label: string }[] = [{ key: "home", label: "首页" }, { key: "report", label: "报告" }, { key: "plan", label: "方案" }, { key: "followup", label: "随访" }];

export function ExamStagePreview({ stage }: { stage: PreviewStage }) {
  const [role, setRole] = useState<Role>("parent");
  const [view, setView] = useState<View>("home");
  const [uid, setUid] = useState(previewStudents[0].uid);
  const [progress, setProgress] = useState(() => initialProgress(stage));
  const [ready, setReady] = useState(false);
  const [signed, setSigned] = useState(false);
  const [followupText, setFollowupText] = useState("");
  const [summary, setSummary] = useState("");
  useEffect(() => {
    setProgress(readProgress(stage, window.localStorage));
    setReady(true);
  }, [stage]);
  const student = previewStudents.find(s => s.uid === uid) ?? previewStudents[0];
  const state = progress[student.uid];
  const risk = riskByKey(student.risk);
  const isPost = stage === "post";
  const update = (patch: Partial<StudentProgress>) => {
    const next = { ...progress, [student.uid]: { ...state, ...patch } };
    saveProgress(stage, next, window.localStorage);
    setProgress(next);
  };
  const openReport = () => { update({ reportRead: true }); setView("report"); };
  const showStudent = (id: string) => { setUid(id); setView("report"); setSummary(""); setFollowupText(""); };
  const consentCount = previewStudents.filter(s => progress[s.uid].consent).length;
  const referralCount = previewStudents.filter(s => progress[s.uid].referralSent).length;

  return <MobileFrame>
    <StatusBar title={isPost ? "初中检后健康管理" : "初中检前准备"} back={false} />
    <div className="flex items-center justify-between border-b border-border px-4 py-2 text-[10px] text-muted-foreground">
      <span>示例学校 · 虚构学生 · 不写入真实名单</span>
      <Link to={isPost ? "/preview/pre" : "/preview/post"} className="font-semibold text-deep">{isPost ? "检前入口" : "检后入口"} →</Link>
    </div>
    <div className="grid grid-cols-4 gap-1 border-b border-border px-4 py-2" aria-label="演示角色">
      {roles.map(r => <Button key={r.key} size="sm" variant={role === r.key ? "default" : "ghost"} onClick={() => { setRole(r.key); setView("home"); }}>{r.label}</Button>)}
    </div>
    <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-4 pb-6 pt-4">
      {!ready ? <p className="text-sm text-muted-foreground">正在读取记录…</p> : <>
      {role === "parent" && <>
        <label className="mb-4 block text-xs text-muted-foreground">当前学生
          <select aria-label="当前学生" className="mt-1 w-full rounded-lg border border-border bg-surface p-2 text-sm text-foreground" value={uid} onChange={e => { setUid(e.target.value); setView("home"); setSigned(false); }}>
            {previewStudents.map(s => <option key={s.uid} value={s.uid}>{s.name} · {s.grade}{s.cls}</option>)}
          </select>
        </label>
        <header className="mb-4 flex items-center gap-3">
          <img src={studentImage} alt="学生健康档案形象" className="h-20 w-14 object-contain" />
          <div className="min-w-0"><h1 className="text-xl font-bold">{student.name}的{isPost ? "健康档案" : "检前准备"}</h1><p className="text-[11px] text-muted-foreground">{student.age}岁 · {student.gender} · {student.grade}{student.cls}</p><p className="text-[11px] text-muted-foreground">{student.school}</p></div>
        </header>
        {!isPost || view === "notice" ? <>
          <div className="mb-4 flex items-center gap-2 border-y border-border py-3 text-sm"><ShieldCheck className="h-5 w-5 text-deep" /><span>{state.consent ? "体检授权已签署" : "请完成体检授权"}</span><span className="ml-auto text-xs text-muted-foreground">{state.questionnaires.length}/2份问卷</span></div>
          <h2 className="mb-2 text-sm font-bold">教育局学生健康体检授权协议书</h2>
          <p className="mb-3 text-xs leading-relaxed text-muted-foreground">本次校内体检采集学生身份及体格、视力、血压、脊柱和口腔筛查数据，用于体检报告与检后健康管理。监护人确认后方可开展体检；可在本页撤回授权。</p>
          {state.consent ? <div className="mb-4 flex items-center justify-between text-sm text-success"><span className="flex items-center gap-1"><Check className="h-4 w-4" />监护人已确认</span>{!isPost && <Button variant="ghost" size="sm" onClick={() => update({ consent: false })}>撤回授权</Button>}</div> : <ActionSheet trigger={<Button className="mb-4 w-full"><ShieldCheck />签署体检授权</Button>} title="教育局学生健康体检授权协议书" description={`${student.name} · ${student.school} · ${student.grade}${student.cls}`} disabled={!signed} confirmText="同意并提交" onConfirm={() => { update({ consent: true }); setSigned(false); }} toastMessage="授权已保存">
            <p className="mb-3 text-xs">同意学校与承检医生采集本次体检数据，并用于本人孩子的报告、方案与随访服务。示例签名仅用于演示。</p><label className="flex items-center gap-2 py-3 text-sm"><input type="checkbox" checked={signed} onChange={e => setSigned(e.target.checked)} />我是该学生监护人，已阅读并同意</label>
          </ActionSheet>}
          <h2 className="mb-2 mt-3 text-sm font-bold">检前问卷</h2>
          {Object.values(preExamQuestionnaires).map(q => <div key={q.id} className="flex items-center justify-between gap-2 border-b border-border py-3"><div className="min-w-0"><p className="text-xs font-semibold">{q.title}</p><p className="text-[10px] text-muted-foreground">{state.questionnaires.includes(q.id) ? "已提交" : "待填写"} · 6题</p></div><PreExamQuestionnaireSheet key={`${uid}-${q.id}`} questionnaire={q} submitted={state.questionnaires.includes(q.id)} storageKey={`preview-${stage}-${uid}-${q.id}`} onSubmit={() => update({ questionnaires: Array.from(new Set([...state.questionnaires, q.id])) })} /></div>)}
          <div className="mt-4 border-t border-border pt-3 text-xs"><p className="font-semibold">{isPost ? "历史体检记录" : "体检安排"}</p><p className="mt-1 text-muted-foreground">{PREVIEW_EXAM_DATE} · 校内体检 · 身高体脂、视力、腰臀围、血压、脊柱、口腔</p><p className="mt-2 text-muted-foreground">{isPost ? "体检已完成，授权与问卷作为历史记录保留。" : "报告尚未生成。按正常饮食及作息到校；如有不适，请提前告知老师和体检医生。"}</p></div>
        </> : <>
          <RiskLevelSheet current={student.risk} trigger={<Button variant="outline" className={`mb-4 h-auto w-full justify-between whitespace-normal py-3 ${risk.chip}`}><span>{risk.key} · {risk.level}</span><span className="text-xs">等级说明 ⓘ</span></Button>} />
          {view === "home" && <>
            <div className="mb-4 border-l-4 border-deep pl-3"><p className="text-xs font-semibold text-deep">{PREVIEW_EXAM_DATE}体检报告已出具</p><p className="mt-1 text-sm leading-relaxed">{student.summary}</p></div>
            <div className="mb-4 grid grid-cols-3 border-y border-border py-3 text-center"><div><p className="text-xl font-bold">{bmiOf(student)}</p><p className="text-[10px] text-muted-foreground">BMI · 筛查值</p></div><div><p className="text-xl font-bold">{student.issues.length}</p><p className="text-[10px] text-muted-foreground">需关注问题</p></div><div><p className="text-xl font-bold">{state.checkins.length}/2</p><p className="text-[10px] text-muted-foreground">今日打卡</p></div></div>
            <Button className="mb-2 w-full" onClick={openReport}><FileText />{state.reportRead ? "查看体检报告" : "阅读体检报告"}<ArrowRight /></Button>
            <Button variant="outline" className="mb-4 w-full" onClick={() => setView("plan")}><ClipboardCheck />{state.planConfirmed ? "查看医生确认方案" : "等待医生确认方案"}</Button>
            <h2 className="text-sm font-bold">检后服务进度</h2>
            <ol className="my-3 space-y-2 text-xs"><li>✓ 体检完成 · 医生质控通过</li><li>✓ 授权已签署 · 检前问卷已完成</li><li>{state.reportRead ? "✓ 报告已阅读" : "○ 报告待阅读"}</li><li>{state.planConfirmed ? "✓ 医生已确认健康方案" : "○ 方案待医生确认"}</li><li>{state.followup ? `✓ 随访已记录：${state.followup}` : "○ 2026-11-03首次随访 · 健管师负责"}</li></ol>
            <Button variant="ghost" size="sm" onClick={() => setView("notice")}>查看历史授权与问卷</Button>
          </>}
          {view === "report" && <>
            <h2 className="text-base font-bold">体检结果明细</h2><p className="mb-3 text-[10px] text-muted-foreground">学号 {student.sno} · 唯一ID {student.uid}</p>
            <dl className="text-xs">{[["身高", `${student.height} cm`], ["体重", `${student.weight} kg`], ["BMI", `${bmiOf(student)}`], ["体脂率", `${student.bodyfat}%`], ["腰围 / 臀围", `${student.waist} / ${student.hip} cm`], ["裸眼视力（右 / 左）", student.vision], ["收缩压 / 舒张压", `${student.bp} mmHg`], ["脊柱躯干旋转角", `${student.spine}°`], ["龋齿", `${student.oral}颗`]].map(([label, value]) => <div key={label} className="flex justify-between gap-3 border-b border-border py-2.5"><dt className="text-muted-foreground">{label}</dt><dd className="font-semibold">{value}</dd></div>)}</dl>
            <h3 className="mb-2 mt-4 text-sm font-bold">医生筛查意见</h3><p className="mb-3 text-xs">{student.summary}</p><p className="mb-3 text-[10px] text-muted-foreground">BMI随身高体重计算；风险采用示例医生复核结论，并非成人BMI阈值自动诊断。未采集的过敏原、肺功能及血液指标不显示为检查结果。</p>
            {student.risk === "红色" && <div className="mb-3 border-l-4 border-danger bg-danger/10 p-3 text-xs"><p className="font-bold text-danger">危急值现场处理 · 已闭环</p><ol className="mt-2 space-y-1"><li>✓ 体检医生静息复测，仍为182/122 mmHg</li><li>✓ 体检医生已告知监护人及学校</li><li>✓ 体检医生已启动紧急转诊并完成交接</li></ol><p className="mt-2">检后由健管师追踪就诊回执；出现急性症状及时急诊。</p></div>}
            <Button className="w-full" onClick={() => setView("plan")}><ClipboardCheck />查看对应干预方案</Button>
          </>}
          {view === "plan" && <>
            <h2 className="mb-1 text-base font-bold">结构化健康方案</h2><p className="mb-3 text-[11px] text-muted-foreground">王丽 · 体检医生 · {state.planConfirmed ? "已确认" : "待确认"} · 2026-10-23</p>
            {student.risk === "红色" ? <p className="mb-4 text-sm">优先落实紧急就医及专科医嘱，暂不开展自行运动干预。学校配合停测，社区追踪交接和就诊结果。</p> : <>
              {[["建议概述", state.planSummary ?? student.summary], ["饮食", student.dept === "肥胖科" ? "三餐规律，减少含糖饮料及高能量零食，不节食，记录每周体重。" : "保持均衡三餐与正常营养摄入，不因单项筛查异常限制饮食。"], ["运动", student.spine >= 8 ? "日常适量活动；脊柱专科评估前不自行进行矫正训练。" : "每天累计约60分钟适宜活动，循序渐进；不适时停止并咨询医生。"], ["用眼与护理", `保持户外活动和用眼休息，${student.vision === "5.0 / 5.0" ? "视力定期筛查" : "安排眼科复查"}；${student.oral ? "预约口腔检查" : "早晚刷牙"}。`], ["睡眠", "固定作息，初中生争取每天9小时睡眠。"], ["复查随访", needsReferral(student) ? `先到${student.dept}复核，2026-11-03健管师首次随访。` : "2026-11-03健管师随访，按医生安排复查。"]].map(([title, text]) => <section key={title} className="border-b border-border py-3"><h3 className="text-xs font-bold text-deep">{title}</h3><p className="mt-1 text-xs leading-relaxed">{text}</p></section>)}
            </>}
            {!state.planConfirmed ? <p className="mt-3 text-xs text-muted-foreground">方案尚未确认，家长执行及打卡暂未开放。</p> : <div className="mt-4 space-y-2"><h3 className="text-sm font-bold">{PREVIEW_TODAY} 家庭执行</h3>{["饮食", "运动"].map(kind => <Button key={kind} variant="outline" className="w-full" disabled={state.checkins.includes(kind) || student.risk === "红色"} onClick={() => { update({ checkins: [...state.checkins, kind] }); toast.success(`${kind}打卡已保存`); }}>{state.checkins.includes(kind) ? <Check /> : <Activity />}{kind}打卡{state.checkins.includes(kind) ? " · 已完成" : ""}</Button>)}</div>}
          </>}
          {view === "followup" && <>
            <h2 className="mb-3 text-base font-bold">复查与随访</h2><p className="mb-3 text-xs">{needsReferral(student) ? `建议科室：${student.dept}` : "家庭管理与定期复评"}</p>
            {needsReferral(student) && <><p className="mb-2 text-xs">{state.referralSent ? "社区已推送 / 完成转诊交接" : "待社区推送儿童医院"}</p><Button className="mb-4 w-full" disabled={state.appointment} onClick={() => { update({ appointment: true }); toast.success("复查预约意向已记录（演示）"); }}><CalendarCheck />{state.appointment ? "复查预约意向已记录" : "登记复查预约意向"}</Button></>}
            <p className="border-t border-border pt-3 text-xs">2026-11-03 · 健管师首次随访</p><p className="mt-2 text-xs text-muted-foreground">{state.followup ?? "随访未完成，等待健管师记录"}</p><p className="mt-3 text-xs">本日家庭打卡：{state.checkins.join("、") || "尚未打卡"}</p>
          </>}
        </>}
      </>}
      {role !== "parent" && <>
        <header className="mb-4"><h1 className="text-xl font-bold">{roles.find(r => r.key === role)?.label}{isPost ? "检后工作台" : "检前工作台"}</h1><p className="mt-1 text-[11px] text-muted-foreground">{previewStudents[0].school} · 6名初中学生</p></header>
        {view === "home" ? <>
          <div className="mb-4 grid grid-cols-3 border-y border-border py-3 text-center">{(isPost ? [["已检", 6], ["医学复核 / 高风险", previewStudents.filter(needsReferral).length], ["已转诊", referralCount]] : [["待检", 6], ["已授权", consentCount], ["问卷完成", previewStudents.filter(s => progress[s.uid].questionnaires.length === 2).length]]).map(([label, value]) => <div key={label}><p className="text-xl font-bold">{value}</p><p className="text-[10px] text-muted-foreground">{label}</p></div>)}</div>
          <h2 className="text-sm font-bold">{role === "community" && isPost ? "患儿上传" : "学生列表"}</h2>
          {previewStudents.filter(s => role !== "community" || !isPost || needsReferral(s)).map(s => <div key={s.uid} className="border-b border-border py-3"><div className="flex items-center justify-between"><p className="text-sm font-semibold">{s.name} <span className="text-[10px] font-normal text-muted-foreground">{s.grade}{s.cls}</span></p>{isPost && <span className={`rounded px-2 py-1 text-[10px] ${riskByKey(s.risk).chip}`}>{s.risk} · {riskByKey(s.risk).level}</span>}</div><p className="mt-1 text-xs text-muted-foreground">{isPost ? s.issues.join("；") || "未发现需干预异常" : `${progress[s.uid].consent ? "已授权" : "待授权"} · 问卷${progress[s.uid].questionnaires.length}/2 · 待检`}</p>{isPost && <Button variant="ghost" size="sm" className="mt-1" onClick={() => showStudent(s.uid)}>查看{role === "doctor" ? "档案与方案" : "风险详情"}<ArrowRight /></Button>}</div>)}
        </> : <>
          <Button variant="ghost" size="sm" onClick={() => setView("home")}>← 返回列表</Button><h2 className="mt-3 text-base font-bold">{student.name} · {student.grade}{student.cls}</h2><p className="mb-3 text-[10px] text-muted-foreground">学号 {student.sno} · ID {student.uid}</p><RiskLevelSheet current={student.risk} trigger={<Button variant="outline" className={`mb-3 ${risk.chip}`}>{student.risk} · {risk.level} ⓘ</Button>} /><p className="mb-3 text-sm">{student.summary}</p><p className="mb-4 border-y border-border py-3 text-xs">身高{student.height}cm · 体重{student.weight}kg · BMI {bmiOf(student)}<br />视力（右/左）{student.vision} · 血压{student.bp}mmHg<br />脊柱{student.spine}° · 龋齿{student.oral}颗</p>
          {role === "school" && <><p className="text-xs">家长{state.reportRead ? "已读报告" : "未读报告"} · 医生{state.planConfirmed ? "已确认方案" : "待确认方案"}</p><p className="mt-2 text-xs">{student.risk === "红色" ? "危急值现场处置已完成，学校配合交接并关注返校。" : "学校协助用眼、运动及健康教育，不代替医生诊断。"}</p><p className="mt-2 text-xs">家庭打卡：{state.checkins.join("、") || "未完成"}</p></>}
          {role === "doctor" && <><h3 className="text-sm font-bold">建议概述 · 文字 / 语音调整</h3><VoiceTextarea value={summary || state.planSummary || student.summary} onChange={setSummary} /><Button className="mt-2 w-full" onClick={() => { update({ planConfirmed: true, planSummary: summary || student.summary }); toast.success("医生方案已确认，家长与学校状态同步"); }}><Stethoscope />确认并同步方案</Button><p className="mt-3 text-xs">{student.risk === "红色" ? "复测、告知、紧急转诊3项现场处置均已由体检医生完成。" : "本次未触发需强制闭环的危急值。异常筛查按专科复核处理。"}</p></>}
          {role === "community" && <><p className="mb-3 text-xs">推荐接收科室：{student.dept}。仅肥胖问题推送肥胖科；没有呼吸问题不推送呼吸科。</p><Button className="w-full" disabled={state.referralSent} onClick={() => { update({ referralSent: true }); toast.success("儿童医院推送已记录（演示）"); }}><Send />{state.referralSent ? "已推送 / 已交接" : `推送儿童医院 · ${student.dept}`}</Button><h3 className="mb-2 mt-4 text-sm font-bold">健管师随访记录</h3><textarea aria-label="随访记录" className="min-h-24 w-full rounded-lg border border-border bg-surface p-3 text-xs" placeholder="填写联系家长、就诊反馈及后续安排" value={followupText} onChange={e => setFollowupText(e.target.value)} /><Button variant="outline" className="mt-2 w-full" disabled={!followupText.trim()} onClick={() => { update({ followup: followupText.trim() }); toast.success("随访记录已同步"); }}>保存随访记录</Button><p className="mt-3 text-xs text-muted-foreground">{state.followup ?? "尚无随访记录"}</p></>}
        </>}
      </>}
      </>}
    </div>
    {role === "parent" && isPost && <nav className="grid grid-cols-4 border-t border-border bg-surface px-2 pb-5 pt-2">{views.map(v => <Button key={v.key} size="sm" variant={view === v.key ? "default" : "ghost"} onClick={() => { if (v.key === "report") openReport(); else setView(v.key); }}>{v.label}</Button>)}</nav>}
  </MobileFrame>;
}