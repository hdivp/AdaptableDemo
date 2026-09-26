import type { GridOptions } from "ag-grid-community";
import type { GridCoreConfig, GridPlugin, GridPluginContext } from "../types";

/**
 * Let every plugin adjust the grid options, in array order. Each plugin sees
 * the previous plugin's result.
 */
export function foldGridOptions<TRow>(
  options: GridOptions<TRow>,
  config: GridCoreConfig<TRow>,
  plugins: GridPlugin<TRow>[],
): GridOptions<TRow> {
  return plugins.reduce<GridOptions<TRow>>(
    (acc, plugin) => plugin.applyGridOptions?.(acc, config) ?? acc,
    options,
  );
}

/**
 * Start every plugin now that the grid api exists. Returns one function that
 * undoes all of their work.
 */
export function startPlugins<TRow>(
  ctx: GridPluginContext<TRow>,
  plugins: GridPlugin<TRow>[],
): () => void {
  const cleanups: Array<() => void> = [];
  for (const plugin of plugins) {
    const cleanup = plugin.onGridReady?.(ctx);
    if (typeof cleanup === "function") {
      cleanups.push(cleanup);
    }
  }
  return () => {
    // Undo in reverse order, so plugins tear down like a stack.
    for (const cleanup of cleanups.reverse()) {
      cleanup();
    }
  };
}
