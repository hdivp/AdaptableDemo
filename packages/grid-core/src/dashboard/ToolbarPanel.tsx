import { XIcon } from "../internal/icons";
import type { GridPlugin, GridPluginContext } from "../types";

export interface ToolbarPanelProps<TRow> {
  /** A plugin that has a `ToolbarItem`. */
  plugin: GridPlugin<TRow>;
  ctx: GridPluginContext<TRow>;
  /** Hide this panel on the current tab. */
  onHide: () => void;
}

/** The panel title: the plugin's `toolbarTitle`, else its id. */
export function toolbarTitleOf(plugin: GridPlugin<unknown>): string {
  return plugin.toolbarTitle ?? plugin.id;
}

/** One bordered panel: a title strip with a hide button, then the plugin's control. */
export function ToolbarPanel<TRow>({ plugin, ctx, onHide }: ToolbarPanelProps<TRow>): JSX.Element {
  const title = toolbarTitleOf(plugin as GridPlugin<unknown>);
  const ToolbarItem = plugin.ToolbarItem!;

  return (
    <section className="gridcore-panel" aria-label={`${title} toolbar`}>
      <div className="gridcore-panel-cap">
        <span className="gridcore-panel-title">{title}</span>
        <button
          type="button"
          className="gridcore-panel-hide"
          aria-label={`Hide ${title}`}
          title={`Hide ${title}`}
          onClick={onHide}
        >
          <XIcon />
        </button>
      </div>
      <div className="gridcore-panel-body">
        <ToolbarItem ctx={ctx} />
      </div>
    </section>
  );
}
