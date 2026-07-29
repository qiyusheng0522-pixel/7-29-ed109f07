import { createFileRoute } from "@tanstack/react-router";
import { StatusBar } from "@/components/MobileFrame";
import { useMemo, useState } from "react";

import { EIcon } from "@/components/EIcon";
export const Route = createFileRoute("/community/consult")({
  component: ConsultPage,
});

type Src = "服务包" | "转社区" | "一般咨询";
type Msg = { from: "them" | "me"; text: string; time: string; ai?: boolean };
type Thread = {
  id: string;
  name: string;
  src: Src;
  sub: string;
  unread: number;
  last: string;
  time: string;
  msgs: Msg[];
};

const initial: Thread[] = [
  {
    id: "t1",
    name: "刘小强家长",
    src: "服务包",
    sub: "体重管理季度包 · 第 3 周",
    unread: 2,
    last: "孩子跳绳时膝盖有点酸，是不是运动量太大？",
    time: "10:24",
    msgs: [
      { from: "them", text: "张医生您好，孩子最近说跳绳时膝盖有点酸。", time: "10:20" },
      { from: "them", text: "是不是运动量太大了？需要调整方案吗？", time: "10:24" },
    ],
  },
  {
    id: "t2",
    name: "陈小美家长",
    src: "转社区",
    sub: "哮喘复诊后转社区 · 家庭雾化",
    unread: 1,
    last: "夜间又咳嗽了 2 次，需要临时加用支气管扩张剂吗？",
    time: "09:40",
    msgs: [
      { from: "them", text: "夜间又咳嗽了 2 次，需要临时加用支气管扩张剂吗？", time: "09:40" },
    ],
  },
  {
    id: "t3",
    name: "王小美家长",
    src: "服务包",
    sub: "近视防控半年包 · 第 2 月",
    unread: 0,
    last: "视力表在哪里可以买？孩子想在家自测。",
    time: "昨日",
    msgs: [
      { from: "them", text: "视力表在哪里可以买？孩子想在家自测。", time: "昨日 15:12" },
    ],
  },
  {
    id: "t4",
    name: "张小乐家长",
    src: "转社区",
    sub: "过敏性鼻炎季节维持",
    unread: 0,
    last: "鼻喷激素用多久可以停？会不会有依赖？",
    time: "昨日",
    msgs: [
      { from: "them", text: "鼻喷激素用多久可以停？会不会有依赖？", time: "昨日 11:20" },
    ],
  },
  {
    id: "t5",
    name: "赵小明家长",
    src: "一般咨询",
    sub: "在册儿童 · 一般健康咨询",
    unread: 0,
    last: "孩子接种疫苗后当天可以洗澡吗？",
    time: "昨日",
    msgs: [
      { from: "them", text: "孩子接种疫苗后当天可以洗澡吗？", time: "昨日 09:03" },
    ],
  },
];

const aiTemplates: Record<Src, (name: string) => string> = {
  服务包: (n) =>
    `${n}您好，根据服务包周随访记录，建议先调低单次跳绳量（例如 300 → 200 个/组），并在运动后做 5 分钟股四头肌拉伸；同时保证钙+维生素 D 摄入。如 3 天后仍有膝痛或出现肿胀请到社区面诊，我会安排骨科会诊。`,
  转社区: (n) =>
    `${n}您好，请先按医院方案维持原剂量；若夜间症状持续，可临时按需吸入 2 揿沙丁胺醇，间隔 4h 一次，24h 内 ≥3 次请到社区门诊或联系我升级方案。已同步宣教《夜间发作应急流程》到您的消息。`,
  一般咨询: (n) =>
    `${n}您好，接种当天避免注射部位沾水即可，其余部位可短时温水淋浴；若出现红肿硬结＞3cm、发热＞38.5℃ 请到社区门诊登记。`,
};

function ConsultPage() {
  const [threads, setThreads] = useState(initial);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [aiOn, setAiOn] = useState(true);
  const [autoAi, setAutoAi] = useState(false);
  const [input, setInput] = useState("");
  const [srcFilter, setSrcFilter] = useState<"全部" | Src>("全部");

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
    send(aiTemplates[active.src](active.name), true);
  };

  const aiDraft = () => {
    if (!active) return;
    setInput(aiTemplates[active.src](active.name));
  };

  // ===== 详情 =====
  if (active) {
    return (
      <div className="flex h-full flex-col">
        <StatusBar title="健康咨询" />
        <div className="flex items-center gap-2 border-b border-border/60 bg-surface px-4 py-3">
          <button onClick={() => setActiveId(null)} className="text-lg text-muted-foreground">
            ‹
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{active.name}</p>
            <p className="truncate text-[11px] text-muted-foreground">
              <span className={srcTag(active.src)}>{active.src}</span> · {active.sub}
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
                    ? "bg-warm text-warm-foreground rounded-tr-sm"
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

        {/* 底部输入区 */}
        <div className="sticky bottom-0 z-10 border-t border-border/60 bg-surface/95 backdrop-blur">
          {aiOn && (
            <div className="border-b border-border/60 bg-warm/5 px-4 py-2">
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-1 text-[11px] text-warm">
                  {<EIcon e="✨" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />} AI 助手已就绪 · 按人群/病史生成回复
                </p>
                <label className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  自动
                  <button
                    type="button"
                    onClick={() => setAutoAi((v) => !v)}
                    className={`relative h-4 w-7 rounded-full transition ${autoAi ? "bg-warm" : "bg-surface-2 ring-1 ring-border/60"}`}
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
                  className="flex-1 rounded-full bg-warm py-1.5 text-[11px] font-medium text-warm-foreground"
                >
                  一键 AI 回复
                </button>
                <button
                  onClick={aiDraft}
                  className="flex-1 rounded-full bg-surface py-1.5 text-[11px] ring-1 ring-warm/40 text-warm"
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
      <StatusBar title="健康咨询" />
      <div className="px-5 pb-8 pt-2">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold">健康咨询</h1>
            <p className="text-xs text-muted-foreground">
              服务包 / 转社区 / 一般咨询 · 共 {unreadTotal} 条未读
            </p>
          </div>
          <label className="mt-1 flex items-center gap-2 rounded-full bg-surface px-3 py-1.5 text-[11px] ring-1 ring-border/60">
            <span>{<EIcon e="✨" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />} AI 回复</span>
            <button
              onClick={() => setAiOn((v) => !v)}
              className={`relative h-4 w-7 rounded-full transition ${aiOn ? "bg-warm" : "bg-surface-2"}`}
            >
              <span
                className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition ${
                  aiOn ? "left-3.5" : "left-0.5"
                }`}
              />
            </button>
          </label>
        </div>

        {/* 来源 tab */}
        <div className="mt-4 flex gap-1.5">
          {(["全部", "服务包", "转社区", "一般咨询"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setSrcFilter(r)}
              className={`rounded-full px-3 py-1 text-[11px] ${
                srcFilter === r
                  ? "bg-warm text-warm-foreground font-medium"
                  : "bg-surface text-muted-foreground ring-1 ring-border/60"
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <ul className="mt-3 space-y-2">
          {threads.filter((t) => srcFilter === "全部" || t.src === srcFilter).map((t) => (
            <li key={t.id}>
              <button
                onClick={() => openThread(t.id)}
                className="flex w-full items-start gap-3 rounded-2xl bg-surface p-3 text-left shadow-sm ring-1 ring-border/60"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-warm/15 text-sm">
                  {t.src === "服务包" ? "" : t.src === "转社区" ? "" : ""}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-sm font-semibold">{t.name}</p>
                    <span className={srcTag(t.src)}>{t.src}</span>
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

function srcTag(s: Src) {
  const cls =
    s === "服务包"
      ? "bg-warm/15 text-warm"
      : s === "转社区"
      ? "bg-teal/15 text-teal"
      : "bg-muted text-muted-foreground";
  return `rounded px-1.5 py-0.5 text-[10px] ${cls}`;
}
