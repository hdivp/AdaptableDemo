import type {
  ColumnEventType,
  ColumnResizedEvent,
  GridApi,
} from "ag-grid-community";
import type { GridPlugin } from "../../types";
import type { LayoutActions } from "./LayoutPopup";
import { generateLayoutId, validateLayoutName } from "./layoutRules";
import { applyLayoutState, captureLayoutState, resetToDefault } from "./layoutState";
import { createLayoutStore } from "./layoutStore";
import { createLayoutToolbarItem } from "./LayoutToolbarItem";
import {
  DEFAULT_LAYOUT_ID,
  type GridLayout,
  type LayoutPluginHandle,
  type LayoutPluginOptions,
} from "./types";

const NOT_READY = "The grid is not ready yet.";
const NOT_FOUND = "That layout no longer exists.";
/** Column resize sources used by the grid's own `autoSizeStrategy`. */
const AUTO_SIZE_SOURCES: ColumnEventType[] = ["sizeColumnsToFit", "autosizeColumns"];

/**
 * Saved layouts, as a plugin.
 *
 * Create once per grid (at module level, or in a `useState` initialiser) and
 * keep the same `plugin` in `config.plugins` for the grid's life. A new plugin
 * on every render re-folds the grid options and resets the columns.
 */
export function createLayoutPlugin<TRow = unknown>(
  options: LayoutPluginOptions,
): LayoutPluginHandle<TRow> {
  const store = createLayoutStore(options.layouts);
  // Start in the requested layout if the list has it, else in Default.
  const { initialLayoutId } = options;
  if (options.layouts.some((item) => item.id === initialLayoutId)) {
    store.setCurrent(initialLayoutId);
  }
  // Pivot mode is a grid option, not column state, so Default needs it kept.
  let boundPivotMode = false;

  // Every action changes the store first, then tells the consumer once. Each
  // returns an error message for the pop-up, or null when it worked.
  const actions: LayoutActions = {
    create(rawName) {
      const { api } = store;
      if (!api) {
        return NOT_READY;
      }
      const { layouts } = store.getSnapshot();
      const check = validateLayoutName(rawName, layouts);
      if (!check.ok) {
        return check.message;
      }
      const layout: GridLayout = {
        id: generateLayoutId(layouts),
        name: check.name,
        state: captureLayoutState(api),
      };
      store.add(layout);
      store.setCurrent(layout.id);
      options.onLayoutCreate?.(layout);
      return null;
    },
    update(id, rawName) {
      const { api } = store;
      if (!api) {
        return NOT_READY;
      }
      const { layouts } = store.getSnapshot();
      if (!layouts.some((item) => item.id === id)) {
        return NOT_FOUND;
      }
      const check = validateLayoutName(rawName, layouts, id);
      if (!check.ok) {
        return check.message;
      }
      const layout: GridLayout = { id, name: check.name, state: captureLayoutState(api) };
      store.update(layout);
      store.setCurrent(id);
      options.onLayoutUpdate?.(layout);
      return null;
    },
    remove(id) {
      const { layouts, currentId } = store.getSnapshot();
      if (!layouts.some((item) => item.id === id)) {
        return NOT_FOUND;
      }
      store.remove(id);
      // The grid keeps what it shows; it just no longer matches a named layout.
      if (currentId === id) {
        store.setCurrent(DEFAULT_LAYOUT_ID);
      }
      options.onLayoutDelete?.(id);
      return null;
    },
    apply(id) {
      const { api } = store;
      if (!api) {
        return NOT_READY;
      }
      const layout = store.getSnapshot().layouts.find((item) => item.id === id);
      if (!layout) {
        return NOT_FOUND;
      }
      applyLayoutState(api, layout.state);
      store.setCurrent(id);
      options.onLayoutApply?.(id);
      return null;
    },
    applyDefault() {
      const { api } = store;
      if (!api) {
        return NOT_READY;
      }
      resetToDefault(api, boundPivotMode);
      store.setCurrent(DEFAULT_LAYOUT_ID);
      options.onLayoutApply?.(DEFAULT_LAYOUT_ID);
      return null;
    },
  };

  const plugin: GridPlugin<TRow> = {
    id: "layouts",
    applyGridOptions: (gridOptions) => {
      boundPivotMode = gridOptions.pivotMode ?? false;
      return gridOptions;
    },
    onGridReady: (ctx) => {
      const api: GridApi = ctx.api;
      store.api = api;
      // Put the current layout back on a new grid: the initial layout on first
      // render, or whatever was current if the grid is recreated. Default needs
      // nothing. This is not a user action, so no callback fires.
      const { layouts, currentId } = store.getSnapshot();
      const current = layouts.find((item) => item.id === currentId);
      if (current) {
        applyLayoutState(api, current.state);
      }
      // An `autoSizeStrategy` resizes the columns a moment after this point,
      // which loses the layout's widths. Apply the layout once more when that
      // first auto-size lands. (`firstDataRendered` has already fired by now.)
      const waitForAutoSize =
        current !== undefined && !!api.getGridOption("autoSizeStrategy");
      const reapply = (event: ColumnResizedEvent) => {
        if (!AUTO_SIZE_SOURCES.includes(event.source)) {
          return;
        }
        api.removeEventListener("columnResized", reapply);
        if (current && store.getSnapshot().currentId === current.id) {
          applyLayoutState(api, current.state);
        }
      };
      if (waitForAutoSize) {
        api.addEventListener("columnResized", reapply);
      }
      // Only let go of the api. The store keeps the list and the current
      // layout, so they survive the grid being recreated.
      return () => {
        if (waitForAutoSize && !api.isDestroyed()) {
          api.removeEventListener("columnResized", reapply);
        }
        if (store.api === api) {
          store.api = null;
        }
      };
    },
    ToolbarItem: createLayoutToolbarItem<TRow>(store, actions),
  };

  return {
    plugin,
    // Only the list changes: the grid is left alone and no callback fires.
    setLayouts: (layouts: GridLayout[]) => store.replace(layouts),
  };
}
