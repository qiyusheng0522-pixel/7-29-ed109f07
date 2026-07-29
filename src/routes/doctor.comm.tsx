import { createFileRoute } from "@tanstack/react-router";
import { StatusBar } from "@/components/MobileFrame";
import { useMemo, useState } from "react";

import { EIcon } from "@/components/EIcon";
export const Route = createFileRoute("/doctor/comm")({
  component: CommPage,
});

type Role = "家长" | "健管师";
type Msg = { from: "them" | "me"; text: string; time: string; ai?: boolean };
type Thread = {
  id: string;
  name: string;
  role: Role;
  sub: string;
  unread: number;
  last: string;
  time: string;
  msgs: Msg[];
};

const initial: Thread[] = [
  {
    id: "t1",
    name: "陈敏 家长",
    role: "家长",
    sub: "李小雨 · 3年3班",
    unread: 2,
    last: "孩子夜间咳嗽是否需要复诊？",
    time: "10:24",
    msgs: [
      { from: "them", text: "陈医生您好，孩子这两天夜里咳嗽比较多。", time: "10:20" },
      { from: "them", text: "白天基本没有，是否需要复诊？", time: "10:24" },
    ],
  },
  {
    id: "t3",
    name: "刘老师（健管师）",
    role: "健管师",
    sub: "刘小强 · 重点儿童",
    unread: 0,
    last: "已按方案 v0.3 跟进",
    time: "昨日",
    msgs: [{ from: "them", text: "已按方案 v0.3 跟进，家长反馈良好。", time: "昨日 17:40" }],
  },
];

const aiTemplates: Record<Role, (name: string) => string> = {
  家长: (n) =>
    `${n}您好，夜间单纯咳嗽多为气道敏感反应，建议先观察 2–3 天：保持室内湿度 50%–60%、睡前避免冷饮，若出现发热、喘息或持续加重请及时到院复诊。可先在「家庭呵护」查看夜咳呵护清单。`,
  健管师: () =>
    `收到，方案 v0.3 继续执行 2 周后复评。请重点关注 BMI 与夜间症状变化，异常随时同步，我这边可安排绿色通道复核。`,
};

function CommPage() {
  const [threads, setThreads] = useState(initial);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [aiOn, setAiOn] = useState(true);
  const [autoAi, setAutoAi] = useState(false);
  const [input, setInput] = useState("");
  const [roleFilter, setRoleFilter] = useState<"全部" | Role>("全部");

  const active = useMemo(() => threads.find((t) => t.id === activeId), [threads, activeId]);
  const unreadTotal = threads.reduce((s, t) => s + t.unread, 0);

  const openThread = (id: string) => {
    setActiveId(id);
    setThreads((prev) => prev.map((t) => (t.id === id ? { ...t, unread: 0 } : t)));
  };

  const send = (text: string, ai = false) => {
    if (!text.trim() || !active) return;
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    setThreads((prev) =>
      prev.map((t) =>
        t.id === active.id
          ? { ...t, msgs: [...t.msgs, { from: "me", text, time, ai }], last: text, time }
          : t,
      ),
    );
    setInput("");
  };

  const aiReply = () => {
    if (!active) return;
    send(aiTemplates[active.role](active.name.split(" ")[0]), true);
  };

  const aiDraft = () => {
    if (!active) return;
    setInput(aiTemplates[active.role](active.name.split(" ")[0]));
  };

  // ===== 详情 =====
  if (active) {
    return (
      <div className="flex h-full flex-col">
        <StatusBar title="沟通" />
        <div className="flex items-center gap-2 border-b border-border/60 bg-surface px-4 py-3">
          <button onClick={() => setActiveId(null)} className="text-lg text-muted-foreground">
            ‹
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{active.name}</p>
            <p className="truncate text-[11px] text-muted-foreground">
              <span className={roleTag(active.role)}>{active.role}</span> · {active.sub}
            </p>
          </div>
          <span className="text-lg">{<EIcon e="☎️" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />}</span>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto bg-surface-2 px-4 py-4">
          {active.msgs.map((m, i) => (
            <div key={i} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[78%] rounded-2xl px-3 py-2 text-[13px] leading-relaxed shadow-sm ${
                  m.from === "me"
                    ? "bg-teal text-teal-foreground rounded-tr-sm"
                    : "bg-surface rounded-tl-sm"
                }`}
              >
                {m.ai && (
                  <p className="mb-1 flex items-center gap-1 text-[10px] font-medium opacity-80">
                    {<EIcon e="✨" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />} AI 生成 · 已由医生确认
                  </p>
                )}
                <p className="whitespace-pre-wrap">{m.text}</p>
                <p className={`mt-1 text-right text-[10px] ${m.from === "me" ? "text-white/70" : "text-muted-foreground"}`}>
                  {m.time}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* 底部输入区（固定在底部导航之上，冻结状态） */}
        <div className="sticky bottom-0 z-10 border-t border-border/60 bg-surface/95 backdrop-blur">
          {aiOn && (
            <div className="border-b border-border/60 bg-teal/5 px-4 py-2">
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-1 text-[11px] text-teal">
                  {<EIcon e="✨" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />} AI 助手已就绪 · 按角色/病史生成回复
                </p>
                <label className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  自动
                  <button
                    type="button"
                    onClick={() => setAutoAi((v) => !v)}
                    className={`relative h-4 w-7 rounded-full transition ${autoAi ? "bg-teal" : "bg-surface-2 ring-1 ring-border/60"}`}
                    aria-pressed={autoAi}
                  >
                    <span
                      className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition ${
                        autoAi ? "left-3.5" : "left-0.5"
                      }`}
                    />
                  </button>
                </label>
              </div>
              <div className="mt-1.5 flex gap-1.5">
                <button
                  onClick={aiReply}
                  className="flex-1 rounded-full bg-teal py-1.5 text-[11px] font-medium text-teal-foreground"
                >
                  一键 AI 回复
                </button>
                <button
                  onClick={aiDraft}
                  className="flex-1 rounded-full bg-surface py-1.5 text-[11px] ring-1 ring-teal/40 text-teal"
                >
                  AI 起草 · 待编辑
                </button>
              </div>
            </div>
          )}

          <div className="flex items-end gap-2 px-3 py-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={1}
              placeholder="输入回复…"
              className="flex-1 resize-none rounded-2xl bg-surface-2 px-3 py-2 text-[13px] outline-none"
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim()}
              className="rounded-full bg-deep px-4 py-2 text-[12px] font-medium text-deep-foreground disabled:opacity-40"
            >
              发送
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===== 列表 =====
  return (
    <div>
      <StatusBar title="沟通" />
      <div className="px-5 pb-8 pt-2">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold">沟通</h1>
            <p className="text-xs text-muted-foreground">
              家长 / 健管师 · 共 {unreadTotal} 条未读
            </p>
          </div>
          <label className="mt-1 flex items-center gap-2 rounded-full bg-surface px-3 py-1.5 text-[11px] ring-1 ring-border/60">
            <span>{<EIcon e="✨" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />} AI 回复</span>
            <button
              onClick={() => setAiOn((v) => !v)}
              className={`relative h-4 w-7 rounded-full transition ${aiOn ? "bg-teal" : "bg-surface-2"}`}
            >
              <span
                className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition ${
                  aiOn ? "left-3.5" : "left-0.5"
                }`}
              />
            </button>
          </label>
        </div>

        {/* 角色 tab */}
        <div className="mt-4 flex gap-1.5">
          {(["全部", "家长", "健管师"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`rounded-full px-3 py-1 text-[11px] ${
                roleFilter === r
                  ? "bg-deep text-deep-foreground font-medium"
                  : "bg-surface text-muted-foreground ring-1 ring-border/60"
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <ul className="mt-3 space-y-2">
          {threads.filter((t) => roleFilter === "全部" || t.role === roleFilter).map((t) => (
            <li key={t.id}>
              <button
                onClick={() => openThread(t.id)}
                className="flex w-full items-start gap-3 rounded-2xl bg-surface p-3 text-left shadow-sm ring-1 ring-border/60"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-teal/15 text-sm">
                  {t.role === "家长" ? "" : ""}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-sm font-semibold">{t.name}</p>
                    <span className={roleTag(t.role)}>{t.role}</span>
                    <span className="ml-auto shrink-0 text-[10px] text-muted-foreground">{t.time}</span>
                  </div>
                  <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{t.sub}</p>
                  <p className="mt-1 truncate text-[12px]">{t.last}</p>
                </div>
                {t.unread > 0 && (
                  <span className="grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-danger px-1 text-[10px] font-bold text-danger-foreground">
                    {t.unread}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>

        <p className="mt-4 text-center text-[10px] text-muted-foreground">
          AI 回复由平台辅助生成，医生需二次确认后发送
        </p>
      </div>
    </div>
  );
}

function roleTag(r: Role) {
  const cls =
    r === "家长"
      ? "bg-warm/15 text-warm"
      : "bg-deep/15 text-deep";
  return `rounded px-1.5 py-0.5 text-[10px] ${cls}`;
}
