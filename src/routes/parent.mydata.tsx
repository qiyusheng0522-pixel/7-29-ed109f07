import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { StatusBar } from "@/components/MobileFrame";
import { ActionSheet } from "@/components/ActionSheet";
import { toast } from "sonner";

import { EIcon } from "@/components/EIcon";
export const Route = createFileRoute("/parent/mydata")({
  component: MyDataPage,
});

type Metric = {
  id: string;
  icon: import("react").ReactNode;
  label: string;
  unit: string;
  latest: string;
  updated: string;
  tint: "warm" | "teal" | "rose" | "success" | "deep";
  fields: { name: string; placeholder?: string; type?: string; options?: string[] }[];
};

const metrics: Metric[] = [
  {
    id: "weight",
    icon: <EIcon e="⚖️" />,
    label: "身高体重",
    unit: "kg / cm",
    latest: "28.6 kg · 128 cm",
    updated: "今晨",
    tint: "warm",
    fields: [
      { name: "体重 (kg)", type: "number", placeholder: "如 28.6" },
      { name: "身高 (cm)", type: "number", placeholder: "如 128" },
    ],
  },
  {
    id: "bmi",
    icon: <EIcon e="📈" />,
    label: "BMI / 体脂率",
    unit: "kg/m² / %",
    latest: "17.4 · 18%",
    updated: "今晨",
    tint: "teal",
    fields: [
      { name: "BMI", type: "number", placeholder: "如 17.4" },
      { name: "体脂率 (%)", type: "number", placeholder: "如 18" },
    ],
  },
  {
    id: "sleep",
    icon: <EIcon e="😴" />,
    label: "睡眠时长",
    unit: "小时",
    latest: "9 h 20 m",
    updated: "昨夜",
    tint: "deep",
    fields: [
      { name: "入睡时间", type: "time" },
      { name: "起床时间", type: "time" },
      { name: "夜醒次数", type: "number" },
    ],
  },
  {
    id: "sport",
    icon: <EIcon e="🏃" />,
    label: "运动 / 步数",
    unit: "分钟 / 步",
    latest: "42 分钟 · 6820 步",
    updated: "今日",
    tint: "success",
    fields: [
      { name: "运动类型", options: ["跳绳", "跑步", "球类", "游泳", "其他"] },
      { name: "时长 (分钟)", type: "number" },
      { name: "步数", type: "number" },
    ],
  },
  {
    id: "diet",
    icon: <EIcon e="🥗" />,
    label: "饮食 / 饮水",
    unit: "kcal / ml",
    latest: "1420 kcal · 900 ml",
    updated: "今日",
    tint: "warm",
    fields: [
      { name: "餐次", options: ["早餐", "午餐", "晚餐", "加餐"] },
      { name: "热量 (kcal)", type: "number" },
      { name: "饮水量 (ml)", type: "number" },
    ],
  },
  {
    id: "vision",
    icon: <EIcon e="👀" />,
    label: "视力自测",
    unit: "裸眼",
    latest: "L 4.9 / R 5.0",
    updated: "本月",
    tint: "rose",
    fields: [
      { name: "左眼", placeholder: "如 4.9" },
      { name: "右眼", placeholder: "如 5.0" },
      { name: "是否佩戴矫正", options: ["否", "框架眼镜", "隐形眼镜", "OK 镜"] },
    ],
  },
];

type Device = {
  id: string;
  icon: import("react").ReactNode;
  name: string;
  brand: string;
  connected: boolean;
  data: string;
};

const initialDevices: Device[] = [
  { id: "scale", icon: <EIcon e="⚖️" />, name: "智能体脂秤", brand: "小米 · S400", connected: true, data: "自动同步体重 / BMI / 体脂率" },
  { id: "band", icon: "⌚", name: "儿童手表 / 手环", brand: "华为 Watch Kids 5", connected: true, data: "自动同步心率 / 睡眠 / 步数 / 运动" },
  { id: "vision", icon: <EIcon e="👓" />, name: "视力自测仪", brand: "护眼宝 · V1", connected: false, data: "在家自测视力并生成趋势" },
];

function MyDataPage() {
  const [devices, setDevices] = useState(initialDevices);
  const toggle = (id: string) =>
    setDevices((p) =>
      p.map((d) => (d.id === id ? { ...d, connected: !d.connected } : d)),
    );

  return (
    <div>
      <StatusBar title="我的数据" />
      <div className="px-5 pb-10 pt-2">
        <h1 className="text-xl font-bold">我的数据</h1>
        <p className="mb-3 text-xs text-muted-foreground">
          记录孩子日常健康数据，支持手动录入或从智能设备自动同步。
        </p>

        {/* 概览 */}
        <div className="mb-4 grid grid-cols-3 gap-2">
          <div className="rounded-2xl bg-surface p-3 ring-1 ring-border/60">
            <p className="text-[11px] text-muted-foreground">已记录项</p>
            <p className="mt-0.5 text-lg font-bold text-warm">{metrics.length}</p>
          </div>
          <div className="rounded-2xl bg-surface p-3 ring-1 ring-border/60">
            <p className="text-[11px] text-muted-foreground">连接设备</p>
            <p className="mt-0.5 text-lg font-bold text-teal">
              {devices.filter((d) => d.connected).length}
            </p>
          </div>
          <div className="rounded-2xl bg-surface p-3 ring-1 ring-border/60">
            <p className="text-[11px] text-muted-foreground">本周同步</p>
            <p className="mt-0.5 text-lg font-bold text-success">28</p>
          </div>
        </div>

        {/* 手动录入 */}
        <section className="mb-4">
          <div className="mb-2 flex items-center justify-between px-1">
            <h2 className="text-sm font-semibold">健康指标</h2>
            <span className="text-[11px] text-muted-foreground">点击卡片录入</span>
          </div>
          <ul className="grid grid-cols-2 gap-2">
            {metrics.map((m) => (
              <li key={m.id}>
                <ActionSheet
                  trigger={
                    <button className="w-full rounded-2xl bg-surface p-3 text-left shadow-sm ring-1 ring-border/60 active:bg-surface-2">
                      <div className="flex items-center gap-2">
                        <span className={`grid h-8 w-8 place-items-center rounded-xl bg-${m.tint}/15 text-base`}>
                          {m.icon}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] font-semibold">{m.label}</p>
                          <p className="text-[10px] text-muted-foreground">{m.unit}</p>
                        </div>
                      </div>
                      <p className="mt-2 truncate text-[12px] font-medium">{m.latest}</p>
                      <p className="text-[10px] text-muted-foreground">更新 · {m.updated}</p>
                    </button>
                  }
                  title={`录入 ${m.label}`}
                  description={`单位：${m.unit}`}
                  confirmText="保存"
                  toastMessage="数据已保存 "
                >
                  <div className="space-y-2 text-xs">
                    <label className="block">
                      <span className="text-muted-foreground">测量时间</span>
                      <input
                        type="datetime-local"
                        className="mt-1 w-full rounded-xl bg-surface-2 px-3 py-2 outline-none"
                      />
                    </label>
                    {m.fields.map((f) => (
                      <label key={f.name} className="block">
                        <span className="text-muted-foreground">{f.name}</span>
                        {f.options ? (
                          <select className="mt-1 w-full rounded-xl bg-surface-2 px-3 py-2 outline-none">
                            {f.options.map((o) => (
                              <option key={o}>{o}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={f.type ?? "text"}
                            step={f.type === "number" ? "0.1" : undefined}
                            placeholder={f.placeholder}
                            className="mt-1 w-full rounded-xl bg-surface-2 px-3 py-2 outline-none"
                          />
                        )}
                      </label>
                    ))}
                    <label className="block">
                      <span className="text-muted-foreground">数据来源</span>
                      <select className="mt-1 w-full rounded-xl bg-surface-2 px-3 py-2 outline-none">
                        <option>手动录入</option>
                        <option>智能设备同步</option>
                        <option>医疗机构上传</option>
                      </select>
                    </label>
                  </div>
                </ActionSheet>
              </li>
            ))}
          </ul>
        </section>

        {/* 智能设备 */}
        <section>
          <div className="mb-2 flex items-center justify-between px-1">
            <h2 className="text-sm font-semibold">智能设备</h2>
            <ActionSheet
              trigger={<button className="text-[11px] text-warm">+ 添加设备</button>}
              title="添加智能设备"
              description="通过蓝牙自动扫描附近可绑定的健康设备"
              confirmText="开始扫描"
              toastMessage="正在扫描附近设备…"
              toastType="info"
            >
              <div className="space-y-2 text-xs">
                <div className="rounded-xl bg-surface-2 p-3">
                  <p className="font-medium">支持类型</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    体脂秤 / 儿童手表 / 儿童手环 / 视力自测仪 / 身高测量仪
                  </p>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  请确保设备已开机，并处于蓝牙可发现状态。
                </p>
              </div>
            </ActionSheet>
          </div>
          <ul className="space-y-2">
            {devices.map((d) => (
              <li
                key={d.id}
                className="flex items-center gap-3 rounded-2xl bg-surface p-3 shadow-sm ring-1 ring-border/60"
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-surface-2 text-lg">
                  {d.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-[13px] font-semibold">{d.name}</p>
                    {d.connected && (
                      <span className="rounded-full bg-success/15 px-1.5 py-0.5 text-[10px] text-success">
                        已连接
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground">{d.brand}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{d.data}</p>
                </div>
                <button
                  onClick={() => {
                    toggle(d.id);
                    toast[d.connected ? "info" : "success"](
                      d.connected ? "已断开设备" : "设备已连接 ",
                    );
                  }}
                  className={`shrink-0 rounded-full px-3 py-1 text-[11px] ${
                    d.connected
                      ? "bg-surface-2 text-muted-foreground ring-1 ring-border"
                      : "bg-warm text-warm-foreground"
                  }`}
                >
                  {d.connected ? "断开" : "连接"}
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-3 rounded-xl bg-surface-2 px-3 py-2 text-[11px] text-muted-foreground">
            {<EIcon e="🔒" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />} 智能设备数据经家长授权后同步至孩子健康档案，未授权不会外发。
          </p>
        </section>
      </div>
    </div>
  );
}
