import { createFileRoute, Link } from "@tanstack/react-router";
import { StatusBar } from "@/components/MobileFrame";
import { ActionSheet } from "@/components/ActionSheet";
import { useState } from "react";

import { EIcon } from "@/components/EIcon";
export const Route = createFileRoute("/parent/record")({
  component: RecordPage,
});

type Tab = "体重" | "饮食" | "运动" | "睡眠" | "症状";
const tabs: Tab[] = ["体重", "饮食", "运动", "睡眠", "症状"];

function RecordPage() {
  const [tab, setTab] = useState<Tab>("体重");
  return (
    <div>
      <StatusBar title="记录" />
      <div className="px-5 pb-8 pt-2">
        <header className="mb-3">
          <h1 className="text-xl font-bold">今天记一笔</h1>
          <p className="text-xs text-muted-foreground">每天 1 分钟，让呵护更有据可依 · 连续 12 天</p>
        </header>

        <div className="mb-4 -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-xs transition ${
                tab === t
                  ? "bg-warm text-warm-foreground shadow-sm"
                  : "bg-surface text-muted-foreground ring-1 ring-border/60"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "体重" && <WeightForm />}
        {tab === "饮食" && <DietForm />}
        {tab === "运动" && <SportForm />}
        {tab === "睡眠" && <SleepForm />}
        {tab === "症状" && <SymptomForm />}

        {/* Streak / recent */}
        <section className="mt-5 rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-border/60">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">最近 7 天</h2>
            <Link to="/parent/report" className="text-xs text-warm">查看趋势 →</Link>
          </div>
          <div className="grid grid-cols-7 gap-1.5 text-center">
            {["一","二","三","四","五","六","日"].map((d, i) => (
              <div key={d} className="flex flex-col items-center gap-1">
                <span className="text-[10px] text-muted-foreground">{d}</span>
                <span
                  className={`grid h-8 w-8 place-items-center rounded-xl text-[11px] ${
                    i < 5 ? "bg-warm/20 text-warm" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {i < 5 ? "" : "·"}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-3 rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-border/60">
      {children}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-xs text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}

function Chip({ children, active }: { children: React.ReactNode; active?: boolean }) {
  // 让每个选项可点选，点击切换选中态提供即时反馈
  const [on, setOn] = useState(!!active);
  return (
    <button
      onClick={() => setOn((v) => !v)}
      className={`rounded-full px-3 py-1.5 text-xs ring-1 transition ${
        on
          ? "bg-warm text-warm-foreground ring-warm"
          : "bg-surface-2 text-foreground ring-border/60"
      }`}
    >
      {children}
    </button>
  );
}

function WeightForm() {
  return (
    <Card>
      <Row label="今日体重 (kg)">
        <input defaultValue="27.5" className="w-full rounded-xl bg-surface-2 px-3 py-2.5 text-lg font-semibold outline-none" />
      </Row>
      <Row label="腰围 cm（选填）">
        <input placeholder="选填" className="w-full rounded-xl bg-surface-2 px-3 py-2.5 outline-none" />
      </Row>
      <ActionSheet
        trigger={<button className="w-full rounded-xl bg-warm py-2.5 text-sm font-medium text-warm-foreground">保存本周体重</button>}
        title="保存本周体重"
        description="体重会加入孩子的成长曲线，用于评估是否偏轻/超重。"
        confirmText="保存"
        toastMessage="本周体重已记录 "
        toastDescription="27.5 kg · BMI 已同步更新"
      />
      
      <p className="text-[11px] text-muted-foreground">{<EIcon e="💡" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />} 建议每周固定时间称一次，比如周日早晨起床后。</p>
    </Card>
  );
}

function DietForm() {
  return (
    <Card>
      <Row label="今天喝含糖饮料了吗？">
        <div className="flex gap-2">
          <Chip active>没有 {<EIcon e="👍" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />}</Chip>
          <Chip>1 杯</Chip>
          <Chip>2 杯以上</Chip>
        </div>
      </Row>
      <Row label="早餐">
        <div className="flex gap-2">
          <Chip active>正常吃</Chip>
          <Chip>吃得少</Chip>
          <Chip>没吃</Chip>
        </div>
      </Row>
      <Row label="今天吃到蔬菜了吗？">
        <div className="flex gap-2">
          <Chip active>吃到了</Chip>
          <Chip>很少</Chip>
        </div>
      </Row>
      <Row label="夜宵">
        <div className="flex gap-2">
          <Chip active>没吃</Chip>
          <Chip>吃了</Chip>
        </div>
      </Row>
      <ActionSheet
        trigger={<button className="w-full rounded-xl bg-warm py-2.5 text-sm font-medium text-warm-foreground">保存今日饮食</button>}
        title="保存今日饮食"
        confirmText="保存"
        toastMessage="今日饮食已记录 "
        toastDescription="含糖饮料：0 · 早餐正常 · 蔬菜达标"
      />
    </Card>
  );
}

function SportForm() {
  return (
    <Card>
      <Row label="运动类型">
        <div className="flex flex-wrap gap-2">
          <Chip active>户外玩耍</Chip>
          <Chip>跑步</Chip>
          <Chip>球类</Chip>
          <Chip>骑行</Chip>
          <Chip>游泳</Chip>
        </div>
      </Row>
      <Row label="运动时长">
        <div className="flex gap-2">
          <Chip>&lt;30 分</Chip>
          <Chip active>30—60 分</Chip>
          <Chip>&gt;60 分</Chip>
        </div>
      </Row>
      <Row label="运动后是否不适？">
        <div className="flex flex-wrap gap-2">
          <Chip active>没有</Chip>
          <Chip>咳嗽</Chip>
          <Chip>胸闷</Chip>
          <Chip>喘息</Chip>
          <Chip>膝盖痛</Chip>
        </div>
      </Row>
      <ActionSheet
        trigger={<button className="w-full rounded-xl bg-warm py-2.5 text-sm font-medium text-warm-foreground">保存今日运动</button>}
        title="保存今日运动"
        confirmText="保存"
        toastMessage="运动记录已保存 "
        toastDescription="户外玩耍 · 30—60 分钟 · 无不适"
      />
    </Card>
  );
}

function SleepForm() {
  return (
    <Card>
      <div className="grid grid-cols-3 gap-2 text-center">
        {[["上床","21:40"],["入睡","22:00"],["起床","07:00"]].map(([k,v]) => (
          <div key={k} className="rounded-xl bg-surface-2 p-3">
            <p className="text-[11px] text-muted-foreground">{k}</p>
            <p className="mt-1 text-base font-semibold">{v}</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl bg-teal/10 p-3 text-xs text-deep">
        本次睡眠 <span className="font-bold">9 小时</span> · 符合学龄儿童建议
      </div>
      <Row label="夜间有出现下列情况吗？">
        <div className="flex flex-wrap gap-2">
          <Chip active>没有</Chip>
          <Chip>咳嗽</Chip>
          <Chip>鼻塞</Chip>
          <Chip>打鼾</Chip>
        </div>
      </Row>
      <ActionSheet
        trigger={<button className="w-full rounded-xl bg-warm py-2.5 text-sm font-medium text-warm-foreground">保存今日睡眠</button>}
        title="保存今日睡眠"
        confirmText="保存"
        toastMessage="今日睡眠已记录 "
        toastDescription="睡眠 9 小时 · 符合学龄建议"
      />
    </Card>
  );
}

function SymptomForm() {
  return (
    <Card>
      <Row label="今天孩子出现了？（可多选）">
        <div className="flex flex-wrap gap-2">
          <Chip>咳嗽</Chip>
          <Chip>喘息</Chip>
          <Chip>胸闷</Chip>
          <Chip>夜间咳醒</Chip>
          <Chip>鼻塞流涕</Chip>
          <Chip>头晕</Chip>
        </div>
      </Row>
      <Row label="可能的诱因">
        <div className="flex flex-wrap gap-2">
          <Chip>尘螨</Chip>
          <Chip>花粉</Chip>
          <Chip>宠物</Chip>
          <Chip>冷空气</Chip>
          <Chip>烟味</Chip>
          <Chip>霉菌</Chip>
        </div>
      </Row>
      <textarea
        placeholder="补充说明（选填）"
        className="w-full rounded-xl bg-surface-2 p-3 text-sm outline-none"
        rows={3}
      />
      <div className="flex gap-2">
        <ActionSheet
          trigger={<button className="flex-1 rounded-xl bg-warm py-2.5 text-sm font-medium text-warm-foreground">保存记录</button>}
          title="保存症状记录"
          description="健管师会在下次随访时查看这条记录。若持续或加重，我们会主动联系你。"
          confirmText="保存"
          toastMessage="症状已记录 · 健管师将查看"
        />
        <Link to="/parent/comm" className="rounded-xl bg-surface-2 px-4 py-2.5 text-sm font-medium">
          问健管师
        </Link>
      </div>
      <p className="rounded-xl bg-warm/10 px-3 py-2 text-[11px] text-warm">
        {<EIcon e="⚠️" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />} 若出现呼吸困难或喘息持续不缓解，请立即联系健康管理师或就近就医。
      </p>
    </Card>
  );
}
