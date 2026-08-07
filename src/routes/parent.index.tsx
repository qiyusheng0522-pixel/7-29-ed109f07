import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ChevronRight } from "lucide-react";
import { StatusBar } from "@/components/MobileFrame";
import { ActionSheet } from "@/components/ActionSheet";

import { EIcon } from "@/components/EIcon";
import { DietCheckinSheet, ExerciseCheckinSheet } from "@/components/CheckinSheets";
import { readCheckins, type CheckinRecord } from "@/lib/checkin";

/** 首页任务行上展示的本次打卡摘要 */
function summarize(rec: CheckinRecord) {
  if (rec.kind === "diet") {
    const via = { photo: "拍照", voice: "语音", text: "文字" }[rec.mode];
    return `${rec.meal} · ${via}记录 · 约 ${rec.kcal} kcal`;
  }
  const level = ["", "轻松", "适中", "吃力"][rec.intensity];
  return `${rec.item} · ${rec.minutes} 分钟 · ${level} · 疲惫 ${rec.fatigue}/5`;
}

// 演示：默认已有体检报告；可通过右上角"视角"按钮切换到"检前 · 无报告"
const CONSENT_KEY = "parent_consent_v1";
const VIEW_KEY = "parent_view_hasreport_v1";

export const Route = createFileRoute("/parent/")({
  component: ParentHome,
});

type Kid = {
  id: string;
  short: string;
  name: string;
  age: number;
  tag: string;
  tagColor: "warm" | "rose";
};

const kids: Kid[] = [
  { id: "yang", short: "阳", name: "小阳", age: 7, tag: "肥胖倾向", tagColor: "warm" },
  { id: "yu", short: "雨", name: "小雨", age: 9, tag: "哮喘风险", tagColor: "rose" },
];

/**
 * 快捷入口。前 3 项跳到健康助手并通过 `?q=` 直接带入问题、立即作答；
 * 「报告解读」跳到报告页，因此没有 q。
 */
const quickAsk = [
  {
    icon: <EIcon e="🥗" />,
    label: "饮食建议",
    to: "/parent/comm",
    q: "小阳这次体检 BMI 偏高，日常饮食怎么安排？",
  },
  {
    icon: <EIcon e="🏃" />,
    label: "运动咨询",
    to: "/parent/comm",
    q: "怎么安排一周的运动计划？",
  },
  {
    icon: <EIcon e="😴" />,
    label: "睡眠咨询",
    to: "/parent/comm",
    q: "孩子每天睡眠时间多少算达标？",
  },
  { icon: <EIcon e="📋" />, label: "报告解读", to: "/parent/report", q: undefined },
] as const;

// 与 /parent/care 保持一致的示例数据
const TODAY = "2026-04-08";
const daysAgo = (n: number) => {
  const d = new Date(TODAY);
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};
const dayDiff = (a: string, b: string) =>
  Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);

type HomeCareItem = {
  id: string;
  icon: import("react").ReactNode;
  title: string;
  tag: string;
  tagClass: string;
  cycleDays: number;
  lastDone: string;
  passive?: boolean; // 仅提醒、无需操作的日常习惯
};

const homeCare: HomeCareItem[] = [
  { id: "weight", icon: <EIcon e="⚖️" />, title: "晨起体重记录", tag: "体重管理", tagClass: "bg-warm/15 text-warm", cycleDays: 7, lastDone: daysAgo(7) },
  { id: "bed", icon: <EIcon e="🛏️" />, title: "床品除螨清洗", tag: "过敏防护", tagClass: "bg-rose/10 text-rose", cycleDays: 14, lastDone: daysAgo(9) },
  { id: "vent", icon: <EIcon e="🪟" />, title: "开窗通风换气", tag: "通风湿度", tagClass: "bg-teal/15 text-teal", cycleDays: 1, lastDone: daysAgo(1), passive: true },
  { id: "humid", icon: <EIcon e="💧" />, title: "空气加湿器换水", tag: "呼吸道", tagClass: "bg-teal/15 text-teal", cycleDays: 3, lastDone: daysAgo(1) },
  { id: "brush", icon: <EIcon e="🦷" />, title: "儿童牙刷更换", tag: "口腔", tagClass: "bg-success/15 text-success", cycleDays: 90, lastDone: daysAgo(46) },
  { id: "vitd", icon: <EIcon e="☀️" />, title: "维生素 D 补充", tag: "营养", tagClass: "bg-warm/15 text-warm", cycleDays: 1, lastDone: daysAgo(1), passive: true },
];

/**
 * 今日打卡任务：家长端只保留「饮食」与「运动」两类。
 * 点击在当前页底部弹窗填写详情，不跳转、不支持事后补卡。
 */
const todayTasks = [
  {
    kind: "diet" as const,
    icon: <EIcon e="🥦" />,
    text: "饮食打卡 · 晚餐 500-600 kcal",
    hint: "支持拍照 / 语音 / 文字",
    tone: "success" as const,
  },
  {
    kind: "exercise" as const,
    icon: <EIcon e="🤸" />,
    text: "运动打卡 · 亲子跳绳 20 分钟",
    hint: "记录时长 / 强度 / 疲惫度",
    tone: "warning" as const,
  },
];

const encyclopedia = [
  {
    kind: "视频",
    kindBg: "from-warm/70 to-warm",
    title: "孩子近视防控：20-20-20 用眼休息怎么做",
    meta: "李医生 · 4 分钟 · 1.2 万阅读",
    badge: "必读",
    badgeClass: "bg-rose/15 text-rose",
  },
  {
    kind: "图文",
    kindBg: "from-success/60 to-success/80",
    title: "学龄儿童均衡膳食：一周营养餐单推荐",
    meta: "营养师 · 6 分钟 · 8423 阅读",
    badge: "食谱",
    badgeClass: "bg-success/15 text-success",
  },
  {
    kind: "直播",
    kindBg: "from-warm/60 to-rose/70",
    title: "本周四 · 入学体检常见问题答疑公开课",
    meta: "主任医师 · 直播预约 · 526 人…",
    badge: "预约",
    badgeClass: "bg-warning/20 text-warning-foreground",
  },
];


function ParentHome() {
  const [activeKid, setActiveKid] = useState(kids[0].id);
  const kid = kids.find((k) => k.id === activeKid) ?? kids[0];
  const [catTab, setCatTab] = useState("全部");
  // 打卡结果来自打卡页写入的记录，进入首页时读取并监听更新
  const [checkins, setCheckins] = useState<ReturnType<typeof readCheckins>>({});
  useEffect(() => {
    const sync = () => setCheckins(readCheckins());
    sync();
    window.addEventListener("checkin-updated", sync);
    return () => window.removeEventListener("checkin-updated", sync);
  }, []);
  const doneCount = todayTasks.filter((t) => checkins[t.kind]).length;
  const [consent, setConsent] = useState<"pending" | "agreed" | "declined">("pending");
  const [signed, setSigned] = useState(false);
  const [hasReport, setHasReport] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return window.localStorage.getItem(VIEW_KEY) !== "0";
  });
  const toggleView = () => {
    setHasReport((v) => {
      const nv = !v;
      window.localStorage.setItem(VIEW_KEY, nv ? "1" : "0");
      return nv;
    });
  };

  // 每次进入家长端首页都需要重新签署授权（演示需求）
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(CONSENT_KEY);
    setConsent("pending");
    setSigned(false);
  }, []);

  const agree = () => {
    if (!signed) return;
    window.localStorage.setItem(CONSENT_KEY, "agreed");
    setConsent("agreed");
  };
  const decline = () => {
    window.localStorage.setItem(CONSENT_KEY, "declined");
    setConsent("declined");
  };

  return (
    <div className="pb-4">
      {/* 体检授权协议 · 首次进入弹出 */}
      {consent === "pending" && (
        <div className="fixed inset-0 z-50 mx-auto flex max-w-md items-center justify-center bg-black/40 px-5 backdrop-blur-sm">
          <div className="w-full rounded-3xl bg-surface p-5 shadow-2xl">
            <div className="mb-2 flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-rose/15 text-lg">{<EIcon e="📄" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />}</span>
              <div className="min-w-0">
                <h2 className="text-base font-bold">学生健康体检授权协议书</h2>
                <p className="text-[11px] text-muted-foreground">南京市教育局 · 制式授权协议</p>
              </div>
            </div>
            <div className="max-h-40 space-y-2 overflow-y-auto rounded-2xl bg-surface-2 p-3 text-[11px] leading-relaxed text-foreground/80">
              <p>依据南京市教育局关于中小学生健康体检工作的相关要求，经监护人书面授权后开展本次体检并采集：</p>
              <p>• 基础信息（姓名 / 年龄 / 学校班级 / 学号）</p>
              <p>• 体检数据（身高体重 / 视力 / 血压 / 脊柱侧弯 / 龋齿等）</p>
              <p>• 家庭健康打卡与咨询记录</p>
              <p>以上数据由教育局指定承检机构与合作儿童医院加密存储，仅用于学生健康管理与服务，不会用于商业用途。您可随时在"我的-授权管理"中撤回。</p>
            </div>

            <div className="mt-3">
              <div className="mb-1.5 flex items-center justify-between">
                <p className="text-[11px] font-medium text-muted-foreground">
                  监护人手写签名 <span className="text-rose">*</span>
                </p>
                {signed && (
                  <button
                    type="button"
                    onClick={() => setSigned(false)}
                    className="text-[11px] text-muted-foreground underline"
                  >
                    清除重签
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSigned(true)}
                className={`grid h-20 w-full place-items-center rounded-xl border-2 border-dashed text-xs transition ${
                  signed
                    ? "border-rose bg-rose/10 text-rose"
                    : "border-border text-muted-foreground"
                }`}
              >
                {signed ? " 李妈妈 · 2026-04-08 20:14" : "点击此处手写签名"}
              </button>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button onClick={decline} className="rounded-full bg-surface-2 py-2.5 text-[13px] font-medium text-muted-foreground">
                暂不同意
              </button>
              <button
                onClick={agree}
                disabled={!signed}
                className={`rounded-full py-2.5 text-[13px] font-semibold transition ${
                  signed ? "bg-rose text-rose-foreground" : "bg-rose/40 text-rose-foreground/70"
                }`}
              >
                {signed ? "同意并继续" : "请先签名"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 拒绝授权友好提示 */}
      {consent === "declined" && (
        <div className="fixed inset-0 z-50 mx-auto flex max-w-md items-center justify-center bg-black/40 px-5 backdrop-blur-sm">
          <div className="w-full rounded-3xl bg-surface p-6 text-center shadow-2xl">
            <span className="mx-auto mb-2 grid h-14 w-14 place-items-center rounded-full bg-warm/15 text-2xl">{<EIcon e="🌱" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />}</span>
            <h2 className="text-base font-bold">还没同意授权哦</h2>
            <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
              没有授权就无法为宝贝生成体检报告和专属健康方案。您可以先浏览科普内容，随时回来继续开启守护 {<EIcon e="💕" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                onClick={() => setConsent("pending")}
                className="rounded-full bg-surface-2 py-2.5 text-[13px] font-medium text-muted-foreground"
              >
                仅浏览小程序
              </button>
              <button onClick={agree} className="rounded-full bg-rose py-2.5 text-[13px] font-semibold text-rose-foreground">
                重新查看协议
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Title lives in the brand row below, so the status bar stays clean. */}
      <StatusBar />

      {/* Brand row */}
      <div className="flex items-center gap-2 px-5 pb-3 pt-1.5">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-rose/12 text-[17px] text-rose">
          <EIcon e="♥" />
        </span>
        <span className="min-w-0 flex-1 truncate text-[15px] font-bold">童护佳 · 南京</span>
        <button
          type="button"
          onClick={toggleView}
          className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-medium ring-1 transition ${
            hasReport
              ? "bg-success/10 text-success ring-success/25"
              : "bg-warning/15 text-warning-foreground ring-warning/35"
          }`}
          aria-label="切换演示视角"
        >
          {hasReport ? "报告后" : "检前"} ⇄
        </button>
        {/* 这里原有一个铃铛入口，与下方「咨询医生」旁的消息入口重复（且未带未读数），
            已移除，消息统一从下方带角标的入口进入。 */}
      </div>




      {/* AI Health advisor card — 精简后 */}
      {hasReport ? (
      <div className="mt-3 px-5">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose/90 via-rose to-rose/70 p-4 text-white shadow-xl shadow-rose/30">
          <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/15 blur-2xl" />

          {/* 头像 + 标题 + 内嵌关注提示 */}
          <div className="relative flex items-start gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white/25 text-2xl backdrop-blur">
              {<EIcon e="👩‍⚕️" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] text-white/80">{<EIcon e="✨" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />} 童护佳 · AI 健康顾问</p>
              <p className="mt-0.5 text-[15px] font-bold leading-tight">
                家长好，{kid.name}的体检数据已为您解读 
              </p>
            </div>
          </div>

          {/* 体检关注 · 突出卡片 */}
          <Link
            to="/parent/report"
            className="mt-3 block rounded-2xl bg-white/95 p-3 shadow-sm ring-1 ring-white/60"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-danger/15 text-[12px]">{<EIcon e="⚠️" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />}</span>
                <span className="text-[12px] font-bold text-rose">本次体检 · 2 项需重点关注</span>
              </div>
              <span className="text-[11px] font-medium text-rose">查看报告 ›</span>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div className="min-w-0 rounded-xl bg-warm/10 p-2">
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-warning" />
                  <p className="truncate text-[11px] font-semibold text-warm">体重偏高</p>
                </div>
                <p className="mt-1 text-[10px] leading-snug text-muted-foreground">
                  BMI 17.1 · P85
                  <br />
                  建议 12 周控重
                </p>
              </div>
              <div className="min-w-0 rounded-xl bg-rose/10 p-2">
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-danger" />
                  <p className="truncate text-[11px] font-semibold text-rose">尘螨过敏</p>
                </div>
                <p className="mt-1 text-[10px] leading-snug text-muted-foreground">
                  IgE (++)
                  <br />
                  ��家庭除螨
                </p>
              </div>
            </div>
          </Link>





          {/* 咨询输入框 · 主 CTA */}
          <Link
            to="/parent/comm"
            className="relative mt-3 flex items-center gap-2 rounded-full bg-white pl-3 pr-1 py-1"
          >
            <span className="text-rose">{<EIcon e="💬" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />}</span>
            <span className="flex-1 truncate text-[13px] text-muted-foreground">
              向 AI 健康顾问咨询…
            </span>
            <span className="rounded-full bg-rose px-3 py-1 text-[11px] font-medium text-rose-foreground">
              咨询
            </span>
          </Link>

          {/* 4 个统一图标快捷入口 */}
          <div className="relative mt-2.5 grid grid-cols-4 gap-1.5">
            {quickAsk.map((q) => (
              <Link
                key={q.label}
                to={q.to}
                search={q.q ? { q: q.q } : undefined}
                className="flex flex-col items-center gap-0.5 rounded-2xl bg-white/95 py-2 text-foreground"
              >
                <span className="text-lg leading-none">{q.icon}</span>
                <span className="text-[11px]">{q.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
      ) : (
        <div className="mt-3 px-5">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-warm/90 via-warm to-warm/70 p-4 text-warm-foreground shadow-xl shadow-warm/30">
            <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/25 blur-2xl" />
            <div className="relative flex items-start gap-3">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white/30 text-2xl backdrop-blur">
                {<EIcon e="🗓️" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] opacity-85">{<EIcon e="✨" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />} 检前视角 · 还未生成体检报告</p>
                <p className="mt-0.5 text-[15px] font-bold leading-tight">
                  {kid.name}的入学体检 · 还有 <span className="text-[22px]">7</span> 天
                </p>
              </div>
            </div>

            {/* 检前 3 步进度 */}
            <div className="mt-3 rounded-2xl bg-white/95 p-3 text-foreground shadow-sm ring-1 ring-white/60">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[12px] font-bold">检前 3 步 · 已完成 1/3</span>
                <Link to="/parent/notice" className="text-[11px] font-medium text-warm">
                  去完成 ›
                </Link>
              </div>
              <div className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
                <div className="h-full w-1/3 rounded-full bg-warm" />
              </div>
              <ul className="space-y-1.5 text-[11px]">
                <li className="flex items-center gap-2">
                  <span className="grid h-4 w-4 place-items-center rounded-full bg-success text-[10px] text-success-foreground">{<EIcon e="✓" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />}</span>
                  <span className="flex-1 text-muted-foreground line-through">数据使用授权 · 已签署</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="grid h-4 w-4 place-items-center rounded-full bg-danger/15 text-[10px] text-danger">!</span>
                  <span className="flex-1 font-medium">健康问卷 · 哮喘风险筛查</span>
                  <span className="text-[10px] text-danger">4-13 截止</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="grid h-4 w-4 place-items-center rounded-full bg-danger/15 text-[10px] text-danger">!</span>
                  <span className="flex-1 font-medium">体检知情同意书 · 待签署</span>
                  <span className="text-[10px] text-danger">4-13 截止</span>
                </li>
              </ul>
            </div>

            {/* 检前提示 · 关键 3 条 */}
            <div className="relative mt-3 grid grid-cols-3 gap-1.5">
              {[
                { icon: <EIcon e="🚱" />, t: "22:00 起", s: "禁食禁水" },
                { icon: <EIcon e="😴" />, t: "21:30 前", s: "按时入睡" },
                { icon: <EIcon e="👕" />, t: "宽松衣裤", s: "戴好眼镜" },
              ].map((x) => (
                <div key={x.s} className="rounded-2xl bg-white/95 py-2 text-center text-foreground">
                  <p className="text-lg leading-none">{x.icon}</p>
                  <p className="mt-1 text-[11px] font-semibold">{x.t}</p>
                  <p className="text-[10px] text-muted-foreground">{x.s}</p>
                </div>
              ))}
            </div>

            {/* 咨询入口 */}
            <Link
              to="/parent/comm"
              className="relative mt-3 flex items-center gap-2 rounded-full bg-white pl-3 pr-1 py-1"
            >
              <span className="text-warm">{<EIcon e="💬" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />}</span>
              <span className="flex-1 truncate text-[13px] text-muted-foreground">
                检前有疑问？问问 AI 顾问…
              </span>
              <span className="rounded-full bg-warm px-3 py-1 text-[11px] font-medium text-warm-foreground">
                咨询
              </span>
            </Link>
          </div>
        </div>
      )}



      {/* 咨询专科医生 + 消息入口 */}
      <div className="mx-5 mt-3 flex items-stretch gap-2">
        <Link
          to="/parent/comm"
          className="flex flex-1 items-center gap-3 rounded-2xl bg-surface px-3 py-2.5 shadow-sm ring-1 ring-border/60"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-teal/15 text-lg text-teal">
            {<EIcon e="🎧" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">咨询儿童呼吸科医生？</p>
            <p className="truncate text-[11px] text-muted-foreground">
              选主任 / 主治 1v1 · 24h 内回复
            </p>
          </div>
          <span className="text-muted-foreground">›</span>
        </Link>
        <Link
          to="/parent/comm"
          className="relative flex w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-surface shadow-sm ring-1 ring-border/60"
        >
          <span className="relative text-lg text-rose">
            {<EIcon e="🔔" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />}
            <span className="absolute -right-2 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-rose px-1 text-[10px] font-bold text-rose-foreground">
              3
            </span>
          </span>
          <span className="mt-0.5 text-[11px] text-muted-foreground">消息</span>
        </Link>
      </div>

      {/* 入学体检须知 banner */}
      <Link
        to="/parent/notice"
        className="mx-5 mt-3 flex items-center gap-3 rounded-2xl bg-warning/15 px-3 py-3 ring-1 ring-warning/30"
      >
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-warning text-[11px] font-bold leading-tight text-warning-foreground">
          检<br />前
        </span>
        {/* Title and counts stack so neither wraps awkwardly at 402px. */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">本次入学体检 · 家长须知</p>
          <p className="mt-0.5 text-[11px] text-warning-foreground/80">
            共 6 项 · <b className="font-semibold text-warning-foreground">2 待办</b> · 1 已完成
          </p>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-warning-foreground/50" />
      </Link>

      {/* Today tasks — 需已生成体检报告后才展示 */}
      {hasReport && (
      <section className="mx-5 mt-3 rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-border/60">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="min-w-0 flex-1 truncate text-sm font-bold">
            今天给 {kid.name} 做 {todayTasks.length} 件事
          </h3>
          <span className="shrink-0 text-[11px] text-muted-foreground">
            {doneCount}/{todayTasks.length}
          </span>
        </div>
        <ul className="space-y-2">
          {todayTasks.map((t) => {
            const toneBg = {
              warning: "bg-warning/10 ring-warning/25",
              success: "bg-success/10 ring-success/25",
            }[t.tone];
            const rec = checkins[t.kind];
            const CheckinSheet = t.kind === "diet" ? DietCheckinSheet : ExerciseCheckinSheet;
            return (
              <li key={t.kind}>
                <CheckinSheet
                  trigger={
                    <button
                      type="button"
                      className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left ring-1 ${toneBg}`}
                    >
                      <span className="text-xl">{t.icon}</span>
                      <div className="min-w-0 flex-1">
                        <p className={`truncate text-sm ${rec ? "text-muted-foreground" : ""}`}>
                          {t.text}
                        </p>
                        {/* 已打卡后把提示换成本次记录的摘要，让家长一眼看到填了什么 */}
                        <p className="truncate text-[10px] text-muted-foreground">
                          {rec ? summarize(rec) : t.hint}
                        </p>
                      </div>
                      {rec ? (
                        <span className="shrink-0 rounded-full bg-success px-3 py-1 text-[11px] font-medium text-success-foreground">
                          已打卡 {<EIcon e="✓" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />}
                        </span>
                      ) : (
                        <span className="shrink-0 rounded-full border border-rose bg-white px-3 py-1 text-[11px] font-medium text-rose">
                          去记录
                        </span>
                      )}
                    </button>
                  }
                />
              </li>
            );
          })}
        </ul>
      </section>
      )}

      {/* 居家健康提醒 — 需已生成体检报告后才展示 */}
      {hasReport && (
      <section className="mx-5 mt-3 rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-border/60">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold">居家健康提醒</h3>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              周期性事项 · 可调整提醒日期，进度显示下次到期
            </p>
          </div>
          <Link to="/parent/care" className="shrink-0 text-[11px] text-muted-foreground">
            查看全部 ›
          </Link>
        </div>
        <ul className="space-y-2">
          {homeCare.map((c) => {
            const daysSince = dayDiff(c.lastDone, TODAY);
            const daysLeft = c.cycleDays - daysSince;
            const isDue = !c.passive && daysLeft <= 0;
            return (
              <li
                key={c.id}
                className={`rounded-xl p-2.5 ring-1 ${
                  isDue ? "bg-warm/10 ring-warm/30" : "bg-surface-2 ring-border/60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-lg ring-1 ring-border">
                    {c.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-[13px] font-semibold">{c.title}</p>
                      <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] ${c.tagClass}`}>
                        {c.tag}
                      </span>
                    </div>
                        {/* Kept to one line: the full last-done date lives on
                            /parent/care, so the summary row only carries the
                            cycle and the next-due status. */}
                        <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                          {c.passive ? (
                            <span>{c.cycleDays <= 1 ? "每日" : `每 ${c.cycleDays} 天`}提醒 · 无需打卡</span>
                          ) : (
                            <>
                              每 {c.cycleDays} 天 ·{" "}
                              {isDue ? (
                                <span className="font-medium text-warm">今日到期</span>
                              ) : (
                                <span>{daysLeft} 天后</span>
                              )}
                            </>
                          )}
                        </p>
                  </div>
                  {c.passive ? (
                    <span className="shrink-0 rounded-full bg-surface px-2.5 py-1 text-[11px] text-muted-foreground ring-1 ring-border">
                      仅提醒
                    </span>
                  ) : isDue ? (
                    <ActionSheet
                      trigger={
                        <button className="shrink-0 rounded-full bg-warm px-2.5 py-1 text-[11px] text-warm-foreground">
                          去记录
                        </button>
                      }
                      title={c.id === "weight" ? "记录晨起体重" : `记录：${c.title}`}
                      description={c.id === "weight" ? "建议每周同一时间空腹测量，连续记录曲线更直观" : c.tag}
                      confirmText="保存记录"
                      toastMessage="已保存记录 "
                    >
                      {c.id === "weight" ? (
                        <div className="space-y-2 text-xs">
                          <label className="block">
                            <span className="text-muted-foreground">测量日期</span>
                            <input
                              type="date"
                              defaultValue={TODAY}
                              className="mt-1 w-full rounded-xl bg-surface-2 px-3 py-2 outline-none"
                            />
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            <label className="block">
                              <span className="text-muted-foreground">体重 (kg)</span>
                              <input
                                type="number"
                                step="0.1"
                                placeholder="如 28.6"
                                className="mt-1 w-full rounded-xl bg-surface-2 px-3 py-2 outline-none"
                              />
                            </label>
                            <label className="block">
                              <span className="text-muted-foreground">身高 (cm)</span>
                              <input
                                type="number"
                                step="0.1"
                                placeholder="如 128"
                                className="mt-1 w-full rounded-xl bg-surface-2 px-3 py-2 outline-none"
                              />
                            </label>
                          </div>
                          <label className="block">
                            <span className="text-muted-foreground">测量方式</span>
                            <select className="mt-1 w-full rounded-xl bg-surface-2 px-3 py-2 outline-none">
                              <option>手动录入</option>
                              <option>智能体脂秤同步</option>
                              <option>体检机���录入</option>
                            </select>
                          </label>
                          <label className="block">
                            <span className="text-muted-foreground">备注（可选）</span>
                            <textarea
                              rows={2}
                              placeholder="如：晨起空腹 / 运动后"
                              className="mt-1 w-full rounded-xl bg-surface-2 px-3 py-2 outline-none"
                            />
                          </label>
                          <p className="rounded-lg bg-surface-2 px-2.5 py-1.5 text-[11px] text-muted-foreground">
                            {<EIcon e="💡" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />} 已连接的智能秤会自动同步，无需手动录入。
                            <Link to="/parent/me" className="ml-1 text-warm">前往「我的数据」管理</Link>
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2 text-xs">
                          <label className="block">
                            <span className="text-muted-foreground">完成日期</span>
                            <input
                              type="date"
                              defaultValue={TODAY}
                              className="mt-1 w-full rounded-xl bg-surface-2 px-3 py-2 outline-none"
                            />
                          </label>
                          <label className="block">
                            <span className="text-muted-foreground">备注（可选）</span>
                            <textarea
                              rows={2}
                              className="mt-1 w-full rounded-xl bg-surface-2 px-3 py-2 outline-none"
                            />
                          </label>
                        </div>
                      )}
                    </ActionSheet>
                  ) : (
                    <span className="shrink-0 rounded-full bg-surface px-2.5 py-1 text-[11px] text-muted-foreground ring-1 ring-border">
                      已完成
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </section>
      )}


      {/* 健康百科 */}
      <section className="mx-5 mt-3 rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-border/60">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold">健康百科</h3>
            <span className="rounded-full bg-rose/10 px-2 py-0.5 text-[10px] text-rose">医生甄选内容</span>
          </div>
          <button
            onClick={() => toast("健康百科", { description: "已为您展开医生甄选的全部百科内容" })}
            className="text-[11px] font-medium text-rose"
          >
            进入百科 ›
          </button>
        </div>

        <div className="mb-3 flex gap-2 overflow-x-auto">
          {["全部", "▷ 视频", " 图文", " 直播"].map((t) => {
            const label = t.replace(/^[^\u4e00-\u9fa5]+/, "").trim() || t;
            const active = catTab === label || (t === "全部" && catTab === "全部");
            return (
              <button
                key={t}
                onClick={() => setCatTab(label)}
                className={`shrink-0 rounded-full px-3 py-1 text-[12px] ring-1 transition ${
                  active
                    ? "bg-rose text-rose-foreground ring-transparent"
                    : "bg-surface text-foreground ring-border"
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>
        <ul className="space-y-2.5">
          {encyclopedia.map((a) => (
            <li key={a.title} className="flex gap-3 rounded-2xl bg-surface-2 p-2.5">
              <div
                className={`grid h-20 w-20 shrink-0 place-items-start rounded-xl bg-gradient-to-br ${a.kindBg} p-1.5`}
              >
                <span className="rounded-md bg-black/40 px-1.5 py-0.5 text-[10px] text-white backdrop-blur">
                  {a.kind}
                </span>
              </div>
              <div className="flex min-w-0 flex-1 flex-col justify-between">
                <p className="text-[13px] font-semibold leading-snug">{a.title}</p>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-1.5">
                    <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] ${a.badgeClass}`}>
                      {a.badge}
                    </span>
                    <span className="truncate text-[11px] text-muted-foreground">{a.meta}</span>
                  </div>


                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* 健康服务包 */}
      <section className="mx-5 mt-3">
        <div className="mb-2 flex items-center gap-2">
          <h3 className="text-sm font-bold">配套健康服务包</h3>
          <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] text-success">医生团队提供</span>
        </div>
        <Link
          to="/parent/health-plan"
          className="relative block overflow-hidden rounded-2xl bg-gradient-to-r from-teal/90 to-teal/70 p-4 text-white shadow-lg shadow-teal/25"
        >
          <p className="text-[11px] text-white/85">{<EIcon e="✨" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />} 儿科呼吸科医生 & 营养师联合制定</p>
          <p className="mt-0.5 text-base font-bold">1v1 营养随行 · 体重陪跑 · 居家护理</p>
          <p className="mt-1 text-[12px] text-white/90">按孩子打卡数据动态调整，按需选配、不含商品销售</p>
          <div className="mt-3 flex items-center justify-between">
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-[11px] backdrop-blur">
              已服务 12,488 个家庭
            </span>
            <span className="rounded-full bg-white px-3 py-1.5 text-[12px] font-medium text-teal">
              查看服务包 ›
            </span>
          </div>
        </Link>
      </section>

      {/* Terminate soft entry */}
      <Link
        to="/parent/terminate"
        className="mx-5 mt-3 block rounded-2xl bg-surface p-3 text-center text-[11px] text-muted-foreground shadow-sm ring-1 ring-border/60"
      >
        随时可 <span className="text-danger">终止后续健康管理</span> · 历史报告保留
      </Link>
    </div>
  );
}
