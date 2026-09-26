import type { GridLayout } from "./types";

export type NameCheck = { ok: true; name: string } | { ok: false; message: string };

/**
 * A layout name must be non-empty after trimming, and must not match another
 * listed layout's name, ignoring case and surrounding spaces. The layout being
 * renamed (`ignoreId`) does not count against itself. "Default layout" is not
 * reserved.
 */
export function validateLayoutName(
  raw: string,
  layouts: readonly GridLayout[],
  ignoreId?: string,
): NameCheck {
  const name = raw.trim();
  if (name === "") {
    return { ok: false, message: "Enter a name for the layout." };
  }
  const key = name.toLowerCase();
  const taken = layouts.some(
    (layout) => layout.id !== ignoreId && layout.name.trim().toLowerCase() === key,
  );
  if (taken) {
    return { ok: false, message: `A layout named "${name}" already exists.` };
  }
  return { ok: true, name };
}

function randomId(): string {
  // randomUUID is missing on non-secure origins, so fall back to base36.
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `layout-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

/** A new id that no listed layout uses. */
export function generateLayoutId(layouts: readonly GridLayout[]): string {
  const used = new Set(layouts.map((layout) => layout.id));
  let id = randomId();
  while (used.has(id)) {
    id = randomId();
  }
  return id;
}
