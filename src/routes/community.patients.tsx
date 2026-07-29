import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { StatusBar } from "@/components/MobileFrame";
import { patients } from "@/lib/community-patients";

export const Route = createFileRoute("/community/patients")({
  component: PatientsPage,
});

type Filter = "全部" | "服务包" | "复诊转入";

function PatientsPage() {
  const [src, setSrc] = useState<Filter>("全部");
  const list = patients.filter((p) => src === "全部" || p.src === src);
  return (
    <div>
      <StatusBar title="居民健康档案" />
      <div className="px-5 pb-8 pt-2">
        <h1 className="text-xl font-bold">在管儿童患者</h1>
        <p className="mb-3 text-xs text-muted-foreground">
          服务包 · 复诊转入 · 全部支持家庭随访与耗材配送
        </p>

        <div className="mb-3 flex gap-2">
          {(["全部", "服务包", "复诊转入"] as Filter[]).map((k) => (
            <button
              key={k}
              onClick={() => setSrc(k)}
              className={`rounded-full px-3 py-1 text-[12px] ring-1 ${
                src === k
                  ? "bg-warm text-warm-foreground ring-transparent"
                  : "bg-surface ring-border"
              }`}
            >
              {k}
            </button>
          ))}
        </div>

        <ul className="space-y-3">
          {list.map((p) => (
            <li
              key={p.id}
              className="rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-border/60"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold">
                    {p.name}
                    <span className="ml-2 text-[11px] text-muted-foreground">
                      {p.age} 岁 · {p.gender}
                    </span>
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{p.from}</p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] ${
                    p.src === "服务包"
                      ? "bg-warm/15 text-warm"
                      : "bg-teal/15 text-teal"
                  }`}
                >
                  {p.src}
                </span>
              </div>

              <p className="mt-2 rounded-xl bg-surface-2 p-2 text-[12px]">
                {p.plan} · {p.planStage}
              </p>

              <div className="mt-2 flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground">下次任务：{p.next}</span>
                <span
                  className={
                    p.adherence >= 80
                      ? "text-teal"
                      : p.adherence >= 60
                      ? "text-warm"
                      : "text-rose"
                  }
                >
                  执行率 {p.adherence}%
                </span>
              </div>

              <div className="mt-2 flex flex-wrap gap-1">
                {p.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded bg-surface-2 px-1.5 py-0.5 text-[10px] text-muted-foreground"
                  >
                    {t}
                  </span>
                ))}
              </div>

              <div className="mt-3 flex gap-2">
                <Link
                  to="/community/patient/$id"
                  params={{ id: p.id }}
                  className="flex-1 rounded-xl bg-warm py-2 text-center text-xs font-medium text-warm-foreground"
                >
                  查看档案
                </Link>
                <Link
                  to="/community/patient/$id"
                  params={{ id: p.id }}
                  className="flex-1 rounded-xl bg-teal/15 py-2 text-center text-xs text-teal"
                >
                  记录随访
                </Link>
                <button
                  onClick={() => toast(`正在联系 ${p.name} 家长`, { description: "已发起电话呼叫" })}
                  className="flex-1 rounded-xl bg-surface-2 py-2 text-xs"
                >
                  联系家长
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
