import { createFileRoute, Outlet } from "@tanstack/react-router";
import { BottomNav } from "@/components/BottomNav";
import { MobileFrame } from "@/components/MobileFrame";

import { EIcon } from "@/components/EIcon";
export const Route = createFileRoute("/parent")({
  component: ParentLayout,
});

function ParentLayout() {
  return (
    <MobileFrame>
      {/* This wrapper owns scrolling (not the phone frame), so BottomNav can sit
          after it in normal flow and stay put. `min-h-0` gives it a definite
          height, which lets a page fill exactly one screen and pin its own
          footer (e.g. the chat composer) above the tab bar. */}
      <div className="no-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto">
        <Outlet />
      </div>
      <BottomNav
        accent="rose"
        items={[
          { to: "/parent", label: "首页", icon: <EIcon e="🏠" /> },
          { to: "/parent/health-plan", label: "健康方案", icon: <EIcon e="📋" /> },
          { to: "/parent/comm", label: "健康助手", icon: <EIcon e="💬" /> },
          { to: "/parent/me", label: "我的", icon: <EIcon e="👤" /> },
        ]}
      />
    </MobileFrame>
  );
}
