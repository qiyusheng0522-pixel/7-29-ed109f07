import { createFileRoute, Link } from "@tanstack/react-router";
import { StatusBar } from "@/components/MobileFrame";
import { SubNav, reviewSubNav } from "@/components/DoctorSubNav";
import { focusPool, riskColorMap } from "@/lib/mock-data";
import { useState } from "react";

export const Route = createFileRoute("/doctor/focus")({
  component: FocusPoolPage,
});

const tags = ["全部", "肥胖", "过敏", "呼吸", "睡眠", "超重"];

function FocusPoolPage() {
  const [t, setT] = useState("全部");
  const list = t === "全部" ? focusPool : focusPool.filter((s) => s.tag === t);

  return (
    <div>
      <StatusBar title="重点儿童池" />
      <SubNav items={reviewSubNav} />
      <div className="px-5 pt-3">
        <h1 className="text-xl font-bold">重点儿童池</h1>
        <p className="mb-3 text-xs text-muted-foreground">系统筛出 34 名 · 五色分层管理</p>

        {/* Legend */}
        <div className="mb-4 rounded-2xl bg-surface p-3 shadow-sm ring-1 ring-border/60">
          <p className="mb-2 text-[11px] text-muted-foreground">风险分层</p>
          <div className="grid grid-cols-5 gap-2 text-center">
            {[
              { c: "红", n: 3 },
              { c: "橙", n: 6 },
              { c: "黄", n: 18 },
              { c: "蓝", n: 5 },
              { c: "绿", n: 2 },
            ].map((r) => (
              <div key={r.c}>
                <div className={`mx-auto mb-1 h-2 w-full rounded-full ${riskColorMap[r.c].split(" ")[0]}`} />
                <p className="text-sm font-bold">{r.n}</p>
                <p className="text-[10px] text-muted-foreground">{r.c}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Filter */}
        <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
          {tags.map((k) => (
            <button
              key={k}
              onClick={() => setT(k)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] ${
                t === k ? "bg-deep text-deep-foreground" : "bg-surface ring-1 ring-border/60 text-muted-foreground"
              }`}
            >
              {k}
            </button>
          ))}
        </div>
      </div>

      <ul className="space-y-2 px-5 pb-8">
        {list.map((s) => (
          <li key={s.name} className="rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-border/60">
            <div className="flex items-start gap-3">
              <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-lg ${riskColorMap[s.level]}`}>
                {s.level}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold">{s.name}</p>
                  <span className="rounded-full bg-warm/10 px-2 py-0.5 text-[10px] text-warm">
                    # {s.tag}
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {s.school} · {s.class} · BMI {s.bmi}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Link to="/doctor/child" className="rounded-full bg-deep/10 px-3 py-1 text-[11px] text-deep">
                    查看档案
                  </Link>
                  <Link to="/doctor/plan" className="rounded-full bg-warm/10 px-3 py-1 text-[11px] text-warm">
                    编辑方案
                  </Link>
                  <Link to="/doctor/referral" className="rounded-full bg-teal/10 px-3 py-1 text-[11px] text-teal">
                    转诊
                  </Link>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
