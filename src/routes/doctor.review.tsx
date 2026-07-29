import { createFileRoute, Link } from "@tanstack/react-router";
import { StatusBar } from "@/components/MobileFrame";
import { SubNav, reviewSubNav } from "@/components/DoctorSubNav";
import { ActionSheet } from "@/components/ActionSheet";
import { useState } from "react";

import { EIcon } from "@/components/EIcon";
export const Route = createFileRoute("/doctor/review")({
  component: ReviewPage,
});

type Draft = {
  name: string;
  hospital: string;
  dept: string;
  evalTime: string;
  disease: string;
  planStatus: string;
  riskStatus: string;
  risk: "红" | "橙" | "黄" | "绿";
  flagged: boolean;
  consult?: boolean;
  evaluation: string;
  plan: string;
};

const drafts: Draft[] = [
  {
    name: "周子航",
    hospital: "鼓楼医院",
    dept: "内分泌科",
    evalTime: "2026-04-02 18:44:18",
    disease: "糖尿病",
    planStatus: "已生成",
    riskStatus: "已评估",
    risk: "红",
    flagged: true,
    consult: true,
    evaluation:
      "根据中国糖尿病风险评分表（CDRS）评估，患者为 31 岁男性，年龄得 1 分，体重指数 ≥30.0 得 11 分，腰围 ≥95.0cm 得 10 分，收缩压 140–149 mmHg 得 7 分，无糖尿病家族史得 0 分，男性额外加 2 分，总分 31 分，属于高风险人群（≥25 分）。风险主要来源于超重（BMI≥30）、腹部肥胖（腰围≥95cm）和高血压。建议立即前往医院进行 OGTT 试验，以明确是否患有糖尿病或前期糖代谢异常，并同步启动生活方式干预。",
    plan:
      "饮食：每日饮水 ≥2000ml，减少辛辣，规律三餐，奶制品每周≥3 次，外卖≤1 次/周，优先全谷物、蔬菜、优质蛋白。运动：从每日 10 分钟轻度活动起步，逐步过渡至每周 5 天、每次 30 分钟中等强度（快走、太极）。睡眠：23 点前入睡，保证 7 小时连续睡眠，睡前 1 小时远离电子设备。情绪：每日 5 分钟深呼吸或冥想。每周 OGTT 监测，目标腰围 ≤90cm、血压 <130/80mmHg，两周复评一次。",
  },
  {
    name: "刘小强",
    hospital: "市儿童医院",
    dept: "儿童保健科",
    evalTime: "2026-04-01 09:20:00",
    disease: "肥胖 · 高血压倾向",
    planStatus: "已生成",
    riskStatus: "已评估",
    risk: "红",
    flagged: true,
    evaluation:
      "学龄期男童，BMI 位于 P95 以上，腰围偏大，静息血压 118/78 mmHg 处于高值，父亲有糖尿病史。综合评估为肥胖相关代谢风险，建议家庭尽快启动体重管理并至儿保科随访。",
    plan:
      "饮食：控糖限脂，每餐蔬菜占 1/2，含糖饮料完全戒除。运动：亲子跳绳/游泳每周≥3 次，每次 30 分钟。睡眠：22:00 前入睡。每月监测身高、体重、腰围与血压，3 个月复评 BMI。",
  },
  {
    name: "张小乐",
    hospital: "市儿童医院",
    dept: "变态反应科",
    evalTime: "2026-03-30 15:12:00",
    disease: "过敏体质 · 低体重",
    planStatus: "已生成",
    riskStatus: "已评估",
    risk: "橙",
    flagged: true,
    evaluation:
      "尘螨 IgE 阳性 (++)，运动后偶发咳嗽，体重位于 P10。存在过敏性哮喘倾向及营养不足，建议家庭除螨并加强营养摄入。",
    plan:
      "环境：床品每周 60℃ 高温清洗，使用防螨罩，卧室湿度 <50%。营养：每日增加 1 份优质蛋白（鸡蛋/牛奶/鱼虾），少量多餐。运动：热身充分后再运动，症状加重时暂停并就诊。",
  },
  {
    name: "王小明",
    hospital: "阳光小学卫生室",
    dept: "校医",
    evalTime: "2026-03-28 10:00:00",
    disease: "超重",
    planStatus: "已生成",
    riskStatus: "已评估",
    risk: "黄",
    flagged: false,
    evaluation:
      "BMI 处于 P85–P95 区间，属于超重但未达肥胖标准，其他指标正常，建议在家庭端进行生活方式管理即可，无需临床干预。",
    plan:
      "饮食：控制零食与含糖饮料，晚餐八分饱。运动：每日 30 分钟户外活动。1 个月后校内复测身高体重。",
  },
];

const riskCls: Record<string, string> = {
  红: "bg-danger text-danger-foreground",
  橙: "bg-warm text-warm-foreground",
  黄: "bg-warning text-warning-foreground",
  绿: "bg-success text-success-foreground",
};

function ReviewPage() {
  const [tab, setTab] = useState<"待审核" | "高风险" | "已发布">("待审核");
  const list = tab === "高风险" ? drafts.filter((d) => d.flagged) : drafts;
  const [openId, setOpenId] = useState<string | null>(drafts[0]?.name ?? null);

  return (
    <div>
      <StatusBar title="报告审核" />
      <SubNav items={reviewSubNav} />
      <div className="mx-5 mt-2 rounded-xl bg-warm/10 p-3 text-[11px] leading-relaxed text-warm ring-1 ring-warm/20">
        高风险报告 100% 人工复核 · 语言不吓人、不空泛、有下一步 · 医生对医学判断负责
      </div>
      <div className="px-5 pt-3">
        <h1 className="text-xl font-bold">方案审核</h1>
        <p className="mb-3 text-xs text-muted-foreground">
          待审核 47 · 高风险 3 · 已发布 165
        </p>

        <div className="mb-4 inline-flex rounded-full bg-muted p-1 text-xs">
          {(["待审核", "高风险", "已发布"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-full px-4 py-1.5 ${
                tab === t ? "bg-surface font-semibold text-deep shadow-sm" : "text-muted-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <ul className="space-y-6 bg-muted/40 px-4 pb-8 pt-1">
        {list.map((d) => {
          const open = openId === d.name;
          return (
            <li key={d.name} className="space-y-3">
              {/* 患者信息卡 */}
              <div className="rounded-2xl bg-surface p-5 shadow-sm ring-1 ring-border/60">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-bold tracking-wide">{d.name}</p>
                    {d.consult && (
                      <span className="flex items-center gap-1 rounded-md bg-warm/15 px-1.5 py-0.5 text-[10px] text-warm">
                        {<EIcon e="👥" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />} 会诊查看
                      </span>
                    )}
                    <span className={`rounded-full px-2 py-0.5 text-[10px] ${riskCls[d.risk]}`}>
                      {d.risk}
                    </span>
                  </div>
                  <span className="rounded-full bg-teal/10 px-2.5 py-0.5 text-[11px] text-teal">
                    审核中
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "医院", value: d.hospital },
                    { label: "科室", value: d.dept },
                    { label: "评估时间", value: d.evalTime },
                    { label: "疾病", value: d.disease, accent: true },
                    { label: "方案状态", value: d.planStatus },
                    { label: "风险状态", value: d.riskStatus },
                  ].map((f) => (
                    <div key={f.label} className="rounded-xl bg-surface-2 px-3 py-2.5">
                      <p className="text-[11px] text-muted-foreground">{f.label}</p>
                      <p className={`mt-1 text-[13px] font-medium ${f.accent ? "text-teal" : "text-foreground"}`}>
                        {f.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 评估内容 */}
              <div className="rounded-2xl bg-surface p-5 shadow-sm ring-1 ring-border/60">
                <h3 className="mb-3 flex items-center gap-2 text-[15px] font-semibold">
                  <span className="text-teal">{<EIcon e="📄" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />}</span> 评估内容
                </h3>
                <p className="mb-2 text-[12px] text-muted-foreground">普通评估</p>
                <div className="rounded-xl bg-surface-2 p-4">
                  <p className={`text-[13px] leading-relaxed text-foreground/85 ${open ? "" : "line-clamp-4"}`}>
                    {d.evaluation}
                  </p>
                </div>
              </div>

              {/* 方案内容 */}
              <div className="rounded-2xl bg-surface p-5 shadow-sm ring-1 ring-border/60">
                <h3 className="mb-3 flex items-center gap-2 text-[15px] font-semibold">
                  <span className="text-teal">{<EIcon e="📄" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />}</span> 方案内容
                </h3>
                <div className="rounded-xl bg-surface-2 p-4">
                  <p className={`text-[13px] leading-relaxed text-foreground/85 ${open ? "" : "line-clamp-4"}`}>
                    {d.plan}
                  </p>
                </div>
                <button
                  onClick={() => setOpenId(open ? null : d.name)}
                  className={`mt-3 text-[12px] font-medium ${open ? "text-muted-foreground" : "text-teal"}`}
                >
                  {open ? "收起 ▴" : "展开全部 ▾"}
                </button>
              </div>

              {/* 查看患者详情 */}
              <Link to="/doctor/child" className="flex w-full items-center justify-between gap-3 rounded-2xl bg-surface p-4 text-left shadow-sm ring-1 ring-border/60">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-teal/10 text-base text-teal">
                    {<EIcon e="📈" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />}
                  </span>
                  <div>
                    <p className="text-[14px] font-semibold">查看患者详情</p>
                    <p className="text-[11px] text-muted-foreground">{d.name} 的完整档案</p>
                  </div>
                </div>
                <span className="text-muted-foreground">›</span>
              </Link>

              {/* 审核动作 */}
              <div className="flex gap-2 rounded-2xl bg-surface p-3 shadow-sm ring-1 ring-border/60">
                <ActionSheet
                  trigger={<button className="flex-1 rounded-xl bg-surface-2 py-2.5 text-xs">驳回补录</button>}
                  title={`驳回 ${d.name} 的方案？`}
                  description="将退回体检机构补录/复核，家长暂不会收到该报告。"
                  confirmText="确认驳回"
                  danger
                  toastMessage="已驳回 · 待机构补录"
                  toastType="warning"
                />
                <ActionSheet
                  trigger={<button className="flex-1 rounded-xl bg-warm/15 py-2.5 text-xs font-medium text-warm">修改方案</button>}
                  title="调整方案建议"
                  description="修改后系统建议不变，会额外保留一条医生建议供家长查看。"
                  confirmText="保存修改"
                  toastMessage="医生建议已保存"
                >
                  <textarea
                    rows={4}
                    defaultValue={`${d.name} 建议：${d.plan.slice(0, 60)}...`}
                    className="w-full rounded-xl bg-surface-2 p-3 text-xs outline-none"
                  />
                </ActionSheet>
                <ActionSheet
                  trigger={
                    <button className="flex-1 rounded-xl bg-deep py-2.5 text-xs font-medium text-deep-foreground">
                      审核发布
                    </button>
                  }
                  title={`确认发布 ${d.name} 的方案？`}
                  description={`风险等级：${d.risk} · 发布后家长立即收到通知，健管师同步接手。`}
                  confirmText="确认发布"
                  toastMessage="方案已发布 "
                  toastDescription={`${d.name} · 家长已收到通知`}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
