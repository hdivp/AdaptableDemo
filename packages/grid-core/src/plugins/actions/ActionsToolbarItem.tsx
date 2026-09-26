import type { ComponentType } from "react";
import type { GridPluginContext } from "../../types";
import { ACTION_CATALOG } from "./actionCatalog";
import type { GridActionKind } from "./types";

/**
 * Build the toolbar control for one plugin instance: one button per entry in
 * `actions`, in array order. Each click acts on the live grid through `ctx`.
 */
export function createActionsToolbarItem<TRow>(
  actions: GridActionKind[],
): ComponentType<{ ctx: GridPluginContext<TRow> }> {
  function ActionsToolbarItem({ ctx }: { ctx: GridPluginContext<TRow> }): JSX.Element {
    return (
      <>
        {actions.map((kind, index) => {
          const action = ACTION_CATALOG[kind];
          return (
            <button
              key={`${kind}-${index}`}
              type="button"
              onClick={() => action.run(ctx.api, ctx.gridId)}
            >
              {action.label}
            </button>
          );
        })}
      </>
    );
  }
  return ActionsToolbarItem;
}
