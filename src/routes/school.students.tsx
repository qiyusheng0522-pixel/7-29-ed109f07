import { createFileRoute, Link } from "@tanstack/react-router";
import { StatusBar } from "@/components/MobileFrame";
import { ActionSheet } from "@/components/ActionSheet";
import { useState } from "react";
import { toast } from "sonner";
import { useSchoolView, MY_CLASS, MY_CLASS_LABEL, MY_TEACHER } from "@/lib/school-role";


import { EIcon } from "@/components/EIcon";
export const Route = createFileRoute("/school/students")({
  component: StudentsPage,
});

type Row = {
  name: string;
  class: string;
  grade: "一年级" | "二年级" | "三年级" | "四年级" | "五年级" | "六年级";
  gender: "男" | "女";
  homeroom: string; // 班主任
  doctor: string;   // 体检医生
  bind: boolean;
  auth: "已授权" | "未授权" | "已放弃";
  quest: boolean;
  exam: "已完成" | "待检" | "缺检" | "-";
  report: "已读" | "未读" | "-";
};

const rows: Row[] = [
  { name: "王小明", class: "2年2班", grade: "二年级", gender: "男", homeroom: "王老师", doctor: "李医生", bind: true, auth: "已授权", quest: true, exam: "已完成", report: "未读" },
  { name: "李小雨", class: "3年3班", grade: "三年级", gender: "女", homeroom: "王老师", doctor: "张医生", bind: true, auth: "已授权", quest: true, exam: "已完成", report: "已读" },
  { name: "赵一鸣", class: "3年3班", grade: "三年级", gender: "男", homeroom: "王老师", doctor: "张医生", bind: true, auth: "已授权", quest: true, exam: "已完成", report: "未读" },
  { name: "陈静雅", class: "3年3班", grade: "三年级", gender: "女", homeroom: "王老师", doctor: "张医生", bind: true, auth: "已授权", quest: false, exam: "已完成", report: "未读" },
  { name: "周子航", class: "3年3班", grade: "三年级", gender: "男", homeroom: "王老师", doctor: "张医生", bind: true, auth: "已授权", quest: true, exam: "缺检", report: "-" },
  { name: "吴梦洁", class: "3年3班", grade: "三年级", gender: "女", homeroom: "王老师", doctor: "张医生", bind: false, auth: "未授权", quest: false, exam: "缺检", report: "-" },
  { name: "孙浩然", class: "3年3班", grade: "三年级", gender: "男", homeroom: "王老师", doctor: "张医生", bind: true, auth: "已授权", quest: false, exam: "待检", report: "-" },

  { name: "张小乐", class: "1年1班", grade: "一年级", gender: "男", homeroom: "赵老师", doctor: "李医生", bind: true, auth: "已授权", quest: false, exam: "待检", report: "-" },
  { name: "陈小美", class: "4年2班", grade: "四年级", gender: "女", homeroom: "孙老师", doctor: "王医生", bind: true, auth: "未授权", quest: false, exam: "待检", report: "-" },
  { name: "刘小强", class: "5年1班", grade: "五年级", gender: "男", homeroom: "周老师", doctor: "张医生", bind: true, auth: "已授权", quest: true, exam: "缺检", report: "-" },
  { name: "赵小欣", class: "2年1班", grade: "二年级", gender: "女", homeroom: "吴老师", doctor: "李医生", bind: false, auth: "未授权", quest: false, exam: "待检", report: "-" },
  { name: "钱小可", class: "6年2班", grade: "六年级", gender: "女", homeroom: "郑老师", doctor: "王医生", bind: true, auth: "已放弃", quest: false, exam: "-", report: "-" },
];

const perspectives = [
  { key: "all", label: "全部视角", desc: "全校 486 名学生" },
  { key: "homeroom", label: "班主任视角", desc: "关注本班授权与问卷完成度" },
  { key: "doctor", label: "体检医生视角", desc: "关注待检/异常/复测名单" },
  { key: "lead", label: "体检负责人视角", desc: "关注全校进度与缺检" },
  { key: "admin", label: "学校管理者视角", desc: "关注整体覆盖率与升级件" },
] as const;

const grades = ["全部年级", "一年级", "二年级", "三年级", "四年级", "五年级", "六年级"] as const;
const classesByGrade: Record<string, string[]> = {
  "一年级": ["1年1班", "1年2班", "1年3班"],
  "二年级": ["2年1班", "2年2班", "2年3班"],
  "三年级": ["3年1班", "3年2班", "3年3班"],
  "四年级": ["4年1班", "4年2班", "4年3班"],
  "五年级": ["5年1班", "5年2班", "5年3班"],
  "六年级": ["6年1班", "6年2班", "6年3班"],
};
const genders = ["全部", "男", "女"] as const;
const statusFilters = ["全部", "未授权", "未问卷", "缺检", "报告未读"] as const;

function StudentsPage() {
  const [view] = useSchoolView();
  const isTeacher = view === "teacher";
  const pv = "all" as (typeof perspectives)[number]["key"];
  const [grade, setGrade] = useState<(typeof grades)[number]>("全部年级");
  const [klass, setKlass] = useState<string>("全部班级");
  const [gender, setGender] = useState<(typeof genders)[number]>("全部");
  const [f, setF] = useState<(typeof statusFilters)[number]>("全部");
  const [q, setQ] = useState("");
  const classOptions = ["全部班级", ...(grade !== "全部年级" ? classesByGrade[grade] ?? [] : Object.values(classesByGrade).flat())];

  // 视角自动带出关注状态
  const perspectiveFilter = (r: Row) => {
    if (pv === "homeroom") return true; // 假设当前登录班主任 → 展示全部（真实场景过滤本班）
    if (pv === "doctor") return r.exam === "待检" || r.exam === "缺检";
    if (pv === "lead") return r.exam === "缺检" || r.auth === "未授权";
    if (pv === "admin") return r.auth === "已放弃" || r.exam === "缺检";
    return true;
  };

  const filtered = rows.filter((r) => {
    // 班主任视角：只看本班学生
    if (isTeacher && r.class !== MY_CLASS) return false;
    if (!perspectiveFilter(r)) return false;
    if (!isTeacher && grade !== "全部年级" && r.grade !== grade) return false;
    if (!isTeacher && klass !== "全部班级" && r.class !== klass) return false;
    if (gender !== "全部" && r.gender !== gender) return false;
    if (q && !r.name.includes(q) && !r.class.includes(q)) return false;
    if (f === "未授权") return r.auth === "未授权";
    if (f === "未问卷") return !r.quest;
    if (f === "缺检") return r.exam === "缺检";
    if (f === "报告未读") return r.report === "未读";
    return true;
  });

  const activePv = perspectives.find((p) => p.key === pv)!;

  return (
    <div>
      <StatusBar title={isTeacher ? "我的班级" : "学生名单"} />
      <div className="px-5 pt-2">
        <h1 className="text-xl font-bold">{isTeacher ? "我的班级学生" : "学生名单"}</h1>
        <p className="mb-3 text-xs text-muted-foreground">
          {isTeacher
            ? `${MY_CLASS_LABEL} · 班主任 ${MY_TEACHER} · 匹配 ${filtered.length} 人`
            : `${activePv.desc} · 匹配 ${filtered.length} 人`}
        </p>


        {/* 一键同步本批次学生清单（仅保健老师） */}
        {!isTeacher && (
        <ActionSheet
          trigger={
            <button className="mb-3 flex w-full items-center justify-between rounded-2xl bg-gradient-to-br from-teal to-deep p-3 text-white shadow-sm">
              <div className="text-left">
                <p className="text-sm font-semibold">{<EIcon e="⚡" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />} 一键同步本批次体检学生清单</p>
                <p className="mt-0.5 text-[11px] opacity-90">从教育局体检批次拉取最新名单</p>
              </div>
              <span>→</span>
            </button>
          }
          title="同步本批次学生清单？"
          description={<>将从"春季常规体检"批次拉取 486 位学生，覆盖 18 个班级。<br />已存在的学生信息将保留，新增学生自动分配班主任与体检医生。</>}
          confirmText="立即同步"
          toastMessage="同步成功 "
          toastDescription="共更新 486 名学生 · 新增 3 名"
        />
        )}



        {/* 搜索 */}
        <div className="mb-3 flex items-center gap-2 rounded-full bg-surface px-4 py-2 shadow-sm ring-1 ring-border/60">
          <span className="text-muted-foreground">{<EIcon e="🔍" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />}</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜索姓名 / 班级"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        {/* 年级 / 班级：班主任视角固定本班，不展示 */}
        {!isTeacher && (
        <>
        <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
          {grades.map((g) => (
            <button
              key={g}
              onClick={() => { setGrade(g); setKlass("全部班级"); }}
              className={`shrink-0 rounded-full px-3 py-1 text-[11px] ${
                grade === g ? "bg-teal text-teal-foreground" : "bg-surface ring-1 ring-border/60 text-muted-foreground"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
        <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
          {classOptions.map((c) => (
            <button
              key={c}
              onClick={() => setKlass(c)}
              className={`shrink-0 rounded-full px-3 py-1 text-[11px] ${
                klass === c ? "bg-deep text-white" : "bg-surface ring-1 ring-border/60 text-muted-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        </>
        )}

        <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
          {genders.map((g) => (
            <button
              key={g}
              onClick={() => setGender(g)}
              className={`shrink-0 rounded-full px-3 py-1 text-[11px] ${
                gender === g ? "bg-warm text-warm-foreground" : "bg-surface-2 text-muted-foreground"
              }`}
            >
              {g === "全部" ? "全部性别" : g}
            </button>
          ))}
        </div>
        <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
          {statusFilters.map((k) => (
            <button
              key={k}
              onClick={() => setF(k)}
              className={`shrink-0 rounded-full px-3 py-1 text-[11px] ${
                f === k ? "bg-foreground text-background" : "bg-surface-2 text-muted-foreground"
              }`}
            >
              {k}
            </button>
          ))}
        </div>
      </div>

      <ul className="space-y-2 px-5 pb-8">
        {filtered.map((r) => (
          <li key={r.name}>
            <Link
              to="/school/student/$id"
              params={{ id: r.name }}
              onClick={() => toast.success(`查看 ${r.name} 的体检数据`)}
              className="block rounded-2xl bg-surface p-3 shadow-sm ring-1 ring-border/60 active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-teal/15 text-lg">
                  {r.gender === "男" ? "" : ""}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold">{r.name}</p>
                    <span className="text-[10px] text-muted-foreground">{r.class} · {r.gender}</span>
                  </div>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    班主任 {r.homeroom} · 体检医生 {r.doctor}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    <Chip ok={r.bind} okText="已绑定" noText="未绑定" />
                    <Chip
                      ok={r.auth === "已授权"}
                      okText="已授权"
                      noText={r.auth}
                      variant={r.auth === "已放弃" ? "muted" : "warn"}
                    />
                    <Chip ok={r.quest} okText="问卷" noText="待问卷" />
                    <Chip
                      ok={r.exam === "已完成"}
                      okText="已检"
                      noText={r.exam === "缺检" ? "缺检" : r.exam === "-" ? "无" : "待检"}
                      variant={r.exam === "缺检" ? "danger" : "warn"}
                    />
                  </div>
                </div>
                <span className="text-muted-foreground">›</span>
              </div>
            </Link>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="rounded-2xl bg-surface p-8 text-center text-sm text-muted-foreground shadow-sm ring-1 ring-border/60">
            没有匹配的学生
          </li>
        )}
      </ul>
    </div>
  );
}

function Chip({
  ok,
  okText,
  noText,
  variant = "warn",
}: {
  ok: boolean;
  okText: string;
  noText: string;
  variant?: "warn" | "danger" | "muted";
}) {
  if (ok) {
    return <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] text-success">{<EIcon e="✓" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />} {okText}</span>;
  }
  const cls =
    variant === "danger"
      ? "bg-danger/15 text-danger"
      : variant === "muted"
      ? "bg-muted text-muted-foreground"
      : "bg-warning/25 text-warning-foreground";
  return <span className={`rounded-full px-2 py-0.5 text-[10px] ${cls}`}>{noText}</span>;
}
