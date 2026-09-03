// 体检工位（设备账号）：每台体检设备绑定一个账号，
// 医生用该账号登录小程序后，只会看到本工位负责的体检项。
import { EXAM_ITEMS, type ExamItem } from "./exam-record";

export type ExamStation = {
  id: string;
  /** 设备账号（登录名） */
  account: string;
  /** 工位名称 */
  name: string;
  /** 绑定设备 */
  devices: string[];
  /** 负责的体检项 id（对应 EXAM_ITEMS） */
  itemIds: string[];
  doctor: string;
  location: string;
};

export const EXAM_STATIONS: ExamStation[] = [
  {
    id: "s1",
    account: "DEV-BODY-01",
    name: "一号工位 · 形体与视力",
    devices: ["身高体脂分析仪", "视力筛查仪"],
    itemIds: ["height", "weight", "bodyfat", "vision-l", "vision-r"],
    doctor: "陈医生",
    location: "阳光小学 · 一楼多功能厅 A 区",
  },
  {
    id: "s2",
    account: "DEV-CIRC-02",
    name: "二号工位 · 围度与血压",
    devices: ["腰臀围尺", "血压测量仪"],
    itemIds: ["waist", "hip", "bp"],
    doctor: "林医生",
    location: "阳光小学 · 一楼多功能厅 B 区",
  },
  {
    id: "s3",
    account: "DEV-MANU-03",
    name: "三号工位 · 脊柱与口腔",
    devices: ["脊柱侧弯测量尺（手工）", "口腔目测"],
    itemIds: ["spine", "oral"],
    doctor: "赵医生",
    location: "阳光小学 · 一楼多功能厅 C 区",
  },
];

/** 当前登录的设备账号（原型：默认一号工位） */
export const CURRENT_STATION_ID = "s1";

export function findStation(id?: string): ExamStation | undefined {
  if (!id) return undefined;
  return EXAM_STATIONS.find((s) => s.id === id || s.account === id);
}

export function stationItems(station?: ExamStation): ExamItem[] {
  if (!station) return EXAM_ITEMS;
  const list = station.itemIds
    .map((id) => EXAM_ITEMS.find((i) => i.id === id))
    .filter(Boolean) as ExamItem[];
  return list.length ? list : EXAM_ITEMS;
}
