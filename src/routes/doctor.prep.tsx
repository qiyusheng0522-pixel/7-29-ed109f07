import { createFileRoute } from "@tanstack/react-router";
import { StatusBar } from "@/components/MobileFrame";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/doctor/prep")({
  component: PrepPage,
});

type Item = { k: string; t: string; d: string };
type Group = { g: string; items: Item[] };
type Stage = {
  id: string;
  no: string;
  title: string;
  sub: string;
  tint: "warm" | "teal" | "deep" | "success";
  groups: Group[];
};

const stages: Stage[] = [
  {
    id: "s1",
    no: "一",
    title: "出诊前物资自查清单",
    sub: "出发前勾选",
    tint: "warm",
    groups: [
      {
        g: "1. 证件账号类",
        items: [
          { k: "s1-1", t: "医师执业证随身携带", d: "含副手医生，避免入校核验受阻" },
          { k: "s1-2", t: "体检系统账号、VPN 加密通道可正常登录", d: "出发前 30 分钟完成登录测试" },
          { k: "s1-3", t: "仪器计量检定证书复印件备齐", d: "如校方或质检抽查随时可出示" },
        ],
      },
      {
        g: "2. 设备校准类",
        items: [
          { k: "s1-4", t: "身高体重秤校准完成", d: "使用标准砝码现场校准，避免身高体重数据偏差" },
          { k: "s1-5", t: "电子血压计校准正常", d: "已在诊室与水银计对照，误差 ≤ 3 mmHg" },
          { k: "s1-6", t: "视力灯箱、色盲图谱完好可用", d: "灯箱亮度均匀，无褪色破损" },
          { k: "s1-7", t: "采血、检验设备通电调试完毕", d: "自检无报警，耗材接口对齐" },
        ],
      },
      {
        g: "3. 耗材医疗类",
        items: [
          { k: "s1-8", t: "一次性口腔 / 采血器械足量", d: "按学生数 ×1.2 备量，避免临时短缺" },
          { k: "s1-9", t: "消毒湿巾、碘伏、无菌棉签配齐", d: "分区放置，标签清晰" },
          { k: "s1-10", t: "医用手套、隔离衣、医疗废物盒到位", d: "医废盒盖闭合正常，双层黄色袋" },
          { k: "s1-11", t: "急救箱（AED、抗过敏药、葡萄糖）物资齐全", d: "AED 电量 ≥ 80%，药品在有效期内" },
        ],
      },
      {
        g: "4. 数据工具类",
        items: [
          { k: "s1-12", t: "平板、扫码枪电量充足、可扫码", d: "电量 ≥ 80%，备用充电宝随行" },
          { k: "s1-13", t: "本校学生学籍二维码档案提前导入系统", d: "已与校方教务确认名单一致" },
          { k: "s1-14", t: "纸质知情同意书、异常告知单备足", d: "按班级数 ×1.1 备量" },
        ],
      },
    ],
  },
  {
    id: "s2",
    no: "二",
    title: "入校场地对接核对",
    sub: "到校后第一时间核对",
    tint: "teal",
    groups: [
      {
        g: "",
        items: [
          { k: "s2-1", t: "体检场地分区完成", d: "登记 / 采血 / 内外科 / 眼科 分区不交叉" },
          { k: "s2-2", t: "检查隔间屏风到位，保护儿童隐私", d: "特别是身高体重、外科检查区" },
          { k: "s2-3", t: "场地供电稳定，插座满足设备使用", d: "确认无跳闸风险，备接线板" },
          { k: "s2-4", t: "等候区、动线划分清晰，避免拥挤", d: "地贴 / 引导员到位" },
          { k: "s2-5", t: "已和校医确认各班分批体检顺序", d: "打印排程表张贴现场" },
          { k: "s2-6", t: "留存校方、校医紧急联系电话", d: "存入手持终端及带队医生手机" },
        ],
      },
    ],
  },
  {
    id: "s3",
    no: "三",
    title: "现场体检质控核对",
    sub: "每批次体检循环自查",
    tint: "deep",
    groups: [
      {
        g: "",
        items: [
          { k: "s3-1", t: "每名学生先扫码核验身份，再录入体检数据", d: "一人一码绑定档案，杜绝不同学生数据混淆" },
          { k: "s3-2", t: "系统弹出异常数值时，当场二次复核确认", d: "BMI / 血压 / 视力异常需现场复测一次" },
          { k: "s3-3", t: "采血后及时做好止血安抚，备好糖果缓解儿童恐惧", d: "低龄段班级由护士全程陪同" },
          { k: "s3-4", t: "医疗垃圾及时分类投入专用收纳盒", d: "锐器盒与感染性废物分开，禁止混装" },
          { k: "s3-5", t: "查体完成即时保存数据，不离线积压多条记录", d: "每 10 人一次强制同步，避免网络异常丢数据" },
        ],
      },
    ],
  },
  {
    id: "s4",
    no: "四",
    title: "当日收尾 & 数据安全核对",
    sub: "体检结束离场前必查",
    tint: "success",
    groups: [
      {
        g: "",
        items: [
          { k: "s4-1", t: "当日全部学生体检数据完成二级人工抽查", d: "抽查比例 ≥ 10%，重点关注异常项" },
          { k: "s4-2", t: "逻辑错误、漏项数据全部修正完毕", d: "BMI、视力、血压等偏离正常区间数值需回溯体检原始记录确认" },
          { k: "s4-3", t: "学生数据仅经家长授权才可同步医院系统", d: "未授权数据仅保留在体检档案，不外发" },
          { k: "s4-4", t: "当日体检档案加密上传区域健康中台", d: "上传成功后本地缓存自动清理" },
          { k: "s4-5", t: "所有设备断电、耗材垃圾统一回收处理", d: "医废由校方专人签收" },
          { k: "s4-6", t: "操作日志、质控记录本地留存归档", d: "归档保存 ≥ 6 年备查" },
        ],
      },
    ],
  },
];

function PrepPage() {
  const allKeys = useMemo(
    () => stages.flatMap((s) => s.groups.flatMap((g) => g.items.map((i) => i.k))),
    [],
  );
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const toggle = (k: string) => setChecked((p) => ({ ...p, [k]: !p[k] }));
  const toggleOpen = (k: string) => setOpen((p) => ({ ...p, [k]: !p[k] }));

  const doneAll = allKeys.filter((k) => checked[k]).length;
  const pct = Math.round((doneAll / allKeys.length) * 100);

  return (
    <div>
      <StatusBar title="待办事项" />
      <div className="px-5 pb-24 pt-2">
        <h1 className="text-xl font-bold">待办事项</h1>
        <p className="mb-3 text-xs text-muted-foreground">
          阳光小学 · 春季体检 · 明日 08:30 · 214 人
        </p>

        {/* 总进度 */}
        <div className="mb-4 rounded-2xl bg-surface p-3 ring-1 ring-border/60">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">总核对进度</span>
            <span className="font-semibold">
              {doneAll} / {allKeys.length} · {pct}%
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full rounded-full bg-teal transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {stages.map((s) => {
          const stageKeys = s.groups.flatMap((g) => g.items.map((i) => i.k));
          const done = stageKeys.filter((k) => checked[k]).length;
          const stageOpen = !!open[s.id];
          return (
            <section key={s.id} className="mb-3 overflow-hidden rounded-2xl bg-surface shadow-sm ring-1 ring-border/60">
              <button
                onClick={() => toggleOpen(s.id)}
                className="flex w-full items-center justify-between gap-2 p-4 text-left"
              >
                <div className="flex items-center gap-2">
                  <span className={`grid h-6 w-6 place-items-center rounded-full bg-${s.tint}/15 text-xs font-bold text-${s.tint}`}>
                    {s.no}
                  </span>
                  <div>
                    <h2 className="text-sm font-semibold">{s.title}</h2>
                    <p className="text-[10px] text-muted-foreground">{s.sub}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full bg-${s.tint}/10 px-2 py-0.5 text-[10px] text-${s.tint}`}>
                    {done}/{stageKeys.length}
                  </span>
                  <span className={`text-xs text-muted-foreground transition-transform ${stageOpen ? "rotate-180" : ""}`}>⌄</span>
                </div>
              </button>

              {stageOpen && (
                <div className="border-t border-border/60 px-4 pb-4 pt-3">
                  {s.groups.map((g, gi) => (
                    <div key={gi} className={gi === 0 ? "" : "mt-3"}>
                      {g.g && <p className="mb-1 text-[11px] font-medium text-muted-foreground">{g.g}</p>}
                      <ul className="space-y-1.5">
                        {g.items.map((it) => {
                          const isOn = !!checked[it.k];
                          const isOpen = !!open[it.k];
                          return (
                            <li key={it.k} className="rounded-xl bg-surface-2 px-3 py-2">
                              <div className="flex items-start gap-2">
                                <button
                                  onClick={() => toggle(it.k)}
                                  className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded border ${
                                    isOn ? "border-teal bg-teal text-[10px] text-teal-foreground" : "border-muted-foreground/40"
                                  }`}
                                >
                                  {isOn ? "" : ""}
                                </button>
                                <button
                                  onClick={() => toggleOpen(it.k)}
                                  className="min-w-0 flex-1 text-left"
                                >
                                  <p className={`text-[13px] ${isOn ? "text-muted-foreground line-through" : ""}`}>
                                    {it.t}
                                  </p>
                                  {isOpen && (
                                    <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                                      {it.d}
                                    </p>
                                  )}
                                </button>
                                <button
                                  onClick={() => toggleOpen(it.k)}
                                  className="shrink-0 text-[10px] text-muted-foreground"
                                >
                                  {isOpen ? "收起" : "说明"}
                                </button>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </section>
          );
        })}

        <div className="fixed inset-x-0 bottom-16 z-10 mx-auto max-w-[430px] px-5 pb-3">
          <div className="grid grid-cols-2 gap-2 rounded-2xl bg-surface/95 p-2 shadow-lg ring-1 ring-border/60 backdrop-blur">
            <button
              onClick={() => toast.success("核对单已导出", { description: "已生成 PDF，可在消息中下载" })}
              className="rounded-xl bg-surface-2 py-2.5 text-sm"
            >
              导出核对单
            </button>
            <button
              disabled={pct < 100}
              onClick={() => toast.success("已确认体检就绪", { description: "所有准备项已完成核对" })}
              className="rounded-xl bg-deep py-2.5 text-sm font-semibold text-deep-foreground disabled:opacity-40"
            >
              {pct < 100 ? `还差 ${allKeys.length - doneAll} 项` : "确认已就绪"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
