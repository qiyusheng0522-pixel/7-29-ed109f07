export type ConsentStatus = "pending" | "agreed" | "declined";
export const CONSENT_KEY = "parent_consent_v1";
export function readConsent(storage: Pick<Storage, "getItem">): ConsentStatus {
  const value = storage.getItem(CONSENT_KEY);
  return value === "agreed" || value === "declined" ? value : "pending";
}
export function writeConsent(storage: Pick<Storage, "setItem">, value: ConsentStatus) {
  storage.setItem(CONSENT_KEY, value);
}