import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { child, reviewPlan } from "@/lib/mock-data";
import { StatusBar } from "@/components/MobileFrame";
import { ActionSheet } from "@/components/ActionSheet";
import child3d from "@/assets/child-3d.png";

import { EIcon } from "@/components/EIcon";
export const Route = createFileRoute("/parent/report")({
  component: ReportPage,
});


const trend = [125, 126, 126.5, 127, 127.5, 128];
const weightTrend = [25.8, 26.2, 26.5, 26.9, 27.2, 27.5];

type Level = "ok" | "warn" | "bad";
type Item = { name: string; value: string; ref: string; level: Level; refSource?: string; recDept?: string; recDoctor?: string };
type Section = { title: string; items: Item[] };


const REF_SRC = "南京市儿童医院 · 2024版学龄儿童参考区间";

const sections: Section[] = [
  {
    title: "体格发育",
    items: [
      { name: "身高", value: "138 cm", ref: "P75", level: "ok", refSource: REF_SRC },
      { name: "体重", value: "32.5 kg", ref: "P85 · 偏重", level: "bad", refSource: REF_SRC, recDept: "儿童保健科", recDoctor: "王丽 主任医师" },
      { name: "BMI", value: "17.1", ref: "14.5–16.8", level: "bad", refSource: REF_SRC, recDept: "营养科", recDoctor: "陈静 副主任医师" },
      { name: "腰围", value: "62 cm", ref: "≤ 64 cm", level: "ok", refSource: REF_SRC },
    ],
  },
  {
    title: "视力与眼健康",
    items: [
      { name: "裸眼视力 (左)", value: "5.0", ref: "≥ 5.0", level: "ok", refSource: REF_SRC },
      { name: "裸眼视力 (右)", value: "5.0", ref: "≥ 5.0", level: "ok", refSource: REF_SRC },
      { name: "屈光度 (左)", value: "+0.25D", ref: "±0.50D", level: "ok", refSource: REF_SRC },
      { name: "眼位", value: "正位", ref: "正位", level: "ok", refSource: REF_SRC },
    ],
  },
  {
    title: "口腔",
    items: [
      { name: "龋齿", value: "0 颗", ref: "0 颗", level: "ok", refSource: REF_SRC },
      { name: "牙列", value: "整齐", ref: "整齐", level: "ok", refSource: REF_SRC },
    ],
  },
  {
    title: "内科",
    items: [
      { name: "血压", value: "102/66 mmHg", ref: "< 120/80", level: "ok", refSource: REF_SRC },
      { name: "心率", value: "88 bpm", ref: "70–110", level: "ok", refSource: REF_SRC },
      { name: "肺部听诊", value: "呼吸音清", ref: "正常", level: "ok", refSource: REF_SRC },
    ],
  },
  {
    title: "过敏与呼吸",
    items: [
      { name: "过敏原-尘螨", value: "阳性 (++)", ref: "阴性", level: "bad", refSource: REF_SRC, recDept: "过敏反应科", recDoctor: "刘敏 主任医师" },
      { name: "肺功能 FEV1", value: "98%", ref: "≥ 80%", level: "ok", refSource: REF_SRC },
      { name: "运动后咳嗽", value: "偶发", ref: "无", level: "warn", refSource: REF_SRC, recDept: "呼吸科", recDoctor: "张伟 副主任医师" },
    ],
  },
];


type ArchiveKind = "exam" | "review" | "hospital";
type ArchiveEntry = { date: string; kind: ArchiveKind; tags: string[]; note?: string };
type ArchiveYear = { year: string; entries: ArchiveEntry[] };

const archives: ArchiveYear[] = [
  {
    year: "26年",
    entries: [
      { date: "9月18日", kind: "exam", tags: ["校内体检", "新生入校备案"], note: "身高 138 · BMI 17.1 · 视力 4.9/4.8" },
      { date: "6月05日", kind: "review", tags: ["复查·眼科"], note: "屈光度 -0.75D，建议 3 月后复查" },
      { date: "3月22日", kind: "hospital", tags: ["医院·呼吸科"], note: "运动后咳嗽评估，肺功能正常" },
    ],
  },
  {
    year: "25年",
    entries: [
      { date: "9月18日", kind: "exam", tags: ["校内体检"], note: "BMI 16.8 · 视力 5.0/4.9" },
      { date: "3月18日", kind: "review", tags: ["复查·体重"], note: "BMI 16.5，建议加强营养" },
    ],
  },
  {
    year: "24年",
    entries: [
      { date: "9月10日", kind: "exam", tags: ["校内体检"], note: "首次入校体检，各项正常" },
      { date: "4月02日", kind: "hospital", tags: ["医院·过敏原筛查"], note: "尘螨阳性 (++)" },
    ],
  },
];

const kindStyle: Record<ArchiveKind, { dot: string; badge: string; label: string }> = {
  exam: { dot: "bg-teal", badge: "bg-teal text-teal-foreground", label: "体检" },
  review: { dot: "bg-warm", badge: "bg-warm text-warm-foreground", label: "复查" },
  hospital: { dot: "bg-deep", badge: "bg-deep text-deep-foreground", label: "就诊" },
};

const dot: Record<Level, string> = {
  ok: "bg-success",
  warn: "bg-warning",
  bad: "bg-danger",
};

const valueColor: Record<Level, string> = {
  ok: "text-foreground",
  warn: "text-warning-foreground",
  bad: "text-danger",
};

const nextSteps = [
  {
    to: "/parent/comm",
    search: { topic: "ai-report", from: "report" },
    icon: "🤖",
    title: "先让 AI 解读报告",
    desc: "用大白话说清 3 项异常的原因与轻重，1 分钟看懂",
    tag: "1 分钟",
    tagClass: "bg-teal/15 text-teal",
  },
  {
    to: "/parent/comm",
    search: { mode: "doctors", from: "report" },
    icon: "👨‍⚕️",
    title: "就异常项咨询医生",
    desc: "按异常项推荐对应科室医生，自主选择并在线预约挂号",
    tag: "推荐",
    tagClass: "bg-warm/15 text-warm",
  },
  {
    to: "/parent/health-plan",
    search: { from: "report" },
    icon: "📋",
    title: "生成专属健康方案",
    desc: "自选 3 / 5 / 7 周干预周期，获取饮食·运动·复查计划",
    tag: "自定义周期",
    tagClass: "bg-rose/15 text-rose",
  },
] as const;

function ReportPage() {
  return (
    <div>
      <StatusBar title="体检报告" />
      <div className="px-5 pb-10 pt-2">
        <header className="mb-4">
          <h1 className="text-xl font-bold">{child.name} 的体检报告</h1>
          <p className="text-xs text-muted-foreground">
            体检日期 {child.lastExam} · 阳光小学 · 三年级 3 班
          </p>
        </header>

        {/* 3D 虚拟儿童形象 + 问题标注 */}
        <section className="mb-3 overflow-hidden rounded-3xl bg-gradient-to-br from-warning/20 via-warm/10 to-rose/15 p-4 ring-1 ring-warning/30">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-warning/40 text-sm">{<EIcon e="🟡" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />}</span>
              <div>
                <p className="text-[10px] leading-none text-muted-foreground">整体风险等级</p>
                <p className="text-sm font-bold text-warning-foreground">{child.riskLevel} · 需关注 3 项</p>
              </div>
            </div>
            <span className="text-[11px] text-muted-foreground">8 岁 · 男 · 138cm / 32.5kg</span>
          </div>

          <div className="relative mx-auto h-[340px] w-full">
            {/* 风险光晕 - 融入 3D 形象 */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[280px] w-[220px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-warning/25 blur-2xl" />
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[240px] w-[180px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-warm/20 blur-xl" />

            {/* 中央 3D 形象 */}
            <img
              src={child3d}
              alt="虚拟形象"
              width={768}
              height={1024}
              loading="lazy"
              className="absolute left-1/2 top-0 h-full w-auto -translate-x-1/2 object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.12)]"
            />

            {/* 头顶风险徽章 */}
            <div className="absolute left-1/2 top-1 -translate-x-1/2">
              <span className="rounded-full bg-warning px-3 py-1 text-[11px] font-bold text-warning-foreground shadow-md ring-2 ring-white">
                 {child.riskLevel}风险
              </span>
            </div>

            {/* 左侧标注：视力 / 呼吸 */}
            <div className="absolute left-0 top-16 max-w-[38%]">
              <div className="rounded-xl bg-success/10 px-2 py-1.5 text-[10px] leading-tight ring-1 ring-success/30 backdrop-blur">
                <p className="font-semibold text-success">{<EIcon e="👁" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />} 视力正常</p>
                <p className="text-foreground/70">5.0 / 5.0</p>
              </div>
              <div className="ml-auto mt-0.5 h-px w-10 bg-success/50" />
            </div>
            <div className="absolute left-0 top-[42%] max-w-[42%]">
              <div className="rounded-xl bg-warning/15 px-2 py-1.5 text-[10px] leading-tight ring-1 ring-warning/40 backdrop-blur">
                <p className="font-semibold text-warning-foreground">{<EIcon e="🫁" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />} 运动后咳嗽</p>
                <p className="text-foreground/70">偶发 · 需关注</p>
              </div>
              <div className="ml-auto mt-0.5 h-px w-8 bg-warning/60" />
            </div>

            {/* 右侧标注：过敏 / 体重 / 口腔 */}
            <div className="absolute right-0 top-14 max-w-[38%]">
              <div className="rounded-xl bg-rose/10 px-2 py-1.5 text-[10px] leading-tight ring-1 ring-rose/30 backdrop-blur">
                <p className="font-semibold text-rose">{<EIcon e="🌿" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />} 尘螨过敏 ++</p>
                <p className="text-foreground/70">需家庭除螨</p>
              </div>
              <div className="mt-0.5 h-px w-10 bg-rose/50" />
            </div>
            <div className="absolute right-0 top-[34%] max-w-[42%]">
              <div className="rounded-xl bg-warm/15 px-2 py-1.5 text-[10px] leading-tight ring-1 ring-warm/40 backdrop-blur">
                <p className="font-semibold text-warm">{<EIcon e="⚖️" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />} 体重偏高</p>
                <p className="text-foreground/70">BMI 17.1 · P85</p>
              </div>
              <div className="mt-0.5 h-px w-8 bg-warm/60" />
            </div>
            <div className="absolute right-0 top-[60%] max-w-[38%]">
              <div className="rounded-xl bg-success/10 px-2 py-1.5 text-[10px] leading-tight ring-1 ring-success/30 backdrop-blur">
                <p className="font-semibold text-success">{<EIcon e="🦷" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />} 口腔健康</p>
                <p className="text-foreground/70">无龋齿</p>
              </div>
              <div className="mt-0.5 h-px w-10 bg-success/50" />
            </div>
          </div>
        </section>



        {/* 参考值来源说明 */}
        <div className="mb-3 flex items-center gap-2 rounded-2xl bg-surface px-3 py-2 text-[11px] text-muted-foreground ring-1 ring-border/60">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-teal/15 text-[12px]">{<EIcon e="🏥" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />}</span>
          <p>
            本报告所有指标 <b className="text-foreground">参考值来源：南京市儿童医院体检中心</b>（2024 版学龄儿童参考区间）
          </p>
        </div>


        {/* Summary card */}
        <details className="group mb-3 overflow-hidden rounded-3xl bg-gradient-to-br from-warning/25 to-warm/15 ring-1 ring-warning/30">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 p-4">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-warning/40 text-base">{<EIcon e="🤖" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />}</span>
              <div>
                <p className="text-[11px] text-warning-foreground/80">AI 解读与就诊建议</p>
                <p className="text-sm font-bold text-warning-foreground">展开查看详情</p>
              </div>
            </div>
            <span className="text-xs text-muted-foreground transition group-open:rotate-180">▾</span>
          </summary>
          <div className="px-4 pb-4">
            <div className="space-y-2 rounded-2xl bg-surface/70 p-3 backdrop-blur">
              <p className="text-[11px] font-semibold text-warm">{<EIcon e="🤖" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />} AI 解读</p>
              <ul className="space-y-1.5 text-xs leading-relaxed text-foreground/85">
                <li>• <b>体重/BMI 偏高（肥胖倾向）</b>：控糖减重，每周 3 次中等强度运动 30 分钟。</li>
                <li>• <b>尘螨过敏 (++) · 运动后偶发咳嗽</b>：警惕哮喘倾向，做好家庭除螨与运动前热身。</li>
                <li>• 其他项目均在正常范围，继续保持。</li>
              </ul>
            </div>

            {/* 需就诊事项 · 快速预约 */}
            <div className="mt-3 space-y-2">
              <p className="text-[11px] font-semibold text-danger">{<EIcon e="⚠️" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />} 建议尽快就诊</p>
              {[
                { dept: "儿童保健科", reason: "体重管理评估与营养指导", hospital: "市儿童医院" },
                { dept: "呼吸/过敏科", reason: "尘螨过敏 + 运动后咳嗽评估", hospital: "市儿童医院" },
              ].map((v) => (
                <div
                  key={v.dept}
                  className="flex items-center justify-between rounded-2xl bg-surface p-3 shadow-sm ring-1 ring-danger/20"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">
                      {v.dept}
                      <span className="ml-2 text-[11px] font-normal text-muted-foreground">
                        {v.hospital}
                      </span>
                    </p>
                    <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                      {v.reason}
                    </p>
                  </div>
                  <ActionSheet
                    trigger={
                      <button className="shrink-0 rounded-full bg-danger px-3 py-1.5 text-[11px] font-semibold text-danger-foreground">
                        预约挂号
                      </button>
                    }
                    title={`预约 ${v.dept}`}
                    description={`${v.hospital} · ${v.reason}。确认后将为您匹配最近号源并短信通知。`}
                    confirmText="确认预约"
                    toastMessage="挂号申请已提交"
                    toastDescription={`${v.hospital} ${v.dept} · 号源确认后短信通知`}
                  />
                </div>
              ))}
            </div>
          </div>
        </details>




        {/* Detailed sections - 各项体检明细，每项风琴，默认收起 */}
        <p className="mb-2 mt-1 px-1 text-[11px] text-muted-foreground">各项体检明细 · 点击展开</p>
        <div className="mb-3 space-y-2">
          {sections.map((s) => {
            const abnormal = s.items.filter((it) => it.level !== "ok").length;
            const hasAb = abnormal > 0;
            return (
              <details
                key={s.title}
                open={hasAb}
                className="group rounded-2xl bg-surface shadow-sm ring-1 ring-border/60 open:ring-teal/30"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4">
                  <div className="flex items-center gap-2">
                    <span className="h-4 w-1 rounded-full bg-teal" />
                    <span className="text-sm font-semibold">{s.title}</span>
                    <span className="text-[11px] text-muted-foreground">
                      共 {s.items.length} 项
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {hasAb ? (
                      <span className="rounded-full bg-danger/10 px-2 py-0.5 text-[11px] font-medium text-danger">
                        异常 {abnormal} 项
                      </span>
                    ) : (
                      <span className="rounded-full bg-success/10 px-2 py-0.5 text-[11px] text-success">
                        全部正常
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground transition group-open:rotate-180">
                      ▾
                    </span>
                  </div>
                </summary>
                <ul className="divide-y divide-border/60 px-4 pb-3">
                  {s.items.map((it) => (
                    <li key={it.name} className="py-2.5">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-full ${dot[it.level]}`} />
                          <span className="text-sm">{it.name}</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className={`text-sm font-semibold ${valueColor[it.level]}`}>
                            {it.value}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            参考 {it.ref}
                          </span>
                        </div>
                      </div>
                      <div className="mt-1 flex items-center gap-1 pl-4 text-[10px] text-muted-foreground">
                        <span className="grid h-3 w-3 place-items-center rounded-full bg-teal/15 text-[8px]">{<EIcon e="🏥" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />}</span>
                        <span>参考值来源：{it.refSource ?? REF_SRC}</span>
                      </div>
                      {it.level !== "ok" && it.recDept && (
                        <div className="mt-1.5 ml-4 flex items-center justify-between gap-2 rounded-xl bg-danger/5 px-2.5 py-1.5 ring-1 ring-danger/20">
                          <div className="min-w-0 text-[11px]">
                            <span className="font-semibold text-danger">推荐医生 · {it.recDept}</span>
                            <span className="ml-1 text-foreground/70">{it.recDoctor}</span>
                          </div>
                          <Link
                            to="/parent/comm"
                            search={{ topic: it.name, dept: it.recDept, doctor: it.recDoctor, from: "report" }}
                            className="shrink-0 rounded-full bg-danger px-2.5 py-1 text-[10px] font-semibold text-danger-foreground"
                          >
                            立即咨询
                          </Link>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>

              </details>
            );
          })}
        </div>










        {/* Trend */}
        <details className="group mb-3 rounded-2xl bg-surface shadow-sm ring-1 ring-border/60">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4">
            <span className="text-sm font-semibold">近期身体趋势（近 6 次）</span>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-teal/10 px-2 py-0.5 text-[10px] text-teal">AI 解读</span>
              <span className="text-xs text-muted-foreground transition group-open:rotate-180">▾</span>
            </div>
          </summary>
          <div className="px-4 pb-4">
            <div className="grid grid-cols-2 gap-3">
              <MiniChart label="身高 cm" data={trend} color="teal" />
              <MiniChart label="体重 kg" data={weightTrend} color="warm" />
            </div>
            <ul className="mt-3 space-y-2 text-[11px] leading-relaxed">
              <li className="rounded-xl bg-teal/10 p-2.5 ring-1 ring-teal/20">
                <p className="font-semibold text-teal">{<EIcon e="📈" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />} 身高：138 cm · 半年增长 3 cm</p>
                <p className="mt-0.5 text-foreground/80">
                  增速处于 P75 参考区间，符合学龄期正常发育曲线。
                </p>
              </li>
              <li className="rounded-xl bg-warm/10 p-2.5 ring-1 ring-warm/25">
                <p className="font-semibold text-warm">{<EIcon e="⚠️" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />} 体重：27.5 kg → 32.5 kg · 半年增长 5 kg</p>
                <p className="mt-0.5 text-foreground/80">
                  增速偏快，BMI 由 16.5 上升至 17.1，已高于同龄参考上限，建议控制增速。
                </p>
              </li>
              <li className="rounded-xl bg-surface-2 p-2.5 ring-1 ring-border/60">
                <p className="font-semibold">{<EIcon e="💡" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />} 综合结论</p>
                <p className="mt-0.5 text-foreground/80">
                  身高稳步增长但体重增速超身高增速，呈"体重追赶型"趋势，建议减少高糖零食、增加户外活动，3 个月后复评。
                </p>
              </li>
            </ul>
          </div>
        </details>


        {/* Review plan */}
        <details className="group mb-3 rounded-2xl bg-surface shadow-sm ring-1 ring-border/60">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4">
            <span className="text-sm font-semibold">复评计划</span>
            <span className="text-xs text-muted-foreground transition group-open:rotate-180">▾</span>
          </summary>
          <div className="px-4 pb-4">
            <ol className="relative space-y-4 border-l-2 border-dashed border-teal/40 pl-4">
              {reviewPlan.map((r, i) => (
                <li key={r.type} className="relative">
                  <span
                    className={`absolute -left-[22px] top-1 grid h-4 w-4 place-items-center rounded-full text-[10px] ring-2 ring-surface ${
                      i === 0 ? "bg-warm text-warm-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <p className="text-sm font-medium">{r.type}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {r.when} · {r.date}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </details>

        {/* Report archive */}
        <details className="group mb-3 rounded-2xl bg-surface shadow-sm ring-1 ring-border/60">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4">
            <span className="text-sm font-semibold">报告档案</span>
            <div className="flex items-center gap-2">
              <ActionSheet
                trigger={<button onClick={(e) => e.stopPropagation()} className="text-xs font-medium text-teal">+ 添加</button>}
                title="上传报告到档案"
                description="支持医院复查报告、既往体检单，上传后同步至学校健康档案。"
                confirmText="上传"
                toastMessage="报告已上传"
                toastDescription="已同步至学校健康档案"
              >
                <div className="space-y-2 text-xs">
                  <label className="block">
                    <span className="text-muted-foreground">报告类型</span>
                    <select className="mt-1 w-full rounded-xl bg-surface-2 px-3 py-2 outline-none">
                      <option>医院复查报告</option><option>既往体检单</option><option>就诊记录</option>
                    </select>
                  </label>
                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-border py-6 text-muted-foreground">
                    <EIcon e="📷" /> 点击拍照或从相册选择
                    <input type="file" accept="image/*" className="hidden" />
                  </label>
                </div>
              </ActionSheet>
              <span className="text-xs text-muted-foreground transition group-open:rotate-180">▾</span>
            </div>
          </summary>
          <div className="px-4 pb-4">
            <p className="mb-3 text-[11px] text-muted-foreground">
              可上传医院复查报告、既往体检单，同步至学校健康档案
            </p>
            <div className="space-y-5">
              {archives.map((a) => (
                <div key={a.year}>
                  <p className="mb-2 text-base font-bold">{a.year}</p>
                  <ol className="relative space-y-4 border-l-2 border-dashed border-teal/40 pl-4">
                    {a.entries.map((e) => {
                      const k = kindStyle[e.kind];
                      return (
                        <li key={e.date} className="relative">
                          <span
                            className={`absolute -left-[22px] top-1 h-2.5 w-2.5 rounded-full ring-2 ring-surface ${k.dot}`}
                          />
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-medium text-muted-foreground">{e.date}</p>
                            <span className={`rounded-full px-2 py-0.5 text-[10px] ${k.badge}`}>
                              {k.label}
                            </span>
                          </div>
                          {e.note && (
                            <p className="mt-1 text-xs leading-relaxed text-foreground/80">
                              {e.note}
                            </p>
                          )}
                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                            {e.tags.map((t) => (
                              <button
                                key={t}
                                onClick={() => toast(`${e.date} · ${t}`, { description: e.note ?? "查看该次记录详情" })}
                                className="rounded-full bg-surface-2 px-2.5 py-0.5 text-[11px] text-foreground ring-1 ring-border/60"
                              >
                                {t}
                              </button>
                            ))}
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              ))}
            </div>
          </div>
        </details>

        {/* 看完报告，下一步该做什么 */}
        <section className="mb-3 rounded-3xl bg-gradient-to-br from-teal/12 to-warm/10 p-4 ring-1 ring-teal/25">
          <div className="mb-3 flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-teal/20 text-base">
              {<EIcon e="🧭" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />}
            </span>
            <div>
              <p className="text-sm font-bold">看完报告，接下来做什么？</p>
              <p className="text-[11px] text-muted-foreground">
                本次发现 <b className="text-danger">3 项需关注</b>，建议按 ①→②→③ 顺序跟进
              </p>
            </div>
          </div>
          <ol className="space-y-2">
            {nextSteps.map((s, i) => (
              <Link
                key={s.title}
                to={s.to}
                search={s.search as never}
                className="flex items-center gap-3 rounded-2xl bg-surface p-3 shadow-sm ring-1 ring-border/60 transition active:scale-[0.98]"
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-teal text-[13px] font-bold text-teal-foreground">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">{<EIcon e={s.icon} className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />}</span>
                    <p className="text-[13px] font-semibold">{s.title}</p>
                    <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-medium ${s.tagClass}`}>{s.tag}</span>
                  </div>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{s.desc}</p>
                </div>
                <span className="shrink-0 text-muted-foreground">›</span>
              </Link>
            ))}
          </ol>
        </section>

      </div>
    </div>
  );
}


function MiniChart({ label, data, color }: { label: string; data: number[]; color: "warm" | "teal" }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const stroke = color === "warm" ? "var(--warm)" : "var(--teal)";
  const points = data
    .map((v, i) => `${(i / (data.length - 1)) * 100},${100 - ((v - min) / range) * 80 - 10}`)
    .join(" ");
  return (
    <div className={`rounded-xl p-3 ${color === "warm" ? "bg-warm/10" : "bg-teal/10"}`}>
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="text-lg font-bold">{data[data.length - 1]}</p>
      <svg viewBox="0 0 100 100" className="mt-1 h-14 w-full">
        <polyline points={points} fill="none" stroke={stroke} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
    </div>
  );
}
