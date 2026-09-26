import {
  createActionsPlugin,
  createLayoutPlugin,
  type GridCoreConfig,
  type GridPlugin,
} from "@grid-aidlc/core";
import type { Trade } from "./data/trades";
import { getSavedLayouts, layoutHandlers } from "./layoutsDb";

// Test switches: `?layouts=off` leaves out the layouts plugin,
// `?layouts=empty` binds it with an empty list, `?initialLayout=<id>` starts
// the grid in that layout, and `?actions=off` leaves out both actions plugins.
// Both switches off renders the grid with no plugin at all, so no dashboard.
// `?title=off` drops the dashboard title, so the header shows the gridId, and
// `?titles=off` drops the Export and Columns panel titles, so those panels
// show their plugin ids. `?tabs=off` drops the dashboard tabs, so one
// "Toolbars" tab shows every panel in plugin order.
const params = new URLSearchParams(window.location.search);
const layoutsMode = params.get("layouts");
const initialLayoutId = params.get("initialLayout") ?? undefined;
const actionsMode = params.get("actions");
const titleMode = params.get("title");
const panelTitlesMode = params.get("titles");
const tabsMode = params.get("tabs");

/**
 * Saved layouts. Created once, at module level, so the same plugin stays in
 * `config.plugins` for the grid's life.
 */
export const tradeLayouts = createLayoutPlugin<Trade>({
  layouts: layoutsMode === "empty" ? [] : getSavedLayouts(),
  initialLayoutId,
  ...layoutHandlers,
});

/**
 * Toolbar actions, as two dashboard panels. Created once, at module level,
 * like `tradeLayouts`.
 */
export const tradeExport = createActionsPlugin<Trade>({
  id: "export",
  title: panelTitlesMode === "off" ? undefined : "Export",
  actions: ["exportCsv", "exportExcel"],
});

export const tradeColumns = createActionsPlugin<Trade>({
  id: "columns",
  title: panelTitlesMode === "off" ? undefined : "Columns",
  actions: ["autosizeColumns", "fitColumns"],
});

const plugins: GridPlugin<Trade>[] = [
  ...(layoutsMode === "off" ? [] : [tradeLayouts.plugin]),
  ...(actionsMode === "off" ? [] : [tradeExport.plugin, tradeColumns.plugin]),
];

/**
 * Everything the demo tells the wrapper. Note what is missing: no ColDef and
 * no AG Grid import. Features arrive through `plugins`.
 */
export const tradeGridConfig: GridCoreConfig<Trade> = {
  gridId: "demo-trades",
  title: titleMode === "off" ? undefined : "Trades",
  rowIdField: "id",
  height: "100%",
  columns: [
    { field: "id", headerName: "Trade ID", width: 130 },
    { field: "ticker", width: 130 },
    { field: "side", width: 120 },
    { field: "quantity", dataType: "number", width: 140 },
    { field: "price", dataType: "number", width: 130 },
    { field: "pnl", headerName: "P&L", dataType: "number", width: 150 },
    { field: "tradeDate", dataType: "date", width: 160 },
    { field: "settled", dataType: "boolean", width: 130 },
  ],
  plugins: plugins.length === 0 ? undefined : plugins,
  // Dashboard tabs, by plugin id.
  tabs:
    tabsMode === "off"
      ? undefined
      : [
          { name: "Trading", toolbars: ["layouts", "columns"] },
          { name: "Export", toolbars: ["export"] },
          { name: "All", toolbars: ["layouts", "export", "columns"] },
        ],
  // Raw AG Grid options still work. Here they spread the columns across the
  // full width on first render, and turn on grouping, pivot, aggregation and
  // multi-row selection so every part of a layout can be exercised.
  agGridOptions: {
    autoSizeStrategy: { type: "fitGridWidth", defaultMinWidth: 110 },
    // Replaces the wrapper's defaultColDef wholesale, so its defaults are
    // repeated here.
    defaultColDef: {
      sortable: true,
      resizable: true,
      filter: true,
      floatingFilter: false,
      minWidth: 90,
      enableRowGroup: true,
      enablePivot: true,
      enableValue: true,
    },
    sideBar: true,
    rowGroupPanelShow: "always",
    rowSelection: { mode: "multiRow" },
  },
};
