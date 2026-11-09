import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { Camera, FileCheck2, ImagePlus, Loader2, ScanText } from "lucide-react";
import { MobileFrame, StatusBar } from "@/components/MobileFrame";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { listStudents, type DbStudent } from "@/lib/students-db";
import { recognizePaper, savePaper } from "@/lib/paper-questionnaire.functions";
import { matchPaperStudents, paperSections, unresolvedAnswers, type PaperQuestionnaire } from "@/lib/paper-questionnaire";
import { PaperQuestionnaireRecords } from "@/components/PaperQuestionnaireRecords";
import template from "@/assets/jiangsu-questionnaire-template.pdf.asset.json";

export const Route = createFileRoute("/questionnaire")({
  validateSearch: (s: Record<string, unknown>) => ({ uid: typeof s.uid === "string" ? s.uid : undefined }),
  head: () => ({ meta: [{ title: "健康问卷采集 · 阳光校园健康" }, { name: "description", content: "纸质儿童健康问卷拍照识别、学生核对及档案归集。" }, { property: "og:title", content: "健康问卷采集 · 阳光校园健康" }, { property: "og:description", content: "核对学生身份和原始勾选答案后保存问卷档案。" }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: QuestionnairePage,
});
function QuestionnairePage() {
  const { uid } = Route.useSearch();
  const recognize = useServerFn(recognizePaper);
  const save = useServerFn(savePaper);
  const photoRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [signedIn, setSignedIn] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [tab, setTab] = useState<"capture" | "records">(uid ? "records" : "capture");
  const [students, setStudents] = useState<DbStudent[]>([]);
  const [selected, setSelected] = useState(uid ?? "");
  const [search, setSearch] = useState("");
  const [image, setImage] = useState("");
  const [draft, setDraft] = useState<PaperQuestionnaire | null>(null);
  const [busy, setBusy] = useState<"ocr" | "save" | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [reviewed, setReviewed] = useState(false);
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSignedIn(!!data.session); setAuthReady(true); });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setSignedIn(!!session));
    return () => data.subscription.unsubscribe();
  }, []);
  useEffect(() => { if (signedIn) listStudents().then(setStudents).catch(() => setError("学生名单读取失败")); }, [signedIn]);
  const login = async (provider: "google" | "lovable") => {
    setError("");
    const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: `${window.location.origin}/questionnaire` });
    if (result.error) setError(result.error.message);
  };
  const loadImage = async (file?: File) => {
    if (!file) return;
    setError(""); setNotice(""); setDraft(null); setReviewed(false);
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return setError("请选择 JPG、PNG 或 WebP 照片");
    if (file.size > 10 * 1024 * 1024) return setError("照片超过 10MB，请缩小后上传");
    const reader = new FileReader();
    reader.onload = () => { if (typeof reader.result === "string") setImage(reader.result); };
    reader.onerror = () => setError("照片读取失败"); reader.readAsDataURL(file);
    if (fileRef.current) fileRef.current.value = "";
    if (photoRef.current) photoRef.current.value = "";
  };
  const runOcr = async () => {
    setBusy("ocr"); setError(""); setReviewed(false);
    try {
      const result = await recognize({ data: { image } }); setDraft(result);
      const matches = matchPaperStudents(result.identity, students);
      setSelected(matches.length === 1 ? matches[0].uid : "");
      setNotice(matches.length === 1 ? "已找到学生，请核对身份与每题答案。" : "未唯一匹配学生，请搜索并核对学生信息。");
    } catch (e) { setError((e as Error).message); } finally { setBusy(null); }
  };
  const archive = async () => {
    if (!draft || !selected || !reviewed) return;
    setBusy("save"); setError("");
    try { await save({ data: { uid: selected, paper: draft, image, reviewed: true } }); setRefresh(v => v + 1); setDraft(null); setImage(""); setNotice("已保存到该学生的问卷档案。"); setTab("records"); }
    catch (e) { setError((e as Error).message); } finally { setBusy(null); }
  };
  const student = students.find(s => s.uid === selected);
  const filtered = students.filter(s => search && [s.name, s.sno, s.school, s.uid].some(v => v.includes(search))).slice(0, 20);
  return <MobileFrame><StatusBar title="问卷采集端" /><div className="flex-1 overflow-y-auto px-4 pb-8 pt-4">
    <header className="mb-5 flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-lg bg-deep text-deep-foreground"><ScanText /></span><div><h1 className="text-xl font-bold">健康问卷采集</h1><p className="text-xs text-muted-foreground">江苏省中小学生健康体检</p></div></header>
    <div className="mb-4 grid grid-cols-2 gap-2"><Button variant={tab === "capture" ? "secondary" : "outline"} onClick={() => setTab("capture")}><Camera />拍照录入</Button><Button variant={tab === "records" ? "secondary" : "outline"} onClick={() => setTab("records")}><FileCheck2 />已归档问卷</Button></div>
    {error && <p role="alert" className="mb-4 rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger">{error}</p>}
    {notice && <p role="status" className="mb-4 text-sm text-deep">{notice}</p>}
    {!authReady ? <p className="text-sm text-muted-foreground">正在检查登录状态…</p> : !signedIn ? <section className="border-y border-border py-6"><h2 className="mb-3 font-bold">采集人员登录</h2><p className="mb-4 text-sm text-muted-foreground">问卷含儿童健康信息，登录后可识别、归档与查看自己的采集记录。</p><div className="space-y-2"><Button className="w-full" onClick={() => login("lovable")}>使用 Lovable 登录</Button><Button variant="outline" className="w-full" onClick={() => login("google")}>使用 Google 登录</Button></div><Button asChild variant="link" className="mt-3"><a href={template.url} target="_blank" rel="noreferrer">查看问卷模板</a></Button></section> : tab === "records" ? <>
      <label className="mb-4 block text-xs text-muted-foreground">学生档案<select aria-label="查看学生问卷" value={selected} onChange={e => setSelected(e.target.value)} className="mt-1 h-10 w-full rounded-md border border-input bg-surface px-2 text-sm text-foreground"><option value="">我的全部采集记录</option>{students.map(s => <option key={s.uid} value={s.uid}>{s.name} · {s.sno} · {s.school}</option>)}</select></label><PaperQuestionnaireRecords uid={selected || null} refresh={refresh} />
    </> : <>
      <input ref={photoRef} type="file" accept="image/jpeg,image/png,image/webp" capture="environment" className="hidden" onChange={e => loadImage(e.target.files?.[0])} />
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e => loadImage(e.target.files?.[0])} />
      <div className="mb-4 grid grid-cols-2 gap-2"><Button disabled={!!busy} onClick={() => photoRef.current?.click()}><Camera />拍摄问卷</Button><Button disabled={!!busy} variant="outline" onClick={() => fileRef.current?.click()}><ImagePlus />选择照片</Button></div>
      <Button asChild variant="link" size="sm"><a href={template.url} target="_blank" rel="noreferrer">查看原始问卷模板</a></Button>
      {image && <><a href={image} target="_blank" rel="noreferrer"><img src={image} alt="待识别问卷原图" className="my-3 max-h-72 w-full rounded-lg border border-border object-contain" /></a><Button disabled={!!busy} className="mb-5 w-full bg-deep text-deep-foreground hover:bg-deep/90" onClick={runOcr}>{busy === "ocr" ? <Loader2 className="animate-spin" /> : <ScanText />}{busy === "ocr" ? "正在识别…" : "识别问卷"}</Button></>}
      {draft && <div className="space-y-5">
        <section className="border-y border-border py-4"><h2 className="mb-2 font-bold">1 · 核对学生</h2><p className="mb-3 text-xs text-muted-foreground">照片识别：{draft.identity.name || "姓名未识别"} · 学号 {draft.identity.sno || "未识别"} · 体检编号 {draft.identity.uid || "未识别"}</p><Input aria-label="搜索归档学生" placeholder="搜索姓名、学号、学校或体检编号" value={search} onChange={e => setSearch(e.target.value)} />
          {filtered.map(s => <Button key={s.uid} variant="ghost" className="mt-1 h-auto w-full justify-start whitespace-normal py-2 text-left text-xs" onClick={() => { setSelected(s.uid); setReviewed(false); setSearch(""); }}>{s.name} · {s.sno} · {s.school} · {s.grade}{s.cls}</Button>)}
          {student && <div className="mt-3 border-l-4 border-teal bg-secondary p-3 text-xs"><p className="font-bold">归档学生：{student.name} · {student.gender}</p><p>{student.school} · {student.grade} · {student.cls}</p><p>学号 {student.sno}</p><p className="break-all">体检编号 {student.uid}</p></div>}
        </section>
        {draft.warnings.map((w, i) => <p key={i} className="text-xs text-warning-foreground">{w}</p>)}
        <h2 className="font-bold">2 · 核对填写内容</h2>
        {paperSections.map(s => <section key={s.id}><h3 className="mb-1 text-sm font-bold">{s.title}</h3><p className="mb-3 text-xs text-muted-foreground">{s.instruction}</p>{s.questions.map((q, i) => <div key={q} className="border-b border-border py-3"><label className="text-sm">{i + 1}. {q}<select aria-label={`${s.title}第${i + 1}题`} className="mt-2 h-10 w-full rounded-md border border-input bg-surface px-2 text-sm" value={draft[s.id][i]} onChange={e => { const answers = [...draft[s.id]]; answers[i] = e.target.value as never; setDraft({ ...draft, [s.id]: answers }); setReviewed(false); }}>{[...s.options, ...unresolvedAnswers].map(o => <option key={o}>{o}</option>)}</select></label></div>)}</section>)}
        <label className="block text-sm">原图家长签名<select aria-label="家长签名情况" value={draft.signaturePresent === null ? "unknown" : String(draft.signaturePresent)} className="mt-2 h-10 w-full rounded-md border border-input bg-surface px-2" onChange={e => { setDraft({ ...draft, signaturePresent: e.target.value === "unknown" ? null : e.target.value === "true" }); setReviewed(false); }}><option value="unknown">无法确认</option><option value="true">原图有签名</option><option value="false">未见签名</option></select></label>
        <p className="text-xs text-muted-foreground">问卷仅用于健康筛查参考，不代替临床诊断及体检授权。</p>
        <label className="flex items-start gap-2 text-sm"><input type="checkbox" className="mt-1" checked={reviewed} onChange={e => setReviewed(e.target.checked)} />我已核对学生身份、原图和全部答案（含未填写项）</label>
        <Button disabled={!student || !reviewed || !!busy} className="w-full" onClick={archive}>{busy === "save" ? <Loader2 className="animate-spin" /> : <FileCheck2 />}{busy === "save" ? "保存中…" : "确认并保存至学生档案"}</Button>
      </div>}
    </>}
  </div></MobileFrame>;
}