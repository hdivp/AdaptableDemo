import { useState, type ComponentType } from "react";
import { DownloadIcon } from "../../internal/icons";
import type { GridPluginContext } from "../../types";
import { ACTION_CATALOG, type ActionGroup } from "./actionCatalog";
import type { GridActionKind } from "./types";

/**
 * Build the toolbar control for one plugin instance. Export kinds become one
 * format select plus an Export button; size kinds become icon buttons. Each
 * group sits where its first kind appears in `actions`. Every click acts on
 * the live grid through `ctx`.
 */
export function createActionsToolbarItem<TRow>(
  actions: GridActionKind[],
): ComponentType<{ ctx: GridPluginContext<TRow> }> {
  const kinds = [...new Set(actions)];
  const exportKinds = kinds.filter((kind) => ACTION_CATALOG[kind].group === "export");
  const sizeKinds = kinds.filter((kind) => ACTION_CATALOG[kind].group === "size");
  const groups = [...new Set(kinds.map((kind) => ACTION_CATALOG[kind].group))];

  function ExportGroup({ ctx }: { ctx: GridPluginContext<TRow> }): JSX.Element {
    const [format, setFormat] = useState<GridActionKind>(exportKinds[0]);
    return (
      <>
        <select
          className="gridcore-select gridcore-actions-format"
          aria-label="Export format"
          value={format}
          onChange={(event) => setFormat(event.target.value as GridActionKind)}
        >
          {exportKinds.map((kind) => (
            <option key={kind} value={kind}>
              {ACTION_CATALOG[kind].shortLabel}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="gridcore-btn gridcore-btn--primary"
          onClick={() => ACTION_CATALOG[format].run(ctx.api, ctx.gridId)}
        >
          <DownloadIcon />
          Export
        </button>
      </>
    );
  }

  function SizeGroup({ ctx }: { ctx: GridPluginContext<TRow> }): JSX.Element {
    return (
      <>
        {sizeKinds.map((kind) => {
          const action = ACTION_CATALOG[kind];
          const Icon = action.icon;
          return (
            <button
              key={kind}
              type="button"
              className="gridcore-btn"
              title={action.label}
              onClick={() => action.run(ctx.api, ctx.gridId)}
            >
              <Icon />
              {action.shortLabel}
            </button>
          );
        })}
      </>
    );
  }

  const GROUPS: Record<ActionGroup, typeof ExportGroup> = { export: ExportGroup, size: SizeGroup };

  function ActionsToolbarItem({ ctx }: { ctx: GridPluginContext<TRow> }): JSX.Element {
    return (
      <>
        {groups.map((group) => {
          const Group = GROUPS[group];
          return <Group key={group} ctx={ctx} />;
        })}
      </>
    );
  }
  return ActionsToolbarItem;
}
