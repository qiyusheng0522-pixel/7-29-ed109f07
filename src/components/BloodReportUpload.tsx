import { useEffect, useRef, useState } from "react";
import { FileText, Upload, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { bloodReportError, readBloodReport, removeBloodReport, saveBloodReport } from "@/lib/questionnaire-attachment";

export function BloodReportUpload({ storageKey }: { storageKey: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    setFile(undefined);
    readBloodReport(storageKey).then(value => { if (active) setFile(value); }).catch(() => { if (active) setError("无法读取化验单，请重新选择文件。"); });
    return () => { active = false; };
  }, [storageKey]);

  async function selectFile(next: File) {
    const message = bloodReportError(next);
    if (message) { setError(message); return; }
    setBusy(true); setError("");
    try { await saveBloodReport(storageKey, next); setFile(next); }
    catch { setError("化验单未保存，请重试或检查浏览器存储空间。"); }
    finally { setBusy(false); }
  }

  return <section className="space-y-3 border-t border-border pt-4" aria-label="血常规化验单">
    <h3 className="text-sm font-semibold">补充近期血常规化验单</h3>
    <p className="text-xs leading-relaxed text-muted-foreground">您在过敏问卷中选择了“是”。如孩子近期做过血常规检查，请上传清晰完整的化验单，保留姓名、检查日期及检验结果，供医生结合问卷参考。暂无化验单也可提交问卷，无需为填写问卷额外检查。</p>
    <input ref={input} type="file" accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf" className="sr-only" aria-label="选择血常规化验单" onChange={event => {
      const next = event.target.files?.[0];
      if (next) void selectFile(next);
      event.target.value = "";
    }} />
    {file && <div className="flex min-w-0 items-center gap-2 text-xs">
      <FileText className="h-4 w-4 shrink-0 text-warm" />
      <span className="min-w-0 flex-1 break-all">{file.name}<span className="block text-muted-foreground">已保存在本机</span></span>
      <Button type="button" variant="ghost" size="icon" disabled={busy} aria-label="删除化验单" title="删除化验单" onClick={async () => {
        setBusy(true); setError("");
        try { await removeBloodReport(storageKey); setFile(undefined); }
        catch { setError("删除失败，请重试。"); }
        finally { setBusy(false); }
      }}><Trash2 className="h-4 w-4" /></Button>
    </div>}
    <Button type="button" variant="outline" className="w-full" disabled={busy} onClick={() => input.current?.click()}><Upload className="mr-2 h-4 w-4" />{busy ? "正在保存…" : file ? "更换化验单" : "上传血常规化验单"}</Button>
    <p className="text-xs text-muted-foreground">支持 JPG、PNG、PDF，单份不超过 10MB。文件仅保存在当前浏览器，尚未同步给医生。</p>
    {error && <p role="alert" className="text-xs text-danger">{error}</p>}
  </section>;
}