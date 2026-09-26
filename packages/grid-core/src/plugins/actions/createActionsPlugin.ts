import type { GridPlugin } from "../../types";
import { createActionsToolbarItem } from "./ActionsToolbarItem";
import type { ActionsPluginHandle, ActionsPluginOptions } from "./types";

/**
 * Ready-made toolbar buttons (export, auto-size, fit), as a plugin.
 *
 * Create once per grid (at module level, or in a `useState` initialiser) and
 * keep the same `plugin` in `config.plugins` for the grid's life.
 */
export function createActionsPlugin<TRow = unknown>(
  options: ActionsPluginOptions,
): ActionsPluginHandle<TRow> {
  const plugin: GridPlugin<TRow> = {
    id: "actions",
    ToolbarItem: createActionsToolbarItem<TRow>(options.actions),
  };
  return { plugin };
}
