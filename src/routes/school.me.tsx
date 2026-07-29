import { createFileRoute, Link } from "@tanstack/react-router";
import { StatusBar } from "@/components/MobileFrame";

import { EIcon } from "@/components/EIcon";
export const Route = createFileRoute("/school/me")({
  component: SchoolMe,
});

const groups = [
  {
    title: "校内协同",
    items: [
      { icon: <EIcon e="👨‍🏫" />, label: "班主任任务", right: "12 项进行中", to: "/school/intasks" as const },
      { icon: <EIcon e="🏥" />, label: "校医任务", right: "3 项待处理", to: "/school/intasks" as const },
      { icon: <EIcon e="⚽" />, label: "体育老师任务", right: "5 项", to: "/school/intasks" as const },
      { icon: <EIcon e="🍱" />, label: "食堂 / 后勤（P1）", right: "计划中", to: "/school/intasks" as const },
      { icon: <EIcon e="🚨" />, label: "异常上报", right: "3 步流转", to: "/school/abnormal" as const },
      { icon: <EIcon e="📈" />, label: "学生变化观察", right: "查看趋势", to: "/school/observe" as const },
    ],
  },
  {
    title: "报告与家长",
    items: [
      { icon: <EIcon e="📊" />, label: "报告中心", right: "89 家长未读", to: "/school/report" as const },
      { icon: <EIcon e="📩" />, label: "家长通知与授权", right: "18 未授权", to: "/school/notify" as const },
      { icon: <EIcon e="🏥" />, label: "缺检与补检", right: "4 待安排", to: "/school/absent" as const },
    ],
  },
  {
    title: "账号与说明",
    items: [
      { icon: <EIcon e="🏫" />, label: "当前学校", right: "阳光小学" },
      { icon: <EIcon e="👤" />, label: "当前角色", right: "卫生保健老师" },
      { icon: <EIcon e="🔔" />, label: "消息通知", right: "5 条未读" },
      { icon: <EIcon e="📜" />, label: "操作记录", right: "" },
      { icon: <EIcon e="🔒" />, label: "权限说明", right: "看任务不看隐私" },
      { icon: <EIcon e="❓" />, label: "帮助中心", right: "" },
    ],
  },
];

function SchoolMe() {
  return (
    <div>
      <StatusBar title="我的" />
      <div className="relative overflow-hidden px-5 pb-14 pt-4">
        <div className="absolute inset-0 -z-0 bg-gradient-to-br from-teal via-teal/70 to-deep" />
        <div className="relative flex items-center gap-4 text-white">
          <div className="grid h-16 w-16 place-items-center rounded-3xl bg-white/25 text-3xl backdrop-blur">
            {<EIcon e="👨‍🏫" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-lg font-bold">张老师</p>
            <p className="text-xs text-white/80">阳光小学 · 卫生保健老师</p>
            <p className="mt-1 text-[10px] text-white/70">看全校进度、统计、任务完成情况</p>
          </div>
        </div>
      </div>

      <div className="-mt-8 px-5 pb-8">
        <div className="mb-5 grid grid-cols-3 gap-2 rounded-2xl bg-surface p-3 shadow-sm ring-1 ring-border/60">
          {[
            { k: "本学期体检", v: "486" },
            { k: "跟进任务", v: "24" },
            { k: "完成率", v: "78%" },
          ].map((s) => (
            <div key={s.k} className="text-center">
              <p className="text-lg font-extrabold text-teal">{s.v}</p>
              <p className="text-[11px] text-muted-foreground">{s.k}</p>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          {groups.map((g) => (
            <section key={g.title}>
              <p className="mb-2 px-1 text-xs text-muted-foreground">{g.title}</p>
              <ul className="divide-y divide-border/60 overflow-hidden rounded-2xl bg-surface shadow-sm ring-1 ring-border/60">
                {g.items.map((it) => {
                  const inner = (
                    <>
                      <span className="text-lg">{it.icon}</span>
                      <span className="flex-1 text-sm">{it.label}</span>
                      {it.right && <span className="text-[11px] text-muted-foreground">{it.right}</span>}
                      <span className="text-muted-foreground">›</span>
                    </>
                  );
                  return "to" in it && it.to ? (
                    <Link key={it.label} to={it.to} className="flex items-center gap-3 px-4 py-3 active:bg-surface-2">
                      {inner}
                    </Link>
                  ) : (
                    <li key={it.label} className="flex items-center gap-3 px-4 py-3 active:bg-surface-2">
                      {inner}
                    </li>
                  );
                })}
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
