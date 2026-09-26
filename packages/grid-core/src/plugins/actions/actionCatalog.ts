import type { GridApi } from "ag-grid-community";
import type { GridActionKind } from "./types";

export interface ActionDef {
  label: string;
  run: (api: GridApi, gridId: string) => void;
}

// AG Grid 32 appends ".csv"/".xlsx" only when fileName has no "." in it.
export const ACTION_CATALOG: Readonly<Record<GridActionKind, ActionDef>> = {
  exportCsv: {
    label: "Export CSV",
    run: (api, gridId) => api.exportDataAsCsv({ fileName: gridId }),
  },
  exportExcel: {
    label: "Export Excel",
    run: (api, gridId) => api.exportDataAsExcel({ fileName: gridId }),
  },
  autosizeColumns: {
    label: "Auto-size columns",
    run: (api) => api.autoSizeAllColumns(),
  },
  fitColumns: {
    label: "Fit columns",
    run: (api) => api.sizeColumnsToFit(),
  },
};
