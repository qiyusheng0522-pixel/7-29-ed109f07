import { createFileRoute, Link } from "@tanstack/react-router";
import { StatusBar } from "@/components/MobileFrame";

import { EIcon } from "@/components/EIcon";
export const Route = createFileRoute("/doctor/me")({
  component: DoctorMe,
});

const groups = [
  {
    title: "工作记录",
    items: [
      { icon: <EIcon e="📅" />, label: "体检任务记录", right: "本月 8 场" },
      { icon: <EIcon e="📝" />, label: "审核记录", right: "本月 165 份" },
      { icon: <EIcon e="🔄" />, label: "转诊 / 绿色通道", right: "3 例" },
      { icon: <EIcon e="📈" />, label: "复评随访", right: "查看" },
    ],
  },
  {
    title: "账号与说明",
    items: [
      { icon: <EIcon e="📩" />, label: "消息通知", right: "8 条未读" },
      { icon: <EIcon e="📜" />, label: "操作日志", right: "" },
      { icon: <EIcon e="❓" />, label: "帮助中心", right: "" },
    ],
  },
];

function DoctorMe() {
  return (
    <div>
      <StatusBar title="我的" />
      <div className="relative overflow-hidden px-5 pb-14 pt-4">
        <div className="absolute inset-0 -z-0 bg-gradient-to-br from-deep via-deep/80 to-teal" />
        <div className="relative flex items-center gap-4 text-white">
          <div className="grid h-16 w-16 place-items-center rounded-3xl bg-white/25 text-3xl backdrop-blur">
            {<EIcon e="🩺" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-lg font-bold">陈医生</p>
            <p className="text-xs text-white/80">阳光社区卫生服务中心 · 儿童保健科</p>
            <p className="mt-1 text-[11px] text-white/70">执业编号 4401****2201</p>
          </div>
        </div>
      </div>

      <div className="-mt-8 px-5 pb-8">
        <div className="mb-5 grid grid-cols-4 gap-2 rounded-2xl bg-surface p-3 shadow-sm ring-1 ring-border/60">
          {[
            { k: "在管学生", v: "1,240" },
            { k: "本月体检", v: "486" },
            { k: "审核", v: "165" },
            { k: "转诊", v: "3" },
          ].map((s) => (
            <div key={s.k} className="text-center">
              <p className="text-base font-extrabold text-deep">{s.v}</p>
              <p className="text-[11px] text-muted-foreground">{s.k}</p>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          {groups.map((g) => (
            <section key={g.title}>
              <p className="mb-2 px-1 text-xs text-muted-foreground">{g.title}</p>
              <ul className="divide-y divide-border/60 overflow-hidden rounded-2xl bg-surface shadow-sm ring-1 ring-border/60">
                {g.items.map((it) => (
                  <li key={it.label} className="flex items-center gap-3 px-4 py-3 active:bg-surface-2">
                    <span className="text-lg">{it.icon}</span>
                    <span className="flex-1 text-sm">{it.label}</span>
                    {it.right && <span className="text-[11px] text-muted-foreground">{it.right}</span>}
                    <span className="text-muted-foreground">›</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}

          <Link
            to="/"
            className="block w-full rounded-2xl bg-surface p-3 text-center text-sm text-muted-foreground shadow-sm ring-1 ring-border/60"
          >
            切换身份
          </Link>
        </div>
      </div>
    </div>
  );
}
