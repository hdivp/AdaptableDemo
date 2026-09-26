import type { ColDef, GridApi, GridOptions } from "ag-grid-community";
import type { ComponentType } from "react";

/** The kind of data a column holds. Drives sensible AG Grid defaults. */
export type GridCoreDataType = "text" | "number" | "date" | "boolean";

/**
 * One column, described in our own simple terms.
 *
 * The wrapper turns this into an AG Grid `ColDef`. Anything we do not model
 * yet can still be set through `agColDef`, which is merged last.
 */
export interface GridCoreColumn<TRow = unknown> {
  /** Property on the row object. */
  field: Extract<keyof TRow, string> | string;
  /** Header text. Defaults to a title-cased version of `field`. */
  headerName?: string;
  /** Defaults to "text". */
  dataType?: GridCoreDataType;
  width?: number;
  /** Start this column hidden. */
  hidden?: boolean;
  /** Escape hatch. Raw AG Grid column options. Merged last, so it wins. */
  agColDef?: ColDef<TRow>;
}

/** Everything the wrapper needs to build a grid, apart from the rows. */
export interface GridCoreConfig<TRow = unknown> {
  /**
   * Stable identity for this grid. Features use it as a storage key, so keep
   * it constant across releases.
   */
  gridId: string;
  columns: GridCoreColumn<TRow>[];
  /**
   * Row property that uniquely identifies a row. Set it when the data can be
   * refreshed, so AG Grid can update rows in place instead of rebuilding them.
   */
  rowIdField?: Extract<keyof TRow, string>;
  /** AG Grid Enterprise licence key. Leave empty to run in trial mode. */
  licenseKey?: string;
  /** AG Grid v32 theme CSS class. Defaults to "ag-theme-quartz". */
  themeClass?: string;
  /** Height of the grid viewport. Defaults to "100%". */
  height?: string | number;
  /** Features plug in here. */
  plugins?: GridPlugin<TRow>[];
  /** Escape hatch. Raw AG Grid options. Merged last, so it wins. */
  agGridOptions?: GridOptions<TRow>;
}

export interface GridCoreProps<TRow = unknown> {
  /** The rows to show. */
  data: TRow[];
  config: GridCoreConfig<TRow>;
  /** Shows a simple overlay over the grid. */
  loading?: boolean;
  /** Called once the grid exists, after every plugin has run. */
  onGridReady?: (api: GridApi<TRow>) => void;
  /** Extra class on the wrapper root. */
  className?: string;
}

/** What a plugin is handed once the grid is alive. */
export interface GridPluginContext<TRow = unknown> {
  gridId: string;
  api: GridApi<TRow>;
  config: GridCoreConfig<TRow>;
}

/**
 * A feature that builds on the grid.
 *
 * Every higher level feature (saved layouts, conditional formatting, quick
 * search, export) is written as one of these, so `GridCore` itself never has
 * to change.
 */
export interface GridPlugin<TRow = unknown> {
  /** Unique among the plugins on one grid. */
  id: string;
  /**
   * Change the grid options before the grid is created. Plugins run in array
   * order, each one receiving the previous plugin's result.
   */
  applyGridOptions?: (
    options: GridOptions<TRow>,
    config: GridCoreConfig<TRow>,
  ) => GridOptions<TRow>;
  /**
   * Run once the grid api exists. Return a function to undo the work; the
   * wrapper calls it when the grid goes away.
   */
  onGridReady?: (ctx: GridPluginContext<TRow>) => void | (() => void);
  /** Optional control rendered in the wrapper toolbar. */
  ToolbarItem?: ComponentType<{ ctx: GridPluginContext<TRow> }>;
}
