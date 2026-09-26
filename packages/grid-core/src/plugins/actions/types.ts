import type { GridPlugin } from "../../types";

export type GridActionKind =
  | "exportCsv"
  | "exportExcel"
  | "autosizeColumns"
  | "fitColumns";

export interface ActionsPluginOptions {
  /**
   * Buttons to show, and the order they appear in. A kind repeated more than
   * once renders more than once; not defined behaviour beyond that.
   */
  actions: GridActionKind[];
}

export interface ActionsPluginHandle<TRow = unknown> {
  /** Put this in config.plugins. */
  plugin: GridPlugin<TRow>;
}
