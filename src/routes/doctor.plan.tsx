import { createFileRoute, Link } from "@tanstack/react-router";
import { StatusBar } from "@/components/MobileFrame";
import { ActionSheet } from "@/components/ActionSheet";
import { useState } from "react";

import { EIcon } from "@/components/EIcon";
export const Route = createFileRoute("/doctor/plan")({
  component: PlanPage,
});

type ReviewState = "待审核" | "已审核";
type ApprovalRecord = { time: string; doctor: string; note: string; plan: string };
type Case = {
  id: string;
  name: string;
  hospital: string;
  dept: string;
  evalTime: string;
  disease: string;
  planStatus: string;
  riskStatus: string;
  reviewState: ReviewState;
  needVisit?: boolean;
  evaluation: string;
  plan: string;
  approvedAt?: string;
  approvedBy?: string;
  history?: ApprovalRecord[];
};

const cases: Case[] = [
  {
    id: "0315",
    name: "小阳",
    hospital: "市儿童医院",
    dept: "儿童保健科",
    evalTime: "2026-09-18 10:08:59",
    disease: "肥胖倾向 · 尘螨过敏",
    planStatus: "已生成",
    riskStatus: "已评估",
    reviewState: "待审核",
    needVisit: true,
    evaluation:
      "根据本次入学体检评估，患儿为 9 岁男童，身高 138cm（P75）、体重 32.5kg（P85）、BMI 17.1，已高于同龄参考上限 14.5–16.8，属学龄期早发性超重人群。近半年体重增长 5kg 而身高仅增长 3cm，呈体重追赶型趋势，若不干预，成年后面临更高的糖尿病、脂肪肝、心血管疾病及性早熟风险。同时，尘螨 IgE (++) 阳性合并运动后偶发咳嗽，肺功能 FEV1 98% 正常但存在气道高反应可能，需警惕过敏性哮喘倾向。建议启动 12 周家庭健康管理方案，并至呼吸/过敏科门诊进一步评估。",
    plan:
      "饮食：控糖限脂，每日 1400–1600 kcal，主食粗细搭配（粗粮占 1/3 以上），每餐蔬菜 200g，含糖饮料完全戒除，晚餐 19:00 前完成，每日饮水 ≥1200ml。运动：每周 ≥150 分钟中等强度有氧，周一/三/五亲子跳绳 20 分钟，周二/四快走 30 分钟，周六游泳 45 分钟（哮喘倾向友好），运动前 5 分钟热身并随身携带应急吸入器。家庭护理：床品每周 60℃ 高温清洗，使用防螨床罩，除螨仪每周 2 次，室内湿度 40–50%。复评：3 个月复评 BMI，6 个月复评肺功能与过敏原。",
  },
  {
    id: "0617",
    name: "王小豆",
    hospital: "市儿童医院",
    dept: "儿童保健科",
    evalTime: "2026-04-28 15:22:10",
    disease: "肥胖 · 糖尿病风险",
    planStatus: "已生成",
    riskStatus: "已评估",
    reviewState: "待审核",
    evaluation:
      "学龄期男童，BMI 位于 P95 以上，腰围偏大，空腹血糖 6.3 mmol/L 处于高值，父亲有 2 型糖尿病史。综合评估为肥胖相关代谢风险，建议家庭尽快启动体重管理并至内分泌科随访。",
    plan:
      "饮食：控糖限脂，每餐蔬菜占 1/2，含糖饮料完全戒除，晚餐 19:00 前完成。运动：亲子跳绳/游泳每周≥3 次，每次 30 分钟，中等强度。睡眠：22:00 前入睡，睡眠 ≥9 小时。每月监测身高、体重、腰围与空腹血糖，3 个月复评 BMI 与 OGTT。",
  },
  {
    id: "0812",
    name: "李小雨",
    hospital: "鼓楼医院",
    dept: "呼吸/过敏科",
    evalTime: "2026-04-02 18:44:18",
    disease: "过敏性哮喘",
    planStatus: "已发布",
    riskStatus: "已评估",
    reviewState: "已审核",
    approvedAt: "2026-04-03 09:15",
    approvedBy: "王医生",
    evaluation:
      "患儿 BMI 16.8 偏轻，近两周夜间咳嗽 3 次，尘螨与花粉阳性，母亲有过敏性鼻炎史，属过敏体质。建议以家庭呵护为主，1 个月复评。",
    plan:
      "饮食：三餐规律，早餐必吃，蛋白质≥1份，含糖饮料≤1次/周。运动：中等强度 60 分钟/日，花粉高峰期改室内。环境：每周床品 60℃ 除螨，卧室湿度 40-60%。用药：布地奈德鼻喷每日 1 次遵医嘱。复诊：2 周校医复核，1 个月家长上传体重与症状记录。",
    history: [
      {
        time: "2026-04-03 09:15",
        doctor: "王医生",
        note: "方案合理，同意发布。建议 1 个月后根据体重与夜咳记录复评。",
        plan:
          "饮食：三餐规律，早餐必吃，蛋白质≥1份，含糖饮料≤1次/周。运动：中等强度 60 分钟/日，花粉高峰期改室内。环境：每周床品 60℃ 除螨。用药：布地奈德鼻喷每日 1 次遵医嘱。",
      },
      {
        time: "2026-03-05 14:20",
        doctor: "王医生",
        note: "首版方案，重点关注过敏原回避与夜间症状。",
        plan:
          "饮食：清淡饮食，避免海鲜与坚果类过敏原。环境：每周床品换洗，减少毛绒玩具。用药：延续原方案。",
      },
    ],
  },
  {
    id: "0913",
    name: "赵子墨",
    hospital: "市儿童医院",
    dept: "内分泌科",
    evalTime: "2026-03-28 10:05:00",
    disease: "生长迟缓",
    planStatus: "已发布",
    riskStatus: "已评估",
    reviewState: "已审核",
    approvedAt: "2026-03-29 11:40",
    approvedBy: "李医生",
    evaluation:
      "8 岁男童，身高低于同龄 P3，骨龄落后 1.2 年，家族无矮小史，建议内分泌科规律随访。",
    plan:
      "饮食：保证每日 500ml 奶制品与优质蛋白 60g。运动：每日跳绳 15 分钟。睡眠：21:30 前入睡。复诊：3 个月内分泌科骨龄复查。",
    history: [
      {
        time: "2026-03-29 11:40",
        doctor: "李医生",
        note: "同意发布，建议 3 个月后骨龄复查。",
        plan:
          "饮食：保证每日 500ml 奶制品与优质蛋白 60g。运动：每日跳绳 15 分钟。睡眠：21:30 前入睡。",
      },
    ],
  },
];

function TileGrid({ items }: { items: { label: string; value: string; accent?: boolean }[] }) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {items.map((it) => (
        <div key={it.label} className="rounded-xl bg-surface-2 p-3">
          <p className="text-[11px] text-muted-foreground">{it.label}</p>
          <p className={`mt-1 text-[14px] font-medium ${it.accent ? "text-teal" : ""}`}>
            {it.value}
          </p>
        </div>
      ))}
    </div>
  );
}

function PlanPage() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [tab, setTab] = useState<ReviewState>("待审核");
  const [planText, setPlanText] = useState<string>("");
  const active = activeId ? cases.find((c) => c.id === activeId) ?? null : null;

  // ============ List view ============
  if (!active) {
    const tabs: ReviewState[] = ["待审核", "已审核"];
    const filtered = cases.filter((c) => c.reviewState === tab);
    return (
      <div className="min-h-full bg-muted/40">
        <StatusBar title="方案审核" />
        <div className="px-4 pb-8 pt-3">
          <div className="mb-3 flex gap-2">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium ring-1 transition ${
                  tab === t
                    ? "bg-deep text-deep-foreground ring-deep"
                    : "bg-surface text-foreground ring-border/60"
                }`}
              >
                {t}
                <span className="ml-1 text-[10px] opacity-70">
                  {cases.filter((c) => c.reviewState === t).length}
                </span>
              </button>
            ))}
          </div>

          <ul className="space-y-3">
            {filtered.map((c) => (
              <li
                key={c.id}
                className="overflow-hidden rounded-2xl bg-surface shadow-sm ring-1 ring-border/60"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <p className="text-[15px] font-bold">{c.name}</p>
                      <span
                        className={`rounded-md px-1.5 py-0.5 text-[10px] ${
                          c.reviewState === "待审核"
                            ? "bg-warm/15 text-warm"
                            : "bg-success/15 text-success"
                        }`}
                      >
                        {c.reviewState}
                      </span>
                    </div>
                    {c.needVisit && (
                      <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        需就诊
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-[12px] text-muted-foreground">
                    {c.dept} · {c.evalTime}
                  </p>
                  <p className="mt-1 text-[13px] font-medium text-teal">{c.disease}</p>
                  <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-foreground/85">
                    <span className="font-semibold text-foreground">普通评估: </span>
                    {c.evaluation}
                  </p>
                  {c.reviewState === "已审核" && (
                    <p className="mt-2 text-[11px] text-muted-foreground">
                       {c.approvedAt} · {c.approvedBy} 审核通过 · 共 {c.history?.length ?? 1} 版
                    </p>
                  )}
                </div>
                <div
                  className={`grid gap-3 border-t border-border/60 px-4 py-3 ${
                    c.reviewState === "待审核" ? "grid-cols-2" : "grid-cols-1"
                  }`}
                >
                  <button
                    onClick={() => {
                      setActiveId(c.id);
                      setPlanText(c.plan);
                    }}
                    className="rounded-xl bg-deep/10 py-2.5 text-[13px] font-medium text-deep"
                  >
                    {c.reviewState === "待审核" ? " 查看方案" : " 查看历史方案"}
                  </button>
                  {c.reviewState === "待审核" && (
                    <button
                      onClick={() => {
                        setActiveId(c.id);
                        setPlanText(c.plan);
                      }}
                      className="rounded-xl bg-success/15 py-2.5 text-[13px] font-medium text-success"
                    >
                      {<EIcon e="✓" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />} 一键通过
                    </button>
                  )}
                </div>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="rounded-xl bg-surface p-6 text-center text-xs text-muted-foreground ring-1 ring-border/60">
                暂无{tab}方案
              </li>
            )}
          </ul>
        </div>
      </div>
    );
  }

  // ============ Detail view ============
  const isApproved = active.reviewState === "已审核";
  return (
    <div className="min-h-full bg-muted/40">
      <StatusBar title="方案详情" />
      <div className="px-4 pb-8 pt-2">
        <div className="mb-3 flex items-center justify-between">
          <button
            onClick={() => setActiveId(null)}
            className="flex items-center gap-1 text-sm text-deep"
          >
            ‹ 返回
          </button>
          <span
            className={`rounded-full px-2.5 py-0.5 text-[11px] ${
              isApproved ? "bg-success/15 text-success" : "bg-warm/15 text-warm"
            }`}
          >
            {isApproved ? "已审核" : "审核中"}
          </span>
        </div>

        {/* Patient header */}
        <div className="mb-3 rounded-2xl bg-surface p-5 shadow-sm ring-1 ring-border/60">
          <p className="mb-3 text-lg font-bold">{active.name}</p>
          <TileGrid
            items={[
              { label: "医院", value: active.hospital },
              { label: "科室", value: active.dept },
              { label: "评估时间", value: active.evalTime },
              { label: "疾病", value: active.disease, accent: true },
              { label: "方案状态", value: active.planStatus },
              { label: "风险状态", value: active.riskStatus },
            ]}
          />
        </div>

        {/* Evaluation */}
        <div className="mb-3 rounded-2xl bg-surface p-5 shadow-sm ring-1 ring-border/60">
          <p className="mb-3 flex items-center gap-2 text-[15px] font-semibold">
            <span className="text-deep">{<EIcon e="📄" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />}</span> 评估内容
          </p>
          <p className="mb-2 text-[12px] text-muted-foreground">普通评估</p>
          <div className="rounded-xl bg-surface-2 p-3 text-[13px] leading-relaxed">
            {active.evaluation}
          </div>
        </div>

        {/* Plan content */}
        <div className="mb-3 rounded-2xl bg-surface p-5 shadow-sm ring-1 ring-border/60">
          <div className="mb-3 flex items-center justify-between">
            <p className="flex items-center gap-2 text-[15px] font-semibold">
              <span className="text-deep">{<EIcon e="📄" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />}</span> 方案内容
            </p>
            {!isApproved && (
              <button
                onClick={() => setPlanText("")}
                className="flex items-center gap-1 rounded-md bg-danger/10 px-2 py-1 text-[11px] text-danger"
              >
                ⌫ 一键清除
              </button>
            )}
          </div>
          <p className="mb-2 text-[12px] text-muted-foreground">
            方案内容 <span className="text-danger">*</span>
          </p>
          {isApproved ? (
            <div className="rounded-xl bg-surface-2 p-3 text-[13px] leading-relaxed">
              {active.plan}
            </div>
          ) : (
            <textarea
              value={planText}
              onChange={(e) => setPlanText(e.target.value)}
              rows={10}
              className="w-full resize-y rounded-xl bg-surface-2 p-3 text-[13px] leading-relaxed outline-none ring-1 ring-transparent focus:ring-deep"
            />
          )}

          {!isApproved && (
            <div className="mt-4">
              <ActionSheet
                trigger={
                  <button className="w-full rounded-xl bg-deep py-3 text-sm font-medium text-deep-foreground">
                    {<EIcon e="✓" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />} 审核通过
                  </button>
                }
                title="确认审核通过该方案？"
                description="通过后方案将同步至家长端，并进入已审核历史记录。"
                confirmText="确认通过"
                toastMessage="方案已审核通过"
                toastDescription={`${active.name} · 已同步家长端`}
                onConfirm={() => setActiveId(null)}
              />
            </div>
          )}
        </div>

        {/* Approval history (approved only) */}
        {isApproved && active.history && active.history.length > 0 && (
          <div className="mb-3 rounded-2xl bg-surface p-5 shadow-sm ring-1 ring-border/60">
            <p className="mb-3 flex items-center gap-2 text-[15px] font-semibold">
              <span className="text-deep">{<EIcon e="🕘" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />}</span> 历史审核记录
              <span className="text-[11px] font-normal text-muted-foreground">
                共 {active.history.length} 版
              </span>
            </p>
            <ol className="space-y-3">
              {active.history.map((h, i) => (
                <li key={h.time} className="rounded-xl bg-surface-2 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[13px] font-medium">
                      v{active.history!.length - i} · {h.doctor}
                    </p>
                    <p className="text-[11px] text-muted-foreground">{h.time}</p>
                  </div>
                  <p className="mt-1 text-[12px] text-muted-foreground">{h.note}</p>
                  <details className="mt-2">
                    <summary className="cursor-pointer text-[12px] text-deep">
                      查看该版本方案内容
                    </summary>
                    <p className="mt-2 text-[12px] leading-relaxed">{h.plan}</p>
                  </details>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* User link - shows same report as parent side */}
        <Link
          to="/doctor/child"
          className="flex w-full items-center gap-3 rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-border/60"
        >
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-deep/10 text-deep">
            {<EIcon e="📈" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />}
          </span>
          <div className="flex-1 text-left">
            <p className="text-[14px] font-semibold">查看体检数据</p>
            <p className="text-[11px] text-muted-foreground">{active.name} 的体检明细 · 仅展示</p>
          </div>
          <span className="text-muted-foreground">›</span>
        </Link>
      </div>
    </div>
  );
}
