import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";

// 后台唯一入口：仅支持通过数据导入学生基本信息
export const IMPORT_FIELDS = ["学校", "学号", "姓名", "性别", "出生日期", "年级", "班级"] as const;

type Base = { school: string; sno: string; name: string; gender: string; birth: string; grade: string; cls: string };

// 体检数据回显字段：与历史儿童入学体检数据表字段保持一致
type Exam = {
  status: "已检" | "待检";
  age?: number;
  height?: number; weight?: number; bmi?: number;
  bpS?: number; bpD?: number; bpDiff?: number;
  conjunctiva?: string; cornea?: string; lens?: string; pupil?: string; eyePos?: string; eyeMove?: string;
  abnormalVision?: string; glasses?: string;
  visionR?: number; visionL?: number; visionRG?: string; visionLG?: string;
  sphereR?: string; cylR?: string; axisR?: string; sphereL?: string; cylL?: string; axisL?: string;
  impression?: string; corneaCurve?: string; axisLen?: string; colorVision?: string;
  dentition?: string; periodontal?: string;
  d?: number; D?: number; m?: number; M?: number; f?: number; F?: number; dmft?: number;
  skin?: string; lymph?: string; head?: string; neck?: string; spine?: string; limbs?: string; chest?: string;
  symptoms?: string; heartRate?: number; murmur?: string; rhythm?: string; lungRales?: string; liver?: string; spleen?: string;
  risk?: string;
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
  const lines = text.replace(/^﻿/, "").split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
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

// 原型：模拟体检完成后的数据回流，字段对齐历史入学体检数据表
function mockExam(i: number, birth: string): Exam {
  if (i % 3 === 2) return { status: "待检" };
  const age = 2026 - Number(birth.slice(0, 4));
  const h = 128 + ((i * 7) % 14), w = 26 + ((i * 5) % 12);
  const bpS = i === 0 ? 132 : 100 + ((i * 3) % 14), bpD = 62 + (i % 10);
  const d = i % 2 ? 2 : 0, D = i === 4 ? 1 : 0, m = 0, M = 0, f = i % 2 ? 1 : 0, F = 0;
  return {
    status: "已检", age,
    height: h, weight: w, bmi: +(w / ((h / 100) ** 2)).toFixed(1),
    bpS, bpD, bpDiff: bpS - bpD,
    conjunctiva: "正常", cornea: "透明", lens: "透明", pupil: "等大等圆", eyePos: "正位", eyeMove: "正常",
    abnormalVision: i === 1 ? "眯眼视物" : "无", glasses: i === 1 ? "框架眼镜" : "未戴镜",
    visionR: 5.0 + (i % 2) / 10, visionL: i === 1 ? 4.7 : 5.0,
    visionRG: i === 1 ? "5.0" : "—", visionLG: i === 1 ? "5.0" : "—",
    sphereR: i === 1 ? "-1.00" : "0.00", cylR: "0.00", axisR: "—",
    sphereL: i === 1 ? "-1.50" : "0.00", cylL: i === 1 ? "-0.50" : "0.00", axisL: i === 1 ? "180" : "—",
    impression: i === 1 ? "屈光不正（近视）" : "未见明显异常",
    corneaCurve: "7.8mm", axisLen: "23.1mm", colorVision: "正常",
    dentition: "整齐", periodontal: "正常",
    d, D, m, M, f, F, dmft: d + D + m + M + f + F,
    skin: "正常", lymph: "未触及肿大", head: "正常", neck: "正常",
    spine: i === 3 ? "侧弯可疑 ATR 8°" : "正常", limbs: "正常", chest: "正常",
    symptoms: i === 0 ? "近期晨起头晕" : "无",
    heartRate: 82 + (i % 12), murmur: "无", rhythm: "齐", lungRales: "无", liver: "未触及", spleen: "未触及",
    risk: i === 0 ? "红色" : i === 1 || i === 3 ? "橙色" : i % 2 ? "蓝色" : "绿色",
  };
}

const RISK_CLS: Record<string, string> = {
  绿色: "bg-success/15 text-success", 蓝色: "bg-teal/15 text-teal", 黄色: "bg-warning/15 text-warning",
  橙色: "bg-warm/20 text-warm", 红色: "bg-danger/15 text-danger",
};

// 回显列：与历史儿童入学体检数据表字段顺序完全一致
type Col = { label: string; key: keyof Exam; group: string };
const EXAM_COLS: Col[] = [
  { label: "年龄", key: "age", group: "基本信息" },
  { label: "身高", key: "height", group: "一般检查" }, { label: "体重", key: "weight", group: "一般检查" }, { label: "BMI", key: "bmi", group: "一般检查" },
  { label: "收缩压", key: "bpS", group: "一般检查" }, { label: "舒张压", key: "bpD", group: "一般检查" }, { label: "压差", key: "bpDiff", group: "一般检查" },
  { label: "结膜", key: "conjunctiva", group: "眼科" }, { label: "角膜", key: "cornea", group: "眼科" }, { label: "晶体", key: "lens", group: "眼科" },
  { label: "瞳孔", key: "pupil", group: "眼科" }, { label: "眼位", key: "eyePos", group: "眼科" }, { label: "眼球运动", key: "eyeMove", group: "眼科" },
  { label: "异常视觉行为", key: "abnormalVision", group: "眼科" }, { label: "戴镜情况", key: "glasses", group: "眼科" },
  { label: "裸眼视力（右）", key: "visionR", group: "眼科" }, { label: "裸眼视力（左）", key: "visionL", group: "眼科" },
  { label: "右眼戴镜视力", key: "visionRG", group: "眼科" }, { label: "左眼戴镜视力", key: "visionLG", group: "眼科" },
  { label: "右眼球镜", key: "sphereR", group: "眼科" }, { label: "右眼柱镜", key: "cylR", group: "眼科" }, { label: "右眼轴向值", key: "axisR", group: "眼科" },
  { label: "左眼球镜", key: "sphereL", group: "眼科" }, { label: "左眼柱镜", key: "cylL", group: "眼科" }, { label: "左眼轴向值", key: "axisL", group: "眼科" },
  { label: "临床印象", key: "impression", group: "眼科" }, { label: "角膜曲率半径", key: "corneaCurve", group: "眼科" },
  { label: "眼轴长度", key: "axisLen", group: "眼科" }, { label: "色觉", key: "colorVision", group: "眼科" },
  { label: "齿列", key: "dentition", group: "口腔" }, { label: "牙周", key: "periodontal", group: "口腔" },
  { label: "乳龋患（d）", key: "d", group: "口腔" }, { label: "恒龋患（D）", key: "D", group: "口腔" },
  { label: "乳龋失（m）", key: "m", group: "口腔" }, { label: "恒龋失（M）", key: "M", group: "口腔" },
  { label: "乳龋补（f）", key: "f", group: "口腔" }, { label: "恒龋补（F）", key: "F", group: "口腔" },
  { label: "龋失补总齿数", key: "dmft", group: "口腔" },
  { label: "皮肤", key: "skin", group: "内外科" }, { label: "淋巴结", key: "lymph", group: "内外科" }, { label: "头部", key: "head", group: "内外科" },
  { label: "颈部", key: "neck", group: "内外科" }, { label: "脊柱", key: "spine", group: "内外科" }, { label: "四肢", key: "limbs", group: "内外科" },
  { label: "胸部", key: "chest", group: "内外科" }, { label: "近期不适症状", key: "symptoms", group: "内外科" },
  { label: "心率", key: "heartRate", group: "内外科" }, { label: "心脏杂音", key: "murmur", group: "内外科" }, { label: "心律", key: "rhythm", group: "内外科" },
  { label: "肺部罗音", key: "lungRales", group: "内外科" }, { label: "肝", key: "liver", group: "内外科" }, { label: "脾", key: "spleen", group: "内外科" },
];
const GROUPS = ["基本信息", "一般检查", "眼科", "口腔", "内外科"];
const GROUP_CLS: Record<string, string> = {
  基本信息: "bg-slate-100 text-slate-600", 一般检查: "bg-teal/10 text-teal", 眼科: "bg-blue-50 text-blue-600",
  口腔: "bg-amber-50 text-amber-600", 内外科: "bg-emerald-50 text-emerald-600",
};

export function AdminStudentImport() {
  // 预置示例数据，便于直接预览回显效果
  const [rows, setRows] = useState<StudentRow[]>(() => {
    const used = new Set<string>();
    return parseCsv(SAMPLE_CSV).map((b, i) => ({ ...b, uid: genUid(b, used), ...mockExam(i, b.birth) }));
  });
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
        added.push({ ...b, uid: genUid(b, used), ...mockExam(rows.length + added.length, b.birth) });
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
    const blob = new Blob(["﻿" + IMPORT_FIELDS.join(",") + "\n"], { type: "text/csv" });
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
        ) : view === "base" ? (
          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap text-xs">
              <thead className="text-slate-500">
                <tr className="border-b border-slate-100 text-left">
                  <th className="py-2 pr-3 font-normal">唯一标识编码</th>
                  {IMPORT_FIELDS.map((f) => <th key={f} className="pr-3 font-normal">{f}</th>)}
                </tr>
              </thead>
              <tbody>
                {shown.map((r) => (
                  <tr key={r.uid} className="border-b border-slate-50">
                    <td className="py-2 pr-3 font-mono text-slate-600">{r.uid}</td>
                    {[r.school, r.sno, r.name, r.gender, r.birth, r.grade, r.cls].map((v, i) => <td key={i} className="pr-3">{v}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div>
            <p className="mb-2 text-[11px] text-slate-400">字段与历史儿童入学体检数据表一致，共 {EXAM_COLS.length + 7} 列；左侧学生信息冻结，横向滚动查看全部指标。</p>
            <div className="max-h-[560px] overflow-auto rounded-lg border border-slate-200">
              <table className="border-collapse whitespace-nowrap text-xs">
                <thead className="sticky top-0 z-10">
                  <tr className="text-left">
                    <th rowSpan={2} className="sticky left-0 z-20 border-b border-r border-slate-200 bg-slate-100 px-3 py-2 font-medium text-slate-600">学生编码</th>
                    <th rowSpan={2} className="sticky left-[150px] z-20 border-b border-r border-slate-200 bg-slate-100 px-3 py-2 font-medium text-slate-600">学生姓名</th>
                    <th rowSpan={2} className="border-b border-r border-slate-200 bg-slate-100 px-3 py-2 font-medium text-slate-600">学生性别</th>
                    <th rowSpan={2} className="border-b border-r border-slate-200 bg-slate-100 px-3 py-2 font-medium text-slate-600">出生日期</th>
                    <th rowSpan={2} className="border-b border-r border-slate-200 bg-slate-100 px-3 py-2 font-medium text-slate-600">年级名称</th>
                    <th rowSpan={2} className="border-b border-r border-slate-200 bg-slate-100 px-3 py-2 font-medium text-slate-600">班级名称</th>
                    <th rowSpan={2} className="border-b border-r border-slate-200 bg-slate-100 px-3 py-2 font-medium text-slate-600">体检状态</th>
                    {GROUPS.map((g) => (
                      <th key={g} colSpan={EXAM_COLS.filter((c) => c.group === g).length} className={`border-b border-r border-slate-200 px-3 py-1.5 text-center font-medium ${GROUP_CLS[g]}`}>{g}</th>
                    ))}
                    <th rowSpan={2} className="border-b border-slate-200 bg-slate-100 px-3 py-2 font-medium text-slate-600">风险等级</th>
                  </tr>
                  <tr className="text-left text-slate-500">
                    {EXAM_COLS.map((c) => (
                      <th key={c.label} className={`border-b border-r border-slate-200 px-3 py-1.5 font-normal ${GROUP_CLS[c.group]}`}>{c.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {shown.map((r) => (
                    <tr key={r.uid} className="hover:bg-slate-50">
                      <td className="sticky left-0 border-r border-slate-100 bg-white px-3 py-2 font-mono text-slate-600">{r.uid}</td>
                      <td className="sticky left-[150px] border-r border-slate-100 bg-white px-3 py-2 font-medium">{r.name}</td>
                      <td className="border-r border-slate-100 px-3 py-2">{r.gender}</td>
                      <td className="border-r border-slate-100 px-3 py-2">{r.birth}</td>
                      <td className="border-r border-slate-100 px-3 py-2">{r.grade}</td>
                      <td className="border-r border-slate-100 px-3 py-2">{r.cls}</td>
                      <td className="border-r border-slate-100 px-3 py-2">
                        <span className={`rounded px-1.5 py-0.5 ${r.status === "已检" ? "bg-success/15 text-success" : "bg-slate-100 text-slate-500"}`}>{r.status}</span>
                      </td>
                      {EXAM_COLS.map((c) => <td key={c.label} className="border-r border-slate-100 px-3 py-2">{r.status === "已检" ? (r[c.key] ?? "—") : "—"}</td>)}
                      <td className="px-3 py-2">{r.risk ? <span className={`rounded px-1.5 py-0.5 ${RISK_CLS[r.risk]}`}>{r.risk}</span> : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
