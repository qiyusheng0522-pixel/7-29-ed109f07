import { createFileRoute, Link } from "@tanstack/react-router";
import { StatusBar } from "@/components/MobileFrame";
import { toast } from "sonner";
import { ActionSheet } from "@/components/ActionSheet";
import { child } from "@/lib/mock-data";
import { useState } from "react";

import { EIcon } from "@/components/EIcon";
import { PreExamQuestionnaireSheet } from "@/components/PreExamQuestionnaireSheet";
import { preExamQuestionnaires, type PreExamQuestionnaireId } from "@/lib/pre-exam-questionnaires";
export const Route = createFileRoute("/parent/notice")({
  head: () => ({ meta: [
    { title: "家长须知与授权 · 儿童健康体检" },
    { name: "description", content: "查看家长体检须知，填写过敏与心理行为检前问卷及体检授权。" },
    { property: "og:title", content: "家长须知与授权 · 儿童健康体检" },
    { property: "og:description", content: "过敏与心理行为检前问卷、体检安排与家长授权。" },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: NoticePage,
});

type Cat = "todo" | "info" | "sign";
type Item = {
  id: string;
  icon: import("react").ReactNode;
  title: string;
  desc: string;
  status: "待办" | "已完成" | "已签署" | "已阅读";
  deadline?: string;
  cta?: string;
  questionnaireId?: PreExamQuestionnaireId;
};

const grouped: Record<Cat, { label: string; hint: string; items: Item[] }> = {
  todo: {
    label: "待办事项",
    hint: "体检前需要您完成的操作",
    items: [
      {
        id: "allergy-form",
        questionnaireId: "allergy",
        icon: <EIcon e="📝" />,
        title: "过敏 · 体检前问卷",
        desc: "6 道题 · 是 / 否",
        status: "待办",
        deadline: "2026-04-13 24:00 前",
        cta: "去填写",
      },
      {
        id: "psychology-form",
        questionnaireId: "psychology",
        icon: <EIcon e="📝" />,
        title: "心理行为问题筛查",
        desc: "家长版 | 4-17 岁 · 6 道题",
        status: "待办",
        deadline: "2026-04-13 24:00 前",
        cta: "去填写",
      },
    ],

  },
  info: {
    label: "须知悉事项",
    hint: "体检安排与检前注意事项，请仔细阅读并提醒孩子配合",
    items: [
      {
        id: "prep",
        icon: <EIcon e="📌" />,
        title: "检前注意事项（务必提醒孩子）",
        desc: "① 禁食禁水：前一晚 22:00 后不再进食饮水，晨起空腹到校；② 睡眠运动：21:30 前入睡，当日勿剧烈运动，静息 10 分钟再测血压；③ 饮食用药：前 3 天清淡饮食，勿服维生素 C / 布洛芬等（长期用药提前告知校医）；④ 着装物品：宽松衣物 + 运动鞋，戴眼镜者请携带；⑤ 身体不适：发热 / 咳嗽 / 腹泻 / 生理期请提前在「我的-请假」报备安排补检。",
        status: "已阅读",
        deadline: "2026-04-14 22:00 起执行",
      },
      {
        id: "when",
        icon: <EIcon e="🗓️" />,
        title: "体检时间与地点",
        desc: "2026-04-15（周三）08:30—11:30 · 操场东侧体检车，请于 08:20 前到班集合。",
        status: "已阅读",
        deadline: "2026-04-14 前知悉",
      },
      {
        id: "org",
        icon: <EIcon e="🏥" />,
        title: "承检机构",
        desc: "阳光社区卫生服务中心 · 具备儿童体检资质",
        status: "已阅读",
        deadline: "2026-04-14 前知悉",
      },
      {
        id: "items",
        icon: <EIcon e="🩺" />,
        title: "体检项目清单",
        desc: "身高 / 体重 / BMI / 腰围 / 血压 / 视力 / 口腔 / 呼吸过敏问卷",
        status: "已阅读",
        deadline: "2026-04-14 前知悉",
      },
      {
        id: "post",
        icon: <EIcon e="🌱" />,
        title: "检后注意事项（体检结束后请留意）",
        desc: "① 报告查看：体检后 3–5 个工作日内在「体检报告」查看，异常项将自动推荐对应科室医生；② 饮食恢复：抽血后 30 分钟按压针孔，当日避免剧烈运动与游泳；③ 复查随访：如提示复查/转诊，请在 2 周内前往推荐科室，避免延误；④ 健康方案：报告出具后系统会生成个性化运动/营养方案，请按计划打卡；⑤ 疑问咨询：任何指标疑问可通过「AI 解读 / 咨询医生」实时反馈。",
        status: "已阅读",
        deadline: "2026-04-15 体检结束后",
      },

    ],
  },
  sign: {
    label: "需签署授权书",
    hint: "涉及数据采集与使用，需监护人签字确认",
    items: [
      {
        id: "consent",
        icon: <EIcon e="✍️" />,
        title: "体检知情同意书",
        desc: "同意本次校内体检采集孩子基础健康数据",
        status: "待办",
        deadline: "2026-04-13 24:00 前",
        cta: "去签署",
      },
      {
        id: "data",
        icon: <EIcon e="🔐" />,
        title: "数据使用与呵护授权",
        desc: "授权后 12 个月内用于家庭呵护、随访、复评提醒",
        status: "已签署",
        deadline: "2026-04-13 24:00 前",
      },
    ],
  },
};

const cats: Cat[] = ["todo", "info", "sign"];

function NoticePage() {
  const [tab, setTab] = useState<Cat>("todo");
  const [signed, setSigned] = useState(false);
  const [revokeScope, setRevokeScope] = useState<"this" | "all">("this");
  const [submittedQuestionnaires, setSubmittedQuestionnaires] = useState<Partial<Record<PreExamQuestionnaireId, boolean>>>({});
  const effectiveGrouped = {
    ...grouped,
    todo: {
      ...grouped.todo,
      items: grouped.todo.items.map((item): Item => ({
        ...item,
        status: item.questionnaireId && submittedQuestionnaires[item.questionnaireId] ? "已完成" : item.status,
      })),
    },
  };

  const totals = cats.map((c) => ({
    c,
    total: effectiveGrouped[c].items.length,
    pending: effectiveGrouped[c].items.filter((i) => i.status === "待办").length,
  }));

  return (
    <div>
      <StatusBar title="家长须知与授权" />
      <div className="px-5 pb-10 pt-2">
        {/* Header summary */}
        <div className="mb-4 rounded-3xl bg-gradient-to-br from-teal/25 to-warm/15 p-5 ring-1 ring-teal/20">
          <p className="text-xs text-muted-foreground">阳光小学 · 春季体检</p>
          <h1 className="mt-1 text-lg font-bold">{child.name}的入学体检 · 家长须知</h1>
          <p className="mt-2 text-xs leading-relaxed text-foreground/80">
            以下事项按类型分组，请优先处理"待办"事项，确保 04-15 体检当日一切顺利。
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            {totals.map((t) => (
              <button
                key={t.c}
                onClick={() => setTab(t.c)}
                className={`rounded-2xl px-2 py-2 text-[11px] transition ${
                  tab === t.c
                    ? "bg-white shadow-sm ring-1 ring-teal/30"
                    : "bg-white/60 text-muted-foreground"
                }`}
              >
                <p className="text-[11px]">{grouped[t.c].label}</p>
                <p className="mt-0.5 text-sm font-bold text-foreground">
                  {t.pending > 0 ? (
                    <>
                      <span className="text-danger">{t.pending}</span>
                      <span className="text-muted-foreground"> / {t.total}</span>
                    </>
                  ) : (
                    <span className="text-success">已完成</span>
                  )}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-3 flex gap-2">
          {cats.map((c) => (
            <button
              key={c}
              onClick={() => setTab(c)}
              className={`flex-1 rounded-full px-3 py-1.5 text-xs font-medium ring-1 transition ${
                tab === c
                  ? "bg-warm text-warm-foreground ring-transparent"
                  : "bg-surface text-muted-foreground ring-border"
              }`}
            >
              {grouped[c].label}
            </button>
          ))}
        </div>

        <p className="mb-3 text-[11px] text-muted-foreground">{grouped[tab].hint}</p>

        {/* Items */}
        <ul className="space-y-2">
          {effectiveGrouped[tab].items.map((it) => {
            const isTodo = it.status === "待办";
            const statusClass =
              it.status === "待办"
                ? "bg-danger/10 text-danger"
                : it.status === "已签署"
                ? "bg-teal/10 text-teal"
                : "bg-success/10 text-success";
            return (
              <li
                key={it.id}
                className={`rounded-2xl bg-surface p-3 ring-1 ${
                  isTodo ? "ring-danger/25" : "ring-border/60"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-surface-2 text-lg">
                    {it.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold">{it.title}</p>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] ${statusClass}`}>
                        {it.status}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                      {it.desc}
                    </p>
                    {it.deadline && (
                      <p className="mt-1 text-[11px] font-medium text-warm">
                        ⏰ 截止日期：{it.deadline}
                      </p>
                    )}
                    {(isTodo || it.questionnaireId) && it.cta && (
                      <div className="mt-2 flex justify-end">
                        {it.id === "consent" ? (
                          <ActionSheet
                            trigger={
                              <button className="rounded-full bg-warm px-3 py-1 text-[11px] font-medium text-warm-foreground">
                                {it.cta}
                              </button>
                            }
                            title="签署体检知情同意书"
                            description="请签字确认同意学校采集本次体检数据用于生成健康报告。"
                            confirmText={signed ? "确认提交" : "请先签名"}
                            toastMessage="授权成功 · 已同步学校"
                            toastDescription={`签名人：李妈妈 · ${child.name}`}
                          >
                            <div
                              onClick={() => setSigned(true)}
                              className={`grid h-24 place-items-center rounded-xl border-2 border-dashed text-xs transition ${
                                signed
                                  ? "border-warm bg-warm/10 text-warm"
                                  : "border-border text-muted-foreground"
                              }`}
                            >
                              {signed ? " 李妈妈 · 2026-04-08 20:14" : "点击此处手写签名"}
                            </div>
                          </ActionSheet>
                        ) : it.questionnaireId ? (
                          <PreExamQuestionnaireSheet
                            questionnaire={preExamQuestionnaires[it.questionnaireId]}
                            submitted={Boolean(submittedQuestionnaires[it.questionnaireId])}
                            onSubmit={() => {
                              const id = it.questionnaireId;
                              if (!id) return;
                              setSubmittedQuestionnaires((current) => ({ ...current, [id]: true }));
                            }}
                          />
                        ) : (
                          <button
                            onClick={() => toast.success(`已${it.cta}`, { description: it.title })}
                            className="rounded-full bg-warm px-3 py-1 text-[11px] font-medium text-warm-foreground"
                          >
                            {it.cta}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {/* 授权撤回入口 */}
        {tab === "sign" && (
          <ActionSheet
            trigger={
              <button className="mt-4 w-full rounded-xl border border-danger/40 bg-white py-2 text-xs font-medium text-danger">
                撤回 / 终止授权
              </button>
            }
            title="撤回或终止授权"
            description="请选择撤回范围。撤回后学校与健管师将立即停止对应数据处理。"
            confirmText="确认撤回"
            danger
            toastMessage={revokeScope === "all" ? "已终止全部健康管理" : "已撤回本次体检授权"}
            toastDescription={`签名人：李妈妈 · ${child.name}`}
          >
            <div className="space-y-2 text-xs">
              {[
                { key: "this" as const, title: "仅撤回本次体检授权", desc: "本次体检数据不再用于生成报告，已生成的历史报告保留。" },
                { key: "all" as const, title: "终止全部健康管理", desc: "取消 12 个月呵护、随访与复评推送，历史数据按合规脱敏保留。" },
              ].map((opt) => {
                const active = revokeScope === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setRevokeScope(opt.key)}
                    className={`w-full rounded-xl p-3 text-left ring-1 transition ${
                      active ? "bg-danger/10 ring-danger/40" : "bg-surface-2 ring-border/60"
                    }`}
                  >
                    <p className={`text-sm font-medium ${active ? "text-danger" : ""}`}>{opt.title}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{opt.desc}</p>
                  </button>
                );
              })}
            </div>
          </ActionSheet>
        )}

        <Link
          to="/parent/me"
          className="mt-4 block text-center text-xs text-muted-foreground"
        >
          查看历史授权记录 →
        </Link>
      </div>
    </div>
  );
}
