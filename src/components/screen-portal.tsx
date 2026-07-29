import * as React from "react";

/**
 * Holds the phone-screen DOM node used as the portal target for overlays
 * (sheets, dialogs, drawers, toasts).
 *
 * Radix portals default to `document.body`, which makes `position: fixed`
 * overlays cover the whole browser window and spill outside the simulated
 * device. Rendering them into the screen element instead — which is also a
 * containing block (see `MobileFrame`) — keeps `fixed inset-0` aligned to the
 * phone screen with no per-overlay CSS changes.
 *
 * Returns `null` outside a `MobileFrame` (e.g. the PC admin and TV dashboard
 * routes), where the default body portal is the correct behaviour.
 */
const ScreenPortalContext = React.createContext<HTMLElement | null>(null);

export const ScreenPortalProvider = ScreenPortalContext.Provider;

export function useScreenPortal() {
  return React.useContext(ScreenPortalContext);
}
