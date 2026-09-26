import type { ColumnState, FilterModel } from "ag-grid-community";
import type { GridPlugin } from "../../types";

/** Opaque to the consumer. Store and return it unchanged; it survives JSON. */
export interface GridLayoutState {
  version: 1;
  columnState: ColumnState[];
  filterModel: FilterModel;
  pivotMode: boolean;
}

export interface GridLayout {
  id: string;
  name: string;
  state: GridLayoutState;
}

/** Id of a layout, or null meaning "Default layout". */
export type GridLayoutId = string | null;

/** The id used for "Default layout" in `onLayoutApply`. */
export const DEFAULT_LAYOUT_ID = null;

export interface LayoutPluginOptions {
  /** Saved layouts supplied at bind time. May be empty. */
  layouts: GridLayout[];
  /** Start in this layout. Absent or unknown -> Default. */
  initialLayoutId?: string;
  onLayoutCreate?: (layout: GridLayout) => void;
  onLayoutUpdate?: (layout: GridLayout) => void;
  onLayoutDelete?: (id: string) => void;
  onLayoutApply?: (id: GridLayoutId) => void;
}

export interface LayoutPluginHandle<TRow = unknown> {
  /** Put this in config.plugins. Keep the same instance for the grid's life. */
  plugin: GridPlugin<TRow>;
  /** Replace the wrapper's list entirely. Does not change the grid. */
  setLayouts: (layouts: GridLayout[]) => void;
}
