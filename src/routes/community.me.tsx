import { createFileRoute } from "@tanstack/react-router";
import { StatusBar } from "@/components/MobileFrame";

import { EIcon } from "@/components/EIcon";
export const Route = createFileRoute("/community/me")({
  component: MePage,
});

const kpis = [
  { label: "本月随访", value: "38 / 42" },
  { label: "咨询平均响应", value: "2.4 h" },
  { label: "宣教覆盖率", value: "86%" },
  { label: "满意度", value: "4.8 / 5" },
];

const groups = [
  {
    title: "工作台",
    items: [
      { icon: <EIcon e="📅" />, label: "我的排班", note: "本周 5 天门诊" },
      { icon: <EIcon e="🗂️" />, label: "服务包清单", note: "承接 46 份" },
      { icon: <EIcon e="🔁" />, label: "转诊对接", note: "上级医院联络本" },
    ],
  },
  {
    title: "培训与规范",
    items: [
      { icon: <EIcon e="📘" />, label: "儿童健康管理规范" },
      { icon: <EIcon e="🎓" />, label: "继教学时", note: "已完成 12 / 25" },
    ],
  },
  {
    title: "设置",
    items: [
      { icon: <EIcon e="🔔" />, label: "通知偏好" },
      { icon: <EIcon e="👤" />, label: "个人信息" },
      { icon: <EIcon e="🔄" />, label: "退出登录" },
    ],
  },
];

function MePage() {
  return (
    <div>
      <StatusBar title="我的" />
      <div className="px-5 pb-8 pt-2">
        <div className="rounded-3xl bg-gradient-to-br from-warm/30 to-teal/15 p-4 ring-1 ring-warm/20">
          <div className="flex items-center gap-3">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-warm text-2xl text-warm-foreground">
              {<EIcon e="🩺" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />}
            </div>
            <div>
              <p className="text-base font-bold">张医生</p>
              <p className="text-[11px] text-muted-foreground">
                阳光社区卫生服务中心 · 全科 · 主治医师
              </p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {kpis.map((k) => (
              <div key={k.label} className="rounded-xl bg-surface/80 p-2">
                <p className="text-[10px] text-muted-foreground">{k.label}</p>
                <p className="text-sm font-semibold">{k.value}</p>
              </div>
            ))}
          </div>
        </div>

        {groups.map((g) => (
          <div key={g.title} className="mt-5">
            <p className="mb-2 text-xs text-muted-foreground">{g.title}</p>
            <ul className="overflow-hidden rounded-2xl bg-surface shadow-sm ring-1 ring-border/60">
              {g.items.map((it) => (
                <li
                  key={it.label}
                  className="flex items-center gap-3 border-b border-border/60 px-3 py-3 last:border-b-0"
                >
                  <span className="text-lg">{it.icon}</span>
                  <span className="flex-1 text-sm">{it.label}</span>
                  {it.note && (
                    <span className="text-[11px] text-muted-foreground">
                      {it.note}
                    </span>
                  )}
                  <span className="text-muted-foreground">›</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
