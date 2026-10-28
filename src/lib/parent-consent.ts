export type ConsentStatus = "pending" | "agreed" | "declined";
export const CONSENT_KEY = "parent_consent_v1";
export const SIGNATURE_KEY = "parent_consent_signature_v1";
export function readConsent(storage: Pick<Storage, "getItem">): ConsentStatus {
  const value = storage.getItem(CONSENT_KEY);
  return value === "agreed" || value === "declined" ? value : "pending";
}
export function writeConsent(storage: Pick<Storage, "setItem">, value: ConsentStatus) {
  storage.setItem(CONSENT_KEY, value);
}
export type SavedSignature = { image: string; signedAt: string };
export function saveSignature(storage: Pick<Storage, "setItem">, image: string): SavedSignature {
  const sig = { image, signedAt: new Date().toISOString() };
  storage.setItem(SIGNATURE_KEY, JSON.stringify(sig));
  return sig;
}
export function readSignature(storage: Pick<Storage, "getItem">): SavedSignature | null {
  try { const v = JSON.parse(storage.getItem(SIGNATURE_KEY) ?? "null"); return v?.image ? v : null; } catch { return null; }
}
