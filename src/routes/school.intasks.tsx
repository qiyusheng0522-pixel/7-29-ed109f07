import { createFileRoute, Link } from "@tanstack/react-router";
import { StatusBar } from "@/components/MobileFrame";
import { ActionSheet } from "@/components/ActionSheet";
import { useState } from "react";

import { EIcon } from "@/components/EIcon";
export const Route = createFileRoute("/school/intasks")({
  component: InTasksPage,
});

type Role = "体检负责老师" | "校管理者" | "体育老师";
type Task = {
  id: string;
  role: Role;
  title: string;
  who: string;
  due: string;
  status: "待处理" | "处理中" | "已完成" | "已超期" | "需升级";
  assignee: string; // AI 自动分派的责任人
};

const staffByRole: Record<Role, string[]> = {
  "体检负责老师": ["王老师", "陈老师", "赵老师", "孙老师"],
  "体育老师": ["马老师", "杨老师"],
  "校管理者": ["周主任", "郑校长"],
};

const initialTasks: Task[] = [
  { id: "t1", role: "体检负责老师", title: "催办 12 位家长完成体检授权", who: "2年2班", due: "今日", status: "待处理", assignee: "王老师" },
  { id: "t2", role: "体检负责老师", title: "提醒未读体检报告家长查看", who: "3年3班", due: "今日", status: "处理中", assignee: "陈老师" },
  { id: "t3", role: "体检负责老师", title: "组织复检未到场学生补检", who: "全年级 · 6人", due: "本周", status: "待处理", assignee: "赵老师" },
  { id: "t4", role: "体育老师", title: "根据体检结果调整体测项目强度", who: "1年1班", due: "本周", status: "待处理", assignee: "马老师" },
  { id: "t5", role: "体育老师", title: "跟进 BMI 偏高学生课后运动打卡", who: "2年2班 · 王小明", due: "本周", status: "处理中", assignee: "杨老师" },
  { id: "t6", role: "校管理者", title: "审核本轮体检执行进度汇总", who: "全校", due: "今日", status: "待处理", assignee: "周主任" },
  { id: "t7", role: "校管理者", title: "确认体检重大异常升级流转", who: "5年1班 · 2人", due: "今日", status: "需升级", assignee: "郑校长" },
];

const roles = ["全部", "体检负责老师", "体育老师", "校管理者"] as const;
const filters = ["全部", "今日到期", "超期", "需升级"] as const;

const statusStyle: Record<Task["status"], string> = {
  待处理: "bg-warm/15 text-warm",
  处理中: "bg-teal/15 text-teal",
  已完成: "bg-success/15 text-success",
  已超期: "bg-danger/15 text-danger",
  需升级: "bg-warning/25 text-warning-foreground",
};

function InTasksPage() {
  const [view] = useSchoolView();
  const isTeacher = view === "teacher";
  const [role, setRole] = useState<(typeof roles)[number]>("全部");
  const [f, setF] = useState<(typeof filters)[number]>("全部");
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const reassign = (id: string, name: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, assignee: name } : t)));
  };

  const list = tasks.filter((t) => {
    // 班主任视角：只看分派给本人或本班的任务
    if (isTeacher && t.assignee !== MY_TEACHER && !t.who.includes(MY_CLASS)) return false;
    if (!isTeacher && role !== "全部" && t.role !== role) return false;
    if (f === "今日到期") return t.due === "今日";
    if (f === "超期") return t.status === "已超期";
    if (f === "需升级") return t.status === "需升级";
    return true;
  });


  return (
    <div>
      <StatusBar title="校内任务" />
      <div className="px-5 pt-2">
        <h1 className="text-xl font-bold">校内任务</h1>
        <p className="mb-3 text-xs text-muted-foreground">AI 自动按角色分派 · 支持手动调整</p>

        <div className="mb-3 flex items-center gap-2 rounded-2xl bg-gradient-to-br from-teal/10 to-deep/10 p-3 ring-1 ring-teal/20">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-teal/20 text-base">{<EIcon e="🤖" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />}</span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold">AI 已完成本轮任务分派</p>
            <p className="text-[11px] text-muted-foreground">按角色、班级、历史负荷智能匹配责任人</p>
          </div>
          <ActionSheet
            trigger={<button className="rounded-full bg-teal px-3 py-1 text-[11px] text-teal-foreground">重新分派</button>}
            title="重新分派全部任务？"
            description="AI 将按最新角色、班级与负荷重新匹配责任人，已完成任务不受影响。"
            confirmText="重新分派"
            toastMessage="已重新分派任务"
            toastDescription="按最新负荷完成智能匹配"
          />
        </div>

        <Link
          to="/school/escalated"
          className="mb-4 flex items-center justify-between rounded-2xl bg-gradient-to-br from-warning/15 to-warm/10 p-3 ring-1 ring-warning/20"
        >
          <div>
            <p className="text-xs font-semibold">健管师已接管 · 查看进展</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">升级后的任务在此处跟踪（只读）</p>
          </div>
          <span className="text-warm">→</span>
        </Link>

        {/* Role tabs */}
        <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
          {roles.map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] ${
                role === r ? "bg-teal text-teal-foreground" : "bg-surface ring-1 ring-border/60 text-muted-foreground"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
        <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
          {filters.map((k) => (
            <button
              key={k}
              onClick={() => setF(k)}
              className={`shrink-0 rounded-full px-3 py-1 text-[11px] ${
                f === k ? "bg-deep text-deep-foreground" : "bg-surface-2 text-muted-foreground"
              }`}
            >
              {k}
            </button>
          ))}
        </div>

        {/* 汇总 */}
        <div className="mb-3 grid grid-cols-3 gap-2">
          {[
            { k: "今日到期", v: tasks.filter((t) => t.due === "今日").length, c: "warm" },
            { k: "超期", v: tasks.filter((t) => t.status === "已超期").length, c: "danger" },
            { k: "已完成", v: tasks.filter((t) => t.status === "已完成").length, c: "success" },
          ].map((s) => (
            <div key={s.k} className="rounded-2xl bg-surface p-3 text-center shadow-sm ring-1 ring-border/60">
              <p className={`text-lg font-extrabold text-${s.c}`}>{s.v}</p>
              <p className="text-[11px] text-muted-foreground">{s.k}</p>
            </div>
          ))}
        </div>
      </div>

      <ul className="space-y-2 px-5 pb-8">
        {list.map((t) => (
          <li key={t.id} className="rounded-2xl bg-surface p-3 shadow-sm ring-1 ring-border/60">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-teal/15 text-lg">
                {t.role === "体检负责老师" ? "" : t.role === "体育老师" ? "" : ""}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium">{t.title}</p>
                </div>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {t.role} · {t.who} · 期限 {t.due}
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <span className="rounded-full bg-teal/10 px-2 py-0.5 text-[10px] text-teal">
                     AI 分派 · 责任人 {t.assignee}
                  </span>
                  <ActionSheet
                    trigger={
                      <button className="rounded-full bg-surface-2 px-2 py-0.5 text-[10px] text-foreground ring-1 ring-border/60">
                        调整
                      </button>
                    }
                    title="手动调整责任人"
                    description={<>{t.title}<br />当前：{t.assignee}（{t.role}）</>}
                    confirmText="关闭"
                    toastMessage="责任人已更新"
                  >
                    <div className="space-y-2">
                      <p className="text-[11px] text-muted-foreground">从同角色人员中选择：</p>
                      <div className="flex flex-wrap gap-1.5">
                        {staffByRole[t.role].map((name) => (
                          <button
                            key={name}
                            onClick={() => reassign(t.id, name)}
                            className={`rounded-full px-3 py-1 text-[11px] ring-1 ${
                              t.assignee === name
                                ? "bg-teal text-teal-foreground ring-teal"
                                : "bg-surface-2 text-foreground ring-border/60"
                            }`}
                          >
                            {name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </ActionSheet>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] ${statusStyle[t.status]}`}>{t.status}</span>
                  <ActionSheet
                    trigger={
                      <button className="ml-auto rounded-full bg-success/15 px-3 py-1 text-[11px] text-success">完成</button>
                    }
                    title="标记任务已完成？"
                    description={<>{t.title}<br />{t.role} · {t.who}</>}
                    confirmText="标记完成"
                    toastMessage="任务已完成 "
                    toastDescription="可在已完成中查看"
                  >
                    <label className="block text-xs">
                      <span className="text-muted-foreground">完成说明（选填）</span>
                      <textarea
                        rows={3}
                        placeholder="补充执行情况、遗留问题等"
                        className="mt-1 w-full rounded-xl bg-surface-2 px-3 py-2 outline-none"
                      />
                    </label>
                  </ActionSheet>
                  <ActionSheet
                    trigger={
                      <button className="rounded-full bg-warning/20 px-3 py-1 text-[11px] text-warning-foreground">升级</button>
                    }
                    title="升级至健康管理师？"
                    description={<>{t.title}<br />升级后由校外健管师接手处理，学校端仅保留查看权限。</>}
                    confirmText="确认升级"
                    danger
                    toastMessage="已升级至健管师"
                    toastType="warning"
                    toastDescription="将在协同工作台同步"
                  >
                    <label className="block text-xs">
                      <span className="text-muted-foreground">升级原因（必填）</span>
                      <textarea
                        rows={3}
                        placeholder="如：现场情况超出校内处置能力"
                        className="mt-1 w-full rounded-xl bg-surface-2 px-3 py-2 outline-none"
                      />
                    </label>
                  </ActionSheet>
                </div>
              </div>
            </div>
          </li>
        ))}
        {list.length === 0 && (
          <li className="rounded-2xl bg-surface p-8 text-center text-sm text-muted-foreground shadow-sm ring-1 ring-border/60">
            暂无任务
          </li>
        )}
      </ul>
    </div>
  );
}
