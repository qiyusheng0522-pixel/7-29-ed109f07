import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { StatusBar } from "@/components/MobileFrame";
import { RiskLevelSheet } from "@/components/RiskLevelSheet";
import { riskByKey, type RiskKey } from "@/lib/risk-levels";

export const Route = createFileRoute("/community/risk")({
  component: RiskPage,
});

type Dept = "呼吸科" | "肥胖科";

type Risk = {
  id: string;
  name: string;
  gender: "男" | "女";
  age: number;
  level: RiskKey;
  dept: Dept;
  summary: string;
  from: string;
  issues: { title: string; value: string; ref: string; note: string }[];
  advice: string;
};


const risks: Risk[] = [
  {
    id: "liu",
    name: "刘小强",
    gender: "男",
    age: 10,
    level: "高风险",
    dept: "肥胖科",
    summary: "BMI ≥ P95 · 轻度脂肪肝 · 腰围超标",
    from: "服务包随访 04-12 上传体脂秤数据",
    issues: [
      { title: "BMI", value: "24.6", ref: "P95 (≤ 19.0)", note: "连续 3 次随访均高于 P95，减重速度未达目标" },
      { title: "腰围", value: "72 cm", ref: "≤ 68 cm", note: "中心性肥胖，代谢风险偏高" },
      { title: "肝脏 B 超", value: "轻度脂肪肝", ref: "正常", note: "体检发现，需专科评估肝功与代谢指标" },
      { title: "体脂率", value: "28%", ref: "≤ 20%", note: "家长体脂秤上传，趋势下降缓慢" },
    ],
    advice: "建议转诊儿童医院肥胖（内分泌）专科门诊，完善肝功、血脂、口服糖耐量评估。",
  },
  {
    id: "chen",
    name: "陈小美",
    gender: "女",
    age: 9,
    level: "高风险",
    dept: "呼吸科",
    summary: "哮喘部分控制 · FeNO 升高 · 用药依从 65%",
    from: "复诊转入 · 家长端打卡与雾化记录",
    issues: [
      { title: "呼出气 NO (FeNO)", value: "38 ppb", ref: "< 20 ppb", note: "气道炎症未控制" },
      { title: "夜间咳嗽", value: "1 次/周", ref: "0 次/周", note: "夜间症状反复，影响睡眠" },
      { title: "吸入用药依从", value: "65%", ref: "≥ 80%", note: "晚间常漏吸，家长已多次提醒" },
      { title: "肺部听诊", value: "偶闻哮鸣音", ref: "呼吸音清", note: "运动后出现轻微喘息" },
    ],
    advice: "建议转诊儿童医院呼吸科，复评哮喘控制水平并调整维持吸入方案。",
  },
  {
    id: "zhang",
    name: "张小乐",
    gender: "男",
    age: 6,
    level: "较高风险",
    dept: "呼吸科",
    summary: "中度过敏性鼻炎 · 扁桃体 II 度 · 依从 48%",
    from: "区妇幼下转 · 祖母代为照护",
    issues: [
      { title: "鼻塞 / 喷嚏", value: "每日晨起", ref: "偶发", note: "症状持续，夜间张口呼吸" },
      { title: "用药记录", value: "3 次/周", ref: "每日", note: "鼻喷激素漏用较多，依从率 48%" },
      { title: "扁桃体", value: "II 度肥大", ref: "≤ I 度", note: "需评估是否影响睡眠通气" },
    ],
    advice: "建议转诊儿童医院呼吸科 / 耳鼻喉联合评估睡眠呼吸情况。",
  },
];

function RiskPage() {
  const [tab, setTab] = useState<"全部" | Dept>("全部");
  const [open, setOpen] = useState<string | null>(null);
  const [pushed, setPushed] = useState<Record<string, Dept>>({});
  const list = risks.filter((r) => tab === "全部" || r.dept === tab);

  return (
    <div>
      <StatusBar title="风险患儿" />
      <div className="px-5 pb-10 pt-2">
        <h1 className="text-xl font-bold">风险患儿</h1>
        <p className="mb-3 text-xs text-muted-foreground">
          社区在管中存在高风险指标的儿童 · 可一键推送至儿童医院对应专科
        </p>

        <div className="mb-3 flex gap-2">
          {(["全部", "呼吸科", "肥胖科"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`rounded-full px-3 py-1 text-[12px] ring-1 ${
                tab === k ? "bg-rose text-rose-foreground ring-transparent" : "bg-surface ring-border"
              }`}
            >
              {k}
              <span className="ml-1 opacity-70">
                {k === "全部" ? risks.length : risks.filter((r) => r.dept === k).length}
              </span>
            </button>
          ))}
        </div>

        <ul className="space-y-3">
          {list.map((r) => {
            const expanded = open === r.id;
            return (
              <li key={r.id} className="rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-border/60">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold">
                      {r.name}
                      <span className="ml-2 text-[11px] text-muted-foreground">
                        {r.age} 岁 · {r.gender}
                      </span>
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{r.from}</p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] ${
                      r.level === "高风险" ? "bg-rose/15 text-rose" : "bg-warm/15 text-warm"
                    }`}
                  >
                    {r.level}
                  </span>
                </div>

                <p className="mt-2 rounded-xl bg-surface-2 p-2 text-[12px]">
                  <span className="font-medium">风险问题：</span>
                  {r.summary}
                </p>

                <div className="mt-2 flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">建议专科：{r.dept}</span>
                  {pushed[r.id] && <span className="text-teal">已推送 · {pushed[r.id]}</span>}
                </div>

                {expanded && (
                  <div className="mt-3 space-y-2 rounded-xl bg-surface-2 p-3">
                    <p className="text-[12px] font-semibold">风险问题明细</p>
                    {r.issues.map((i) => (
                      <div key={i.title} className="rounded-lg bg-surface p-2 ring-1 ring-border/60">
                        <div className="flex items-baseline justify-between">
                          <span className="text-[12px] font-medium">{i.title}</span>
                          <span className="text-[12px] text-rose">{i.value}</span>
                        </div>
                        <p className="mt-0.5 text-[10px] text-muted-foreground">
                          参考：{i.ref} · {i.note}
                        </p>
                      </div>
                    ))}
                    <p className="text-[11px] text-muted-foreground">{r.advice}</p>
                  </div>
                )}

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => setOpen(expanded ? null : r.id)}
                    className="flex-1 rounded-xl bg-surface-2 py-2 text-xs"
                  >
                    {expanded ? "收起风险问题" : "查看风险问题"}
                  </button>
                  <button
                    onClick={() => {
                      setPushed((p) => ({ ...p, [r.id]: r.dept }));
                      toast(`已推送至南京市儿童医院 · ${r.dept}`, {
                        description: `${r.name} 的风险问题与档案已同步，等待专科接单`,
                      });
                    }}
                    className="flex-1 rounded-xl bg-rose py-2 text-center text-xs font-medium text-rose-foreground"
                  >
                    一键推送 · {r.dept}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
