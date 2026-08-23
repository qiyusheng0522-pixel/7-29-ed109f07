import { createFileRoute, Outlet } from "@tanstack/react-router";
import { BottomNav } from "@/components/BottomNav";
import { MobileFrame } from "@/components/MobileFrame";
import { useSchoolView } from "@/lib/school-role";

import { EIcon } from "@/components/EIcon";
export const Route = createFileRoute("/school")({
  component: SchoolLayout,
});

function SchoolLayout() {
  const [view] = useSchoolView();
  // 班主任 / 体育老师视角不负责组织现场，隐藏「今日体检」
  const items =
    view === "pe"
      ? [
          { to: "/school", label: "工作台", icon: <EIcon e="🏫" /> },
          { to: "/school/fitness", label: "体适能", icon: <EIcon e="🏃" /> },
          { to: "/school/students", label: "学生", icon: <EIcon e="👨‍🎓" /> },
          { to: "/school/me", label: "我的", icon: <EIcon e="👤" /> },
        ]
      : [
          { to: "/school", label: "工作台", icon: <EIcon e="🏫" /> },
          ...(view === "teacher"
            ? []
            : [{ to: "/school/today", label: "今日体检", icon: <EIcon e="📅" /> }]),
          { to: "/school/students", label: view === "teacher" ? "我的班级" : "学生", icon: <EIcon e="👨‍🎓" /> },
          { to: "/school/intasks", label: "任务", icon: <EIcon e="✅" /> },
          { to: "/school/me", label: "我的", icon: <EIcon e="👤" /> },
        ];
  return (
    <MobileFrame>
      {/* This wrapper owns scrolling (not the phone frame), so BottomNav sits
          after it in normal flow and stays put. See parent.tsx for details. */}
      <div className="no-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto">
        <Outlet />
      </div>
      <BottomNav accent="teal" items={items} />
    </MobileFrame>
  );
}

