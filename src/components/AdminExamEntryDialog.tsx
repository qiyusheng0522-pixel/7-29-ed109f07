import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  ADMIN_STATION_ID,
  ADMIN_STATION_NAME,
  SPINE_SEGMENTS,
  buildAdminExamValues,
  emptyAdminExamForm,
  readAdminExamForm,
  validateAdminExamForm,
  type AdminExamForm,
  type SpineAngleKey,
  type SpineResult,
} from "@/lib/admin-exam-entry";
import { listResults, mergeValues, saveResult, type DbStudent } from "@/lib/students-db";

export function AdminExamEntryDialog({ student, onClose, onSaved }: {
  student: DbStudent | null;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [form, setForm] = useState<AdminExamForm>(emptyAdminExamForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (!student) return;
    setForm(emptyAdminExamForm());
    setErrors([]);
    setLoading(true);
    listResults(student.uid)
      .then((results) => setForm(readAdminExamForm(mergeValues(results, student.uid))))
      .catch((error) => toast.error("读取已有体检数据失败", { description: (error as Error).message }))
      .finally(() => setLoading(false));
  }, [student]);

  const setAngle = (key: SpineAngleKey, value: string) => {
    setForm((current) => ({ ...current, angles: { ...current.angles, [key]: value } }));
  };
  const setSpineResult = (spineResult: SpineResult) => {
    setForm((current) => ({ ...current, spineResult }));
    setErrors([]);
  };

  const save = async () => {
    if (!student) return;
    const nextErrors = validateAdminExamForm(form);
    setErrors(nextErrors);
    if (nextErrors.length) return;
    setSaving(true);
    try {
      await saveResult({
        student_uid: student.uid,
        station_id: ADMIN_STATION_ID,
        doctor: ADMIN_STATION_NAME,
        item_values: buildAdminExamValues(form),
        crit_count: 0,
      });
      await onSaved();
      toast.success(`已保存 ${student.name} 的体检数据`);
      onClose();
    } catch (error) {
      toast.error("保存失败", { description: (error as Error).message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={student !== null} onOpenChange={(open) => { if (!open && !saving) onClose(); }}>
      <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>录入体检数据</DialogTitle>
          <DialogDescription>
            {student ? `${student.name} · ${student.school} · ${student.grade}${student.cls} · 学号 ${student.sno}` : "学生体检数据"}
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="flex min-h-48 items-center justify-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />正在读取已有数据…</div>
        ) : (
          <div className="space-y-5">
            <section className="rounded-lg border border-border p-4">
              <h3 className="text-sm font-semibold">一般检查</h3>
              <label className="mt-3 block text-xs text-muted-foreground" htmlFor="admin-waist">腰围（cm）</label>
              <Input id="admin-waist" type="number" min="0" step="0.1" inputMode="decimal" value={form.waist}
                onChange={(event) => setForm((current) => ({ ...current, waist: event.target.value }))}
                placeholder="请输入腰围" className="mt-1 max-w-xs" />
            </section>

            <section className="rounded-lg border border-border p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div><h3 className="text-sm font-semibold">脊柱侧弯筛查</h3><p className="mt-1 text-xs text-muted-foreground">选择阳性后，分别填写胸段、腰胸段、腰段的 ATR 角度。</p></div>
                <div className="flex rounded-lg bg-muted p-1" aria-label="脊柱侧弯筛查结果">
                  {(["阴性", "阳性"] as const).map((result) => (
                    <button key={result} type="button" aria-pressed={form.spineResult === result} onClick={() => setSpineResult(result)}
                      className={`rounded-md px-5 py-2 text-sm transition-colors ${form.spineResult === result ? "bg-background font-semibold text-foreground shadow-sm" : "text-muted-foreground"}`}>
                      {result}
                    </button>
                  ))}
                </div>
              </div>
              {form.spineResult === "阳性" && (
                <div className="mt-4 overflow-x-auto rounded-lg border border-border">
                  <table className="w-full min-w-[360px] text-sm">
                    <thead className="bg-muted text-left text-xs text-muted-foreground"><tr><th className="px-4 py-3 font-medium">节段</th><th className="px-4 py-3 font-medium">角度（°）</th></tr></thead>
                    <tbody className="divide-y divide-border">
                      {SPINE_SEGMENTS.map((segment) => (
                        <tr key={segment.id}>
                          <th className="px-4 py-3 text-left font-medium">{segment.label}</th>
                          <td className="px-4 py-3"><Input aria-label={`${segment.label}角度`} type="number" min="0" step="0.1" inputMode="decimal" value={form.angles[segment.key]} onChange={(event) => setAngle(segment.key, event.target.value)} placeholder="未录入" /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {form.spineResult === "阴性" && <p className="mt-4 rounded-lg bg-muted p-3 text-xs text-muted-foreground">阴性结果无需填写节段角度。</p>}
            </section>

            <section className="rounded-lg border border-border p-4">
              <h3 className="text-sm font-semibold">呼吸功能</h3>
              <label className="mt-3 block text-xs text-muted-foreground" htmlFor="admin-feno">呼出气一氧化氮 FeNO（ppb）</label>
              <Input id="admin-feno" type="number" min="0" step="1" inputMode="decimal" value={form.feno}
                onChange={(event) => setForm((current) => ({ ...current, feno: event.target.value }))}
                placeholder="请输入一氧化氮数值" className="mt-1 max-w-xs" />
            </section>
            {errors.length > 0 && <div role="alert" className="rounded-lg bg-destructive/10 p-3 text-xs text-destructive">{errors.map((error) => <p key={error}>{error}</p>)}</div>}
          </div>
        )}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>取消</Button>
          <Button type="button" onClick={save} disabled={loading || saving}>
            {saving ? <Loader2 className="animate-spin" /> : <Save />}{saving ? "保存中…" : "保存体检数据"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
