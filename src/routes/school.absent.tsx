import { createFileRoute, Link } from "@tanstack/react-router";
import { StatusBar } from "@/components/MobileFrame";
import { useState } from "react";
import { toast } from "sonner";

import { EIcon } from "@/components/EIcon";
export const Route = createFileRoute("/school/absent")({
  component: AbsentPage,
});

type A = {
  name: string;
  class: string;
  reason: "请假" | "病假" | "未到" | "无法完成";
  status: "待安排" | "已通知" | "已完成";
  makeup?: string;
};

const initial: A[] = [
  { name: "刘小强", class: "5年1班", reason: "病假", status: "待安排" },
  { name: "王小睿", class: "2年3班", reason: "未到", status: "已通知", makeup: "03-25 10:00" },
  { name: "陈小美", class: "4年2班", reason: "请假", status: "待安排" },
  { name: "赵小欣", class: "2年1班", reason: "无法完成", status: "已完成", makeup: "03-20 09:30" },
];

function AbsentPage() {
  const [list, setList] = useState(initial);
  const remain = list.filter((a) => a.status === "待安排").length;
  const done = list.filter((a) => a.status === "已完成").length;

  return (
    <div>
      <StatusBar title="缺检与补检" />
      <div className="px-5 pt-2">
        <div className="mb-1 flex items-center gap-2">
          <Link to="/school" className="text-lg text-muted-foreground">‹</Link>
          <h1 className="text-xl font-bold">缺检与补检</h1>
        </div>
        <p className="mb-4 text-xs text-muted-foreground">春季体检 · 阳光小学</p>

        <div className="mb-4 grid grid-cols-3 gap-2">
          {[
            { k: "缺检合计", v: list.length, c: "warm" },
            { k: "待安排", v: remain, c: "danger" },
            { k: "已完成", v: done, c: "success" },
          ].map((s) => (
            <div key={s.k} className="rounded-2xl bg-surface p-3 text-center shadow-sm ring-1 ring-border/60">
              <p className={`text-lg font-extrabold text-${s.c}`}>{s.v}</p>
              <p className="text-[11px] text-muted-foreground">{s.k}</p>
            </div>
          ))}
        </div>
      </div>

      <ul className="space-y-2 px-5 pb-8">
        {list.map((a, idx) => (
          <li key={a.name} className="rounded-2xl bg-surface p-3 shadow-sm ring-1 ring-border/60">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-warm/15 text-lg">{<EIcon e="🚫" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />}</div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold">{a.name}</p>
                  <span className="text-[11px] text-muted-foreground">{a.class}</span>
                  <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[10px] text-muted-foreground">{a.reason}</span>
                </div>
                {a.makeup && <p className="mt-0.5 text-[11px] text-teal">补检时间：{a.makeup}</p>}
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] ${
                      a.status === "已完成"
                        ? "bg-success/15 text-success"
                        : a.status === "已通知"
                        ? "bg-teal/15 text-teal"
                        : "bg-warm/15 text-warm"
                    }`}
                  >
                    {a.status}
                  </span>
                  {a.status !== "已完成" && (
                    <>
                      <button
                        onClick={() =>
                          setList((prev) =>
                            prev.map((x, i) => (i === idx ? { ...x, status: "已通知", makeup: "03-28 09:00" } : x)),
                          )
                        }
                        className="ml-auto rounded-full bg-teal/15 px-3 py-1 text-[11px] text-teal"
                      >
                        安排补检
                      </button>
                      <button
                        onClick={() => toast.success(`已通知 ${a.name} 家长`, { description: `${a.class} · 补检安排将短信告知` })}
                        className="rounded-full bg-surface-2 px-3 py-1 text-[11px] text-muted-foreground"
                      >
                        通知家长
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
