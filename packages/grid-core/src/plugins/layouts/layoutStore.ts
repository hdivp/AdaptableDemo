import type { GridApi } from "ag-grid-community";
import type { GridLayout, GridLayoutId } from "./types";

export interface LayoutStoreSnapshot {
  layouts: readonly GridLayout[];
  /** string = that layout, null = Default, undefined = none marked. */
  currentId: GridLayoutId | undefined;
}

export interface LayoutStore {
  /** Stable object between changes, as `useSyncExternalStore` needs. */
  getSnapshot(): LayoutStoreSnapshot;
  subscribe(listener: () => void): () => void;
  /** Swap the whole list. Drops the current marker if its layout is gone. */
  replace(layouts: GridLayout[]): void;
  add(layout: GridLayout): void;
  update(layout: GridLayout): void;
  remove(id: string): void;
  setCurrent(id: GridLayoutId | undefined): void;
  /** The live grid api, or null while no grid is attached. */
  api: GridApi | null;
}

/**
 * A tiny per-instance store. It outlives the grid, so the list and the current
 * layout survive the grid being recreated.
 */
export function createLayoutStore(layouts: GridLayout[]): LayoutStore {
  let snapshot: LayoutStoreSnapshot = { layouts: [...layouts], currentId: null };
  const listeners = new Set<() => void>();

  // Every change makes a new snapshot object, so subscribers see it change.
  function set(next: Partial<LayoutStoreSnapshot>): void {
    snapshot = { ...snapshot, ...next };
    for (const listener of listeners) {
      listener();
    }
  }

  return {
    api: null,
    getSnapshot: () => snapshot,
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    replace(next) {
      // A named current layout that is not in the new list is no longer
      // marked. Default (null) and "none" (undefined) stay as they are.
      const { currentId } = snapshot;
      const dropped =
        typeof currentId === "string" && !next.some((item) => item.id === currentId);
      set({ layouts: [...next], currentId: dropped ? undefined : currentId });
    },
    add(layout) {
      set({ layouts: [...snapshot.layouts, layout] });
    },
    update(layout) {
      set({
        layouts: snapshot.layouts.map((item) =>
          item.id === layout.id ? layout : item,
        ),
      });
    },
    remove(id) {
      set({ layouts: snapshot.layouts.filter((item) => item.id !== id) });
    },
    setCurrent(id) {
      set({ currentId: id });
    },
  };
}
