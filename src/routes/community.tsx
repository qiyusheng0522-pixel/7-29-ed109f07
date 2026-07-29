import { createFileRoute, Outlet } from "@tanstack/react-router";
import { BottomNav } from "@/components/BottomNav";
import { MobileFrame } from "@/components/MobileFrame";

import { EIcon } from "@/components/EIcon";
export const Route = createFileRoute("/community")({
  component: CommunityLayout,
});

function CommunityLayout() {
  return (
    <MobileFrame>
      {/* This wrapper owns scrolling (not the phone frame), so BottomNav sits
          after it in normal flow and stays put. See parent.tsx for details. */}
      <div className="no-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto">
        <Outlet />
      </div>
      <BottomNav
        accent="warm"
        items={[
          { to: "/community", label: "工作台", icon: <EIcon e="🏥" /> },
          { to: "/community/patients", label: "在管患者", icon: <EIcon e="👥" /> },
          { to: "/community/consult", label: "健康咨询", icon: <EIcon e="💬" /> },
          { to: "/community/me", label: "我的", icon: <EIcon e="👤" /> },
        ]}
      />
    </MobileFrame>
  );
}
