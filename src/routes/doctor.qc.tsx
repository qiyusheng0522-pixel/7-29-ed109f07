import { createFileRoute, Link } from "@tanstack/react-router";
import { StatusBar } from "@/components/MobileFrame";
import { ActionSheet } from "@/components/ActionSheet";
import { useState } from "react";

import { EIcon } from "@/components/EIcon";
export const Route = createFileRoute("/doctor/qc")({
  component: ReportReviewPage,
});

const tabs = ["待审核", "已通过", "已退回"] as const;

type Category = "数据质控" | "指标研判" | "文案把关" | "合规兜底";

type Item = {
  name: string;
  class: string;
  risk: "高危" | "中危" | "低危";
  category: Category;
  issue: string;
  detail: string;
  ai: string;
  history?: { round: string; snapshot: string }[]; // 平台历史体检记录
  deviation?: string; // 与历史相比的严重偏差，触发二次复核
  missing?: string[]; // 漏检项，触发漏检复核
};

const catStyle: Record<Category, string> = {
  数据质控: "bg-teal/15 text-teal",
  指标研判: "bg-warm/15 text-warm",
  文案把关: "bg-deep/15 text-deep",
  合规兜底: "bg-danger/15 text-danger",
};

const data: Record<(typeof tabs)[number], Item[]> = {
  待审核: [
    // 一、数据质控：录入/设备误差、漏检、逻辑矛盾
    {
      name: "李小雨",
      class: "3年3班",
      risk: "中危",
      category: "数据质控",
      issue: "身高 128 → 125 cm（半年下降 3cm）",
      detail: "与半年前数据方向矛盾，疑测量误差，需退回体检机构重测。",
      ai: "AI 建议：退回体检机构核实测量",
      history: [
        { round: "2025 秋季体检", snapshot: "身高 128 cm · 体重 24.6 kg · BMI 15.0" },
        { round: "2025 春季体检", snapshot: "身高 126 cm · 体重 23.8 kg · BMI 15.0" },
      ],
      deviation: "本次身高较半年前下降 3 cm，儿童身高不应回退 → 触发严重偏差二次复核",
    },
    {
      name: "赵一鸣",
      class: "3年3班",
      risk: "低危",
      category: "数据质控",
      issue: "缺 视力（左眼）· 未录入腰围",
      detail: "漏检 2 项，需补录后方可出报告。",
      ai: "AI 建议：标记缺项 · 通知复测",
      missing: ["视力（左眼）", "腰围"],
    },
    {
      name: "孙嘉禾",
      class: "4年1班",
      risk: "中危",
      category: "数据质控",
      issue: "身高 P10 但 BMI 24.6（超标）",
      detail: "身高偏低同时 BMI 严重超标，逻辑矛盾，疑体重录入错误。",
      ai: "AI 建议：核对体重原始秤重数据",
      history: [
        { round: "2025 秋季体检", snapshot: "身高 132 cm · 体重 30.2 kg · BMI 17.3" },
      ],
      deviation: "BMI 由 17.3 骤升至 24.6（+7.3），单学期涨幅异常 → 触发严重偏差二次复核",
    },

    // 二、指标综合研判：AI 只看数字，医生结合发育综合判断
    {
      name: "陈静雅",
      class: "3年3班",
      risk: "高危",
      category: "指标研判",
      issue: "血压 首测 138/92 · 复测 132/88 · BMI 21.3",
      detail: "血压偏高合并体重超标，多指标联动提示代谢风险，需综合定级。",
      ai: "AI 定级：黄 → 建议医生升级为『橙 · 需门诊评估』",
    },
    {
      name: "刘小强",
      class: "5年1班",
      risk: "高危",
      category: "指标研判",
      issue: "BMI 26.4 · 腰围 76cm · 空腹血糖 6.1",
      detail: "肥胖 + 腹型 + 血糖临界，需联动研判是否属于代谢综合征早期。",
      ai: "AI 建议：转心内科/内分泌科复评，家长同步生活方式干预",
    },
    {
      name: "王一诺",
      class: "2年2班",
      risk: "低危",
      category: "指标研判",
      issue: "身高年增长 8cm · 体重同步增长",
      detail: "属发育期生理性偏高，非病理，AI 误标红需下调风险等级。",
      ai: "AI 定级：橙 → 建议医生下调为『绿 · 正常发育』",
    },

    // 三、报告文案与医学结论把关
    {
      name: "陈小美",
      class: "4年2班",
      risk: "中危",
      category: "文案把关",
      issue: "AI 结论：『疑似哮喘倾向，建议立即就医』",
      detail: "话术过于强硬易引起家长恐慌，需改为温和的『需关注』表述并给出分层建议。",
      ai: "AI 建议：改为『运动后偶发咳嗽，建议家庭观察 + 呼吸科门诊评估』",
    },
    {
      name: "张小乐",
      class: "1年1班",
      risk: "中危",
      category: "文案把关",
      issue: "过敏原 (++)，未指定就诊科室",
      detail: "需在报告中明确『变态反应科』门诊，避免家长盲目就医。",
      ai: "AI 建议：追加就诊科室 · 提供 3 家推荐医院",
    },

    // 四、合规兜底：高风险 100% 复核
    {
      name: "周子墨",
      class: "6年2班",
      risk: "高危",
      category: "合规兜底",
      issue: "BMI 28.2 · 血压 142/95 · 建议开通绿色通道",
      detail: "高风险儿童必须 100% 人工复核，医生确认后方对家长生效。",
      ai: "AI 建议：开通就医绿色通道 · 生成专属健康呵护方案",
    },
  ],
  已通过: [
    {
      name: "王晨曦",
      class: "3年3班",
      risk: "中危",
      category: "文案把关",
      issue: "视力 4.9",
      detail: "AI 结论已由医生调整为『轻度屈光需 3 个月复查』，报告已签发。",
      ai: "AI 建议：3 个月复查",
    },
    {
      name: "林一诺",
      class: "5年3班",
      risk: "高危",
      category: "合规兜底",
      issue: "肥胖 + 血糖偏高",
      detail: "已 100% 人工复核并同步生成专属健康呵护方案。",
      ai: "AI 建议：转内分泌科 · 已确认",
    },
  ],
  已退回: [
    {
      name: "赵一鸣",
      class: "3年3班",
      risk: "低危",
      category: "数据质控",
      issue: "缺 视力（左眼）",
      detail: "已退回体检机构补录，等待复测数据回传。",
      ai: "—",
    },
    {
      name: "孙嘉禾",
      class: "4年1班",
      risk: "中危",
      category: "数据质控",
      issue: "身高体重逻辑矛盾",
      detail: "已通知机构核对原始秤重记录。",
      ai: "—",
    },
  ],
};

function ReportReviewPage() {
  const [t, setT] = useState<(typeof tabs)[number]>("待审核");
  const [openKey, setOpenKey] = useState<string | null>(null);
  const list = data[t];
  const highCount = data["待审核"].filter((i) => i.risk === "高危").length;

  return (
    <div>
      <StatusBar title="报告审核" />
      <div className="px-5 pb-8 pt-2">
        <h1 className="text-xl font-bold">报告审核</h1>
        <p className="mb-2 text-xs text-muted-foreground">
          校园儿童体检报告 · 医生四步核心工作：数据质控 → 指标研判 → 文案把关 → 合规兜底
        </p>
        <p className="mb-3 text-[11px] text-muted-foreground">
          待审核 {data["待审核"].length} 项（含高危 {highCount} · 所有报告须医生确认后方对家长生效）
        </p>

        <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
          {tabs.map((k) => (
            <button
              key={k}
              onClick={() => setT(k)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] ${
                t === k ? "bg-deep text-deep-foreground" : "bg-surface ring-1 ring-border/60 text-muted-foreground"
              }`}
            >
              {k} · {data[k].length}
            </button>
          ))}
        </div>

        <ul className="space-y-2">
          {list.map((r) => {
            const key = r.name + r.issue;
            const isOpen = openKey === key;
            const riskCls =
              r.risk === "高危"
                ? "bg-danger/15 text-danger"
                : r.risk === "中危"
                ? "bg-warm/15 text-warm"
                : "bg-success/15 text-success";
            return (
              <li key={key} className="overflow-hidden rounded-2xl bg-surface shadow-sm ring-1 ring-border/60">
                <div className="flex w-full items-start justify-between gap-2 p-4">
                  <Link
                    to="/doctor/child"
                    className="min-w-0 flex-1 text-left"
                  >
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${catStyle[r.category]}`}>
                        {r.category}
                      </span>
                      <p className="text-sm font-semibold">
                        {r.name} · {r.class}
                        <span className="ml-1 text-[10px] text-deep">查看体检数据 ›</span>
                      </p>
                    </div>
                    <p className="mt-1 text-xs text-warm">{<EIcon e="⚠" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />} {r.issue}</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {r.deviation && (
                        <span className="rounded bg-danger/15 px-1.5 py-0.5 text-[10px] font-medium text-danger">{<EIcon e="🔁" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />} 严重偏差二次复核</span>
                      )}
                      {r.missing && r.missing.length > 0 && (
                        <span className="rounded bg-warning/25 px-1.5 py-0.5 text-[10px] font-medium text-warning-foreground">{<EIcon e="🕳" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />} 漏检复核 · {r.missing.length} 项</span>
                      )}
                    </div>
                  </Link>
                  <button
                    onClick={() => setOpenKey(isOpen ? null : key)}
                    className="flex shrink-0 items-center gap-2"
                    aria-label="展开详情"
                  >
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${riskCls}`}>
                      {r.risk}
                    </span>
                    <span
                      className={`text-xs text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
                    >
                      ⌄
                    </span>
                  </button>
                </div>
                {isOpen && (
                  <div className="border-t border-border/60 px-4 pb-4 pt-3">
                    <p className="text-[11px] text-muted-foreground">{r.detail}</p>

                    {/* 平台历史体检记录对比 */}
                    {r.history && r.history.length > 0 && (
                      <div className="mt-2 rounded-lg bg-teal/8 p-2 ring-1 ring-teal/20">
                        <p className="text-[10.5px] font-semibold text-teal">{<EIcon e="📈" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />} 平台历史体检记录对比</p>
                        <ul className="mt-1 space-y-0.5">
                          {r.history.map((h) => (
                            <li key={h.round} className="text-[10.5px] text-muted-foreground">
                              <span className="text-foreground">{h.round}</span> · {h.snapshot}
                            </li>
                          ))}
                        </ul>
                        {r.deviation && (
                          <p className="mt-1.5 rounded bg-danger/10 px-2 py-1 text-[10.5px] text-danger">
                             {r.deviation}
                          </p>
                        )}
                      </div>
                    )}

                    {/* 漏检复核 */}
                    {r.missing && r.missing.length > 0 && (
                      <div className="mt-2 rounded-lg bg-warning/15 p-2 ring-1 ring-warning/30">
                        <p className="text-[10.5px] font-semibold text-warning-foreground">{<EIcon e="🕳" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />} 漏检复核清单</p>
                        <p className="mt-1 text-[10.5px] text-muted-foreground">
                          缺失：{r.missing.join(" / ")} · 已通知体检机构补录后回传
                        </p>
                      </div>
                    )}

                    <p className="mt-2 rounded-lg bg-surface-2 px-2.5 py-1.5 text-[11px] text-muted-foreground">
                       {r.ai}
                    </p>
                    {t === "待审核" && (
                      <div className="mt-3 flex gap-2">
                        <ActionSheet
                          trigger={<button className="flex-1 rounded-xl bg-surface-2 py-2 text-xs">退回补录</button>}
                          title="退回体检机构补录？"
                          description={`${r.name} · ${r.detail}`}
                          confirmText="退回"
                          toastMessage="已退回补录"
                          toastType="info"
                        />
                        <ActionSheet
                          trigger={<button className="flex-1 rounded-xl bg-warm/15 py-2 text-xs text-warm">标记复测</button>}
                          title="标记待复测？"
                          confirmText="标记"
                          toastMessage="已加入复测队列"
                          toastType="warning"
                        />
                        <ActionSheet
                          trigger={
                            <button className="flex-1 rounded-xl bg-deep py-2 text-xs font-medium text-deep-foreground">
                              审核签发
                            </button>
                          }
                          title="确认人工二次审核通过？"
                          description="签发后报告将同步至家长与校方。"
                          confirmText="签发"
                          toastMessage="报告已签发 "
                        />
                      </div>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>

      </div>
    </div>
  );
}
