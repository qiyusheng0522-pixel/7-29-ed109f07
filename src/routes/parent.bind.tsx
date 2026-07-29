import { createFileRoute, Link } from "@tanstack/react-router";
import { StatusBar } from "@/components/MobileFrame";
import { ActionSheet } from "@/components/ActionSheet";
import { child } from "@/lib/mock-data";

import { EIcon } from "@/components/EIcon";
export const Route = createFileRoute("/parent/bind")({
  component: BindPage,
});

const guardians = [
  { name: "李妈妈", relation: "母亲", phone: "138****2201", main: true },
  { name: "张爸爸", relation: "父亲", phone: "139****0866", main: false },
];

function BindPage() {
  return (
    <div>
      <StatusBar title="儿童绑定" />
      <div className="px-5 pb-8 pt-2">
        <div className="mb-4 overflow-hidden rounded-3xl bg-gradient-to-br from-warm to-warm/70 p-5 text-white shadow-lg shadow-warm/20">
          <div className="flex items-center gap-3">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/25 text-2xl backdrop-blur">
              {child.avatar}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-base font-bold">{child.name}</p>
              <p className="text-xs text-white/85">{child.school} · {child.grade}{child.className}</p>
              <p className="text-[11px] text-white/70">学号 {child.studentId}</p>
            </div>
            <span className="rounded-full bg-white/25 px-2 py-1 text-[11px]">已绑定</span>
          </div>
        </div>

        <section className="mb-4 rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-border/60">
          <h2 className="mb-3 text-sm font-semibold">核对儿童基础信息</h2>
          <ul className="divide-y divide-border/60 text-xs">
            {[
              ["姓名", child.name],
              ["性别", child.gender],
              ["年龄", `${child.age} 岁`],
              ["学校", child.school],
              ["年级班级", `${child.grade}${child.className}`],
              ["学号", child.studentId],
            ].map(([k, v]) => (
              <li key={k} className="flex justify-between py-2.5">
                <span className="text-muted-foreground">{k}</span>
                <span className="font-medium">{v}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[11px] text-muted-foreground">
            如信息有误，请联系班主任协助更正。
          </p>
        </section>

        <section className="mb-4 rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-border/60">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">监护人</h2>
            <ActionSheet
              trigger={<button className="text-xs text-warm">+ 邀请另一位监护人</button>}
              title="邀请另一位监护人"
              description="邀请码有效期 24 小时，对方通过微信扫码或输入邀请码即可绑定同一名孩子。"
              confirmText="发送邀请"
              toastMessage="邀请已发送"
              toastDescription="邀请码 8F2K-91 · 24 小时内有效"
            >
              <div className="space-y-2 text-xs">
                <label className="block">
                  <span className="text-muted-foreground">关系</span>
                  <select className="mt-1 w-full rounded-xl bg-surface-2 px-3 py-2 outline-none">
                    <option>父亲</option><option>母亲</option><option>祖辈</option><option>其他</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-muted-foreground">手机号</span>
                  <input placeholder="接收邀请短信" className="mt-1 w-full rounded-xl bg-surface-2 px-3 py-2 outline-none" />
                </label>
              </div>
            </ActionSheet>
          </div>
          <ul className="space-y-2">
            {guardians.map((g) => (
              <li
                key={g.name}
                className="flex items-center gap-3 rounded-xl bg-surface-2 p-3"
              >
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-warm/15 text-lg">
                  {g.relation === "母亲" ? "" : ""}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">
                    {g.name}
                    {g.main && (
                      <span className="ml-2 rounded-full bg-warm/15 px-2 py-0.5 text-[10px] text-warm">
                        主监护人
                      </span>
                    )}
                  </p>
                  <p className="text-[11px] text-muted-foreground">{g.relation} · {g.phone}</p>
                </div>
                <ActionSheet
                  trigger={<button className="text-xs text-muted-foreground">修改</button>}
                  title={`修改 ${g.name} 的信息`}
                  description="修改监护人关系或联系电话，保存后其他监护人可见。"
                  confirmText="保存"
                  toastMessage="监护人信息已更新"
                >
                  <div className="space-y-2 text-xs">
                    <label className="block">
                      <span className="text-muted-foreground">关系</span>
                      <select defaultValue={g.relation} className="mt-1 w-full rounded-xl bg-surface-2 px-3 py-2 outline-none">
                        <option>父亲</option><option>母亲</option><option>祖辈</option><option>其他</option>
                      </select>
                    </label>
                    <label className="block">
                      <span className="text-muted-foreground">手机号</span>
                      <input defaultValue={g.phone} className="mt-1 w-full rounded-xl bg-surface-2 px-3 py-2 outline-none" />
                    </label>
                  </div>
                </ActionSheet>
              </li>
            ))}
          </ul>
        </section>

        <ActionSheet
          trigger={
            <button className="w-full rounded-2xl bg-surface p-3 text-sm shadow-sm ring-1 ring-border/60">
              {<EIcon e="➕" className="inline-block h-[1.15em] w-[1.15em] align-[-0.15em]" />} 绑定另一个孩子
            </button>
          }
          title="绑定另一个孩子"
          description="请输入孩子的学号与姓名，系统将校验学籍信息后完成绑定。"
          confirmText="提交绑定"
          toastMessage="绑定申请已提交"
          toastDescription="学籍核验通过后即可查看该孩子的体检报告"
        >
          <div className="space-y-2 text-xs">
            <label className="block">
              <span className="text-muted-foreground">孩子姓名</span>
              <input placeholder="请输入姓名" className="mt-1 w-full rounded-xl bg-surface-2 px-3 py-2 outline-none" />
            </label>
            <label className="block">
              <span className="text-muted-foreground">学号</span>
              <input placeholder="请输入学号" className="mt-1 w-full rounded-xl bg-surface-2 px-3 py-2 outline-none" />
            </label>
            <label className="block">
              <span className="text-muted-foreground">与孩子关系</span>
              <select className="mt-1 w-full rounded-xl bg-surface-2 px-3 py-2 outline-none">
                <option>父亲</option><option>母亲</option><option>祖辈</option><option>其他</option>
              </select>
            </label>
          </div>
        </ActionSheet>

        <Link
          to="/parent/me"
          className="mt-3 block text-center text-xs text-muted-foreground"
        >
          返回我的
        </Link>
      </div>
    </div>
  );
}
