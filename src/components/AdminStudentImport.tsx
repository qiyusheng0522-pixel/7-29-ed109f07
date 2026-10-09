import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";

// 后台唯一入口：仅支持通过数据导入学生基本信息
export const IMPORT_FIELDS = ["学校", "学号", "姓名", "性别", "出生日期", "年级", "班级"] as const;

type Base = { school: string; sno: string; name: string; gender: string; birth: string; grade: string; cls: string };
type Exam = {
  status: "已检" | "待检";
  height?: number; weight?: number; bodyfat?: number; visionL?: number; visionR?: number;
  waist?: number; hip?: number; bp?: string; atr?: number; oral?: string; risk?: string;
};
export type StudentRow = Base & { uid: string } & Exam;

const SCHOOL_CODE: Record<string, string> = { 阳光小学: "01", 春晖小学: "02", 育英小学: "03" };

/** 18 位唯一标识：区划码6 + 学校码2 + 出生日期8 + 顺序号2，全局去重 */
export function genUid(b: Base, used: Set<string>): string {
  const prefix = "320102" + (SCHOOL_CODE[b.school] ?? "09") + b.birth.replace(/\D/g, "").padEnd(8, "0").slice(0, 8);
  for (let i = 0; i < 100; i++) {
    const uid = prefix + String(i).padStart(2, "0");
    if (!used.has(uid)) { used.add(uid); return uid; }
  }
  throw new Error("唯一编码已用尽");
}

const SAMPLE_CSV = `学校,学号,姓名,性别,出生日期,年级,班级
阳光小学,20230301,李小阳,男,2017-03-12,三年级,3班
阳光小学,20230302,王小雨,女,2017-06-08,三年级,3班
阳光小学,20230303,张子涵,男,2017-01-25,三年级,3班
阳光小学,20230304,陈可欣,女,2016-11-30,三年级,3班
阳光小学,20230305,刘浩然,男,2017-08-19,三年级,3班
春晖小学,20220101,赵一诺,女,2018-02-14,二年级,1班
春晖小学,20220102,孙思远,男,2018-05-03,二年级,1班`;

function parseCsv(text: string): Base[] {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const head = lines[0].split(/[,，\t]/).map((s) => s.trim());
  const idx = IMPORT_FIELDS.map((f) => head.indexOf(f));
  const missing = IMPORT_FIELDS.filter((_, i) => idx[i] < 0);
  if (missing.length) throw new Error(`缺少字段：${missing.join("、")}`);
  return lines.slice(1).map((l) => {
    const c = l.split(/[,，\t]/).map((s) => s.trim());
    const [school, sno, name, gender, birth, grade, cls] = idx.map((i) => c[i] ?? "");
    return { school, sno, name, gender, birth, grade, cls };
  });
}

// 原型：模拟体检完成后的数据回流
function mockExam(i: number): Exam {
  if (i % 3 === 2) return { status: "待检" };
  const h = 128 + ((i * 7) % 14), w = 26 + ((i * 5) % 12);
  const bpS = i === 0 ? 132 : 100 + ((i * 3) % 14);
  return {
    status: "已检", height: h, weight: w, bodyfat: 15 + ((i * 3) % 10),
    visionL: i === 1 ? 4.7 : 5.0, visionR: 5.0 + (i % 2) / 10,
    waist: 54 + (i % 8), hip: 64 + (i % 9), bp: `${bpS}/${62 + (i % 10)}`,
    atr: i === 3 ? 8 : i % 4, oral: i % 2 ? "龋齿 1-2 颗" : "正常",
    risk: i === 0 ? "红色" : i === 1 || i === 3 ? "橙色" : i % 2 ? "蓝色" : "绿色",
  };
}

const RISK_CLS: Record<string, string> = {
  绿色: "bg-success/15 text-success", 蓝色: "bg-teal/15 text-teal", 黄色: "bg-warning/15 text-warning",
  橙色: "bg-warm/20 text-warm", 红色: "bg-danger/15 text-danger",
};

export function AdminStudentImport() {
  const [rows, setRows] = useState<StudentRow[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [view, setView] = useState<"base" | "exam">("base");
  const [q, setQ] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const ingest = (text: string, source: string) => {
    try {
      const list = parseCsv(text);
      const used = new Set(rows.map((r) => r.uid));
      const snos = new Set(rows.map((r) => r.school + r.sno));
      const errs: string[] = [];
      const added: StudentRow[] = [];
      list.forEach((b, i) => {
        const line = i + 2;
        if (IMPORT_FIELDS.some((_, k) => !Object.values(b)[k])) return errs.push(`第 ${line} 行：字段不完整`);
        if (!/^\d{4}-\d{2}-\d{2}$/.test(b.birth)) return errs.push(`第 ${line} 行：出生日期格式应为 YYYY-MM-DD`);
        if (!["男", "女"].includes(b.gender)) return errs.push(`第 ${line} 行：性别应为 男/女`);
        if (snos.has(b.school + b.sno)) return errs.push(`第 ${line} 行：学号 ${b.sno} 已存在`);
        snos.add(b.school + b.sno);
        added.push({ ...b, uid: genUid(b, used), ...mockExam(rows.length + added.length) });
      });
      setRows((r) => [...r, ...added]);
      setErrors(errs);
      toast.success(`${source}导入完成：成功 ${added.length} 条`, {
        description: errs.length ? `${errs.length} 条校验失败，请修正后重新导入` : "已为每名学生生成 18 位唯一标识编码",
      });
    } catch (e) {
      toast.error("导入失败", { description: (e as Error).message });
    }
  };

  const onFile = async (f?: File) => {
    if (!f) return;
    ingest(await f.text(), f.name + " ");
    if (fileRef.current) fileRef.current.value = "";
  };

  const downloadTpl = () => {
    const blob = new Blob(["\uFEFF" + IMPORT_FIELDS.join(",") + "\n"], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "学生基本信息导入模板.csv";
    a.click();
  };

  const shown = useMemo(
    () => rows.filter((r) => !q || [r.name, r.sno, r.uid, r.school].some((v) => v.includes(q))),
    [rows, q],
  );
  const done = rows.filter((r) => r.status === "已检").length;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="mb-3 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold">学生基本信息导入</p>
            <p className="text-[11px] text-slate-500">
              学生信息仅支持后台数据导入（CSV，Excel 另存为 CSV 即可），导入后系统自动生成 18 位唯一标识编码
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <button onClick={downloadTpl} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs hover:bg-slate-50">下载模板</button>
            <button onClick={() => ingest(SAMPLE_CSV, "示例数据")} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs hover:bg-slate-50">导入示例数据</button>
            <button onClick={() => fileRef.current?.click()} className="rounded-lg bg-teal px-3 py-1.5 text-xs text-white hover:opacity-90">选择文件导入</button>
            <input ref={fileRef} type="file" accept=".csv,.txt" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
          </div>
        </div>
        <div className="grid grid-cols-8 gap-2 text-[11px]">
          {IMPORT_FIELDS.map((f) => (
            <div key={f} className="rounded-lg bg-slate-50 px-3 py-2 text-center text-slate-600">{f}<span className="text-danger"> *</span></div>
          ))}
          <div className="rounded-lg bg-teal/10 px-3 py-2 text-center text-teal">唯一编码 · 自动</div>
        </div>
        <p className="mt-2 text-[11px] text-slate-400">编码规则：区划码 6 位 + 学校码 2 位 + 出生日期 8 位 + 顺序号 2 位，全库唯一、不可修改。</p>
        {errors.length > 0 && (
          <div className="mt-3 rounded-lg bg-danger/10 p-3 text-[11px] text-danger">
            {errors.map((e) => <p key={e}>{e}</p>)}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex gap-1 rounded-lg bg-slate-100 p-1 text-xs">
            {([["base", "基本信息"], ["exam", "体检数据回显"]] as const).map(([k, l]) => (
              <button key={k} onClick={() => setView(k)} className={`rounded-md px-3 py-1 ${view === k ? "bg-white font-semibold shadow-sm" : "text-slate-500"}`}>{l}</button>
            ))}
          </div>
          <p className="text-xs text-slate-500">共 {rows.length} 人 · 已检 {done} · 待检 {rows.length - done}</p>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="搜索姓名 / 学号 / 编码" className="w-56 rounded-lg border border-slate-200 px-3 py-1.5 text-xs" />
        </div>
        {rows.length === 0 ? (
          <p className="py-10 text-center text-xs text-slate-400">暂无学生数据，请先导入学生基本信息</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap text-xs">
              <thead className="text-slate-500">
                <tr className="border-b border-slate-100 text-left">
                  <th className="py-2 pr-3 font-normal">唯一标识编码</th>
                  {view === "base"
                    ? IMPORT_FIELDS.map((f) => <th key={f} className="pr-3 font-normal">{f}</th>)
                    : ["姓名", "学号", "状态", "身高cm", "体重kg", "体脂%", "视力左", "视力右", "腰围cm", "臀围cm", "血压mmHg", "脊柱ATR°", "口腔", "风险等级"].map((f) => <th key={f} className="pr-3 font-normal">{f}</th>)}
                </tr>
              </thead>
              <tbody>
                {shown.map((r) => (
                  <tr key={r.uid} className="border-b border-slate-50">
                    <td className="py-2 pr-3 font-mono text-slate-600">{r.uid}</td>
                    {view === "base" ? (
                      [r.school, r.sno, r.name, r.gender, r.birth, r.grade, r.cls].map((v, i) => <td key={i} className="pr-3">{v}</td>)
                    ) : (
                      <>
                        <td className="pr-3 font-medium">{r.name}</td>
                        <td className="pr-3">{r.sno}</td>
                        <td className="pr-3"><span className={`rounded px-1.5 py-0.5 ${r.status === "已检" ? "bg-success/15 text-success" : "bg-slate-100 text-slate-500"}`}>{r.status}</span></td>
                        {[r.height, r.weight, r.bodyfat, r.visionL, r.visionR, r.waist, r.hip, r.bp, r.atr, r.oral].map((v, i) => (
                          <td key={i} className="pr-3">{v ?? "—"}</td>
                        ))}
                        <td className="pr-3">{r.risk ? <span className={`rounded px-1.5 py-0.5 ${RISK_CLS[r.risk]}`}>{r.risk}</span> : "—"}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
