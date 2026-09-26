/** What the Layout toolbar can ask the plugin to do. Each returns an error or null. */
export interface LayoutActions {
  create: (name: string) => string | null;
  /** Renames and captures the grid's present state. Used by Save. */
  update: (id: string, name: string) => string | null;
  /** Renames only; the saved state is kept. */
  rename: (id: string, name: string) => string | null;
  remove: (id: string) => string | null;
  apply: (id: string) => string | null;
  applyDefault: () => string | null;
}
