import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, Settings } from "lucide-react";

import { EIcon } from "@/components/EIcon";
import { MobileFrame, StatusBar } from "@/components/MobileFrame";

export const Route = createFileRoute("/")({
  component: Landing,
});

const roles = [
  {
    to: "/parent",
    tint: "bg-warm text-warm-foreground",
    ring: "ring-warm/25",
    icon: <EIcon e="👨‍👩‍👧" />,
    title: "家长端",
    features: ["报告解读", "呵护任务", "健管师沟通"],
  },
  {
    to: "/school",
    tint: "bg-teal text-teal-foreground",
    ring: "ring-teal/25",
    icon: <EIcon e="🏫" />,
    title: "学校端",
    features: ["班级排程", "授权跟进", "现场协同"],
  },
  {
    to: "/doctor",
    tint: "bg-deep text-deep-foreground",
    ring: "ring-deep/25",
    icon: <EIcon e="🩺" />,
    title: "医生端",
    features: ["现场录检", "风险复核", "方案下发"],
  },
  {
    to: "/community",
    tint: "bg-rose text-rose-foreground",
    ring: "ring-rose/25",
    icon: <EIcon e="🏥" />,
    title: "社区端",
    features: ["服务包随访", "复诊转入", "宣教咨询"],
  },
] as const;

function Landing() {
  return (
    <MobileFrame bg="bg-surface-2">
      <StatusBar />
      {/* The whole picker is sized to fit one screen without scrolling, so the
          four role rows stay comparable at a glance. No page-wide gradient:
          colour comes only from the per-role tiles. */}
      <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
        <header className="mb-5 text-center">
          <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-[20px] bg-warm text-[26px] text-warm-foreground shadow-md shadow-warm/25">
            <EIcon e="🌤️" />
          </div>
          <h1 className="text-[24px] font-extrabold leading-tight tracking-tight text-foreground">
            阳光校园健康
          </h1>
          <p className="mt-1 text-[12px] text-muted-foreground">
            儿童体检 · 家校医协同 · 全周期呵护
          </p>
        </header>

        <div className="mb-3 flex items-center gap-2.5">
          <span className="h-px flex-1 bg-border" />
          <span className="text-[11px] font-medium tracking-wide text-muted-foreground">
            选择你的身份进入
          </span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <nav aria-label="选择身份" className="flex flex-col gap-2.5">
          {roles.map((r) => (
            <Link
              key={r.to}
              to={r.to}
              className={`group flex items-center gap-3.5 rounded-3xl bg-surface p-3.5 shadow-sm ring-1 transition hover:shadow-md active:scale-[0.985] ${r.ring}`}
            >
              <span
                className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-[21px] shadow-sm ${r.tint}`}
              >
                {r.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[16px] font-bold leading-tight">{r.title}</span>
                <span className="mt-1 block truncate text-[11px] text-muted-foreground">
                  {r.features.join(" · ")}
                </span>
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/60 transition group-hover:translate-x-0.5 group-hover:text-foreground" />
            </Link>
          ))}
        </nav>

        <Link
          to="/admin"
          className="mt-2.5 flex items-center gap-3 rounded-2xl border border-dashed border-border bg-surface/70 p-3 transition hover:border-solid hover:bg-surface"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground">
            <Settings className="h-4 w-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[10px] font-medium tracking-widest text-muted-foreground">
              PC · 后台管理系统
            </span>
            <span className="mt-0.5 block truncate text-[13px] font-bold">
              学生同步 · 体检规划 · 数据统计
            </span>
          </span>
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/60" />
        </Link>

        <p className="mt-auto pt-5 text-center text-[10px] text-muted-foreground/70">
          原型演示 · Mock 数据 · v0.1
        </p>
      </div>
    </MobileFrame>
  );
}
