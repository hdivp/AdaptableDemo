import { createLayoutPlugin, type GridCoreConfig } from "@grid-aidlc/core";
import type { Trade } from "./data/trades";
import { getSavedLayouts, layoutHandlers } from "./layoutsDb";

// Test switches: `?layouts=off` renders the grid with no plugin at all,
// `?layouts=empty` binds the feature with an empty list, and
// `?initialLayout=<id>` starts the grid in that layout.
const params = new URLSearchParams(window.location.search);
const layoutsMode = params.get("layouts");
const initialLayoutId = params.get("initialLayout") ?? undefined;

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
 * Everything the demo tells the wrapper. Note what is missing: no ColDef and
 * no AG Grid import. Features arrive through `plugins`.
 */
export const tradeGridConfig: GridCoreConfig<Trade> = {
  gridId: "demo-trades",
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
  plugins: layoutsMode === "off" ? undefined : [tradeLayouts.plugin],
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
