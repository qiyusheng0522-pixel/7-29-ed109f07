import { createFileRoute, Link } from "@tanstack/react-router";
import { StatusBar } from "@/components/MobileFrame";
import { ActionSheet } from "@/components/ActionSheet";

export const Route = createFileRoute("/doctor/coord")({
  component: CoordPage,
});

const escalations = [
  {
    who: "健管师 刘老师",
    time: "12 分钟前",
    child: "刘小强 · 5年1班",
    msg: "家长反馈近 3 天夜间打鼾加重，是否需要提前呼吸科复核？",
    tag: "升级",
    tint: "danger",
  },
  {
    who: "健管师 刘老师",
    time: "今日 09:20",
    child: "张小乐 · 1年1班",
    msg: "家庭任务完成率仅 32%，家长回复困难，是否医生介入沟通？",
    tag: "执行率异常",
    tint: "warm",
  },
  {
    who: "健管师 王老师",
    time: "昨日",
    child: "陈小美 · 4年2班",
    msg: "1 个月复评问卷未填，多次提醒无回应。",
    tag: "复评异常",
    tint: "warning",
  },
];

function CoordPage() {
  return (
    <div>
      <StatusBar title="健康管理师协同" />
      <div className="px-5 pb-8 pt-2">
        <h1 className="text-xl font-bold">健管师协同</h1>
        <p className="mb-4 text-xs text-muted-foreground">升级事项 · 家长沟通 · 执行率/复评异常</p>

        <ul className="space-y-3">
          {escalations.map((e, i) => (
            <li key={i} className="rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-border/60">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{e.who} · {e.time}</p>
                <span className={`rounded-full bg-${e.tint}/15 px-2 py-0.5 text-[10px] text-${e.tint}`}>
                  {e.tag}
                </span>
              </div>
              <p className="mt-2 text-sm font-semibold">{e.child}</p>
              <p className="mt-1 rounded-xl bg-surface-2 p-3 text-xs leading-relaxed">{e.msg}</p>
              <div className="mt-3 flex gap-2">
                <Link to="/doctor/child" className="flex-1 rounded-xl bg-surface-2 py-2 text-center text-xs">查看档案</Link>
                <ActionSheet
                  trigger={<button className="flex-1 rounded-xl bg-teal/15 py-2 text-xs text-teal">回复健管师</button>}
                  title={`回复 ${e.who}`}
                  description={`关于 ${e.child}：${e.msg}`}
                  confirmText="发送回复"
                  toastMessage="回复已发送健管师"
                >
                  <label className="block text-xs">
                    <span className="text-muted-foreground">回复内容</span>
                    <textarea
                      rows={3}
                      placeholder="如：建议先安排一次呼吸科门诊复核"
                      className="mt-1 w-full rounded-xl bg-surface-2 px-3 py-2 outline-none"
                    />
                  </label>
                </ActionSheet>
                <ActionSheet
                  trigger={
                    <button className="flex-1 rounded-xl bg-deep py-2 text-xs font-medium text-deep-foreground">
                      升级复核
                    </button>
                  }
                  title={`升级复核 ${e.child}？`}
                  description="升级后将进入医生复核队列，优先安排专科评估。"
                  confirmText="确认升级"
                  toastMessage="已升级至医生复核"
                  toastType="info"
                />
              </div>
              <div className="mt-2 flex justify-end">
                <ActionSheet
                  trigger={<button className="text-[11px] text-muted-foreground underline">降级为健管师跟进</button>}
                  title={`降级 ${e.child} 为健管师跟进？`}
                  description="降级后由健管师日常跟进，医生不再直接介入本条事项。"
                  confirmText="确认降级"
                  toastMessage="已降级为健管师跟进"
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
