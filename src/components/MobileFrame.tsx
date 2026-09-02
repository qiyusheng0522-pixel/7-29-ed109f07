import { useState, type ReactNode } from "react";
import { useRouter, useRouterState } from "@tanstack/react-router";
import { BatteryFull, ChevronLeft, Wifi } from "lucide-react";
import { RoleSwitcher } from "./RoleSwitcher";
import { ScreenPortalProvider } from "./screen-portal";

export function MobileFrame({
  children,
  bg = "bg-surface-2",
}: {
  children: ReactNode;
  bg?: string;
}) {
  // Overlays are portaled into the screen element so they stay inside the device.
  const [screen, setScreen] = useState<HTMLDivElement | null>(null);

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-[radial-gradient(120%_120%_at_50%_0%,oklch(0.97_0.012_240),oklch(0.9_0.015_235))] px-4 py-6">
      <div className="w-full max-w-[402px]">
        {/* Phone device frame (iPhone 17 · 402 × 874, true device size).
            The screen height collapses to the viewport on short windows so the
            device never forces the outer page to scroll. */}
        <div className="relative mx-auto w-full max-w-[402px]">
          {/* Side buttons */}
          <span className="absolute -left-[3px] top-24 h-8 w-[3px] rounded-l bg-slate-400/70" />
          <span className="absolute -left-[3px] top-36 h-12 w-[3px] rounded-l bg-slate-400/70" />
          <span className="absolute -left-[3px] top-52 h-12 w-[3px] rounded-l bg-slate-400/70" />
          <span className="absolute -right-[3px] top-40 h-16 w-[3px] rounded-r bg-slate-400/70" />
          {/* Bezel */}
          <div className="rounded-[44px] bg-slate-900 p-[10px] shadow-[0_30px_80px_-20px_rgba(15,23,42,0.5),0_0_0_2px_rgba(255,255,255,0.06)_inset]">
            {/* `transform-gpu` makes this element a containing block, so any
                `position: fixed` overlay portaled inside it is clipped to the
                screen instead of the browser viewport. */}
            <div
              ref={setScreen}
              className={`relative transform-gpu overflow-hidden rounded-[36px] ${bg}`}
            >
              {/* Safe-area mask: keeps scrolled content from bleeding into the
                  notch strip. Painted in the screen's own background colour so
                  it is invisible at rest, and sits under the notch (z-30). */}
              <div className={`pointer-events-none absolute inset-x-0 top-0 z-20 h-8 ${bg}`} />
              {/* Dynamic Island / Notch */}
              <div className="pointer-events-none absolute left-1/2 top-2 z-30 h-6 w-28 -translate-x-1/2 rounded-full bg-slate-900" />
              {/* The screen itself is a fixed-height, NON-scrolling flex column.
                  Scrolling belongs to the page wrapper inside each end's layout,
                  so the bottom nav can sit after it in normal flow and never
                  scroll away or overlap content. */}
              <div className="flex h-[min(874px,calc(100svh-140px))] flex-col overflow-hidden pt-8">
                <ScreenPortalProvider value={screen}>{children}</ScreenPortalProvider>
              </div>
              {/* Home indicator */}
              <div className="pointer-events-none absolute bottom-1.5 left-1/2 z-30 h-1 w-28 -translate-x-1/2 rounded-full bg-slate-900/35" />
            </div>
          </div>
        </div>

        <RoleSwitcher />
      </div>
    </div>
  );
}

// Tab-root pages (each end's bottom-nav destinations) — don't show a back arrow here.
const TAB_ROOTS = new Set<string>([
  "/",
  "/parent",
  "/parent/",
  "/parent/health-plan",
  "/parent/comm",
  "/parent/me",
  "/doctor",
  "/doctor/",
  "/doctor/exam",
  "/doctor/plan",
  "/doctor/comm",
  "/doctor/me",
  "/school",
  "/school/",
  "/school/today",
  "/school/students",
  "/school/intasks",
  "/school/me",
  "/community",
  "/community/",
  "/community/patients",
  "/community/edu",
  "/community/consult",
  "/community/me",
]);

export function StatusBar({
  title,
  right,
  back,
}: {
  title?: string;
  right?: ReactNode;
  /** Force show/hide back button. Defaults: hidden on tab roots, shown elsewhere. */
  back?: boolean;
}) {
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const showBack = back ?? !TAB_ROOTS.has(pathname);

  return (
    <div className="flex items-center gap-2 px-4 pt-2.5 text-[11px] text-muted-foreground">
      <span className="flex min-w-0 flex-1 items-center gap-1.5">
        {showBack ? (
          <button
            type="button"
            onClick={() => router.history.back()}
            aria-label="返回"
            className="-ml-1.5 grid h-7 w-7 shrink-0 place-items-center rounded-full text-foreground/70 transition hover:bg-foreground/5 active:scale-95"
          >
            <ChevronLeft className="h-[18px] w-[18px]" strokeWidth={2.5} />
          </button>
        ) : (
          <span className="font-semibold tabular-nums text-foreground/70">9:41</span>
        )}
      </span>

      {title ? (
        <span className="max-w-[55%] truncate text-center text-[12px] font-semibold text-foreground">
          {title}
        </span>
      ) : null}

      <span className="flex flex-1 items-center justify-end gap-1.5">
        {right}
        <SignalBars />
        <Wifi className="h-3 w-3 text-foreground/55" strokeWidth={2.5} />
        <BatteryFull className="h-4 w-4 text-foreground/55" strokeWidth={2} />
      </span>
    </div>
  );
}

/** Decorative iOS-style signal strength indicator. */
function SignalBars() {
  return (
    <span aria-hidden="true" className="flex items-end gap-[1.5px]">
      {[4, 6, 8, 10].map((h) => (
        <span key={h} className="w-[2.5px] rounded-full bg-foreground/55" style={{ height: h }} />
      ))}
    </span>
  );
}
