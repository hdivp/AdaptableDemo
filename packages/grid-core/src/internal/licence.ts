import { LicenseManager } from "ag-grid-enterprise";

let appliedKey: string | undefined;

/**
 * Hand the licence key to AG Grid Enterprise, at most once per key.
 *
 * With no key the grid runs in trial mode: it draws a watermark and logs an
 * error. That is expected, so this function stays quiet about it.
 */
export function applyLicence(key: string | undefined): void {
  if (!key || key === appliedKey) {
    return;
  }
  LicenseManager.setLicenseKey(key);
  appliedKey = key;
}
