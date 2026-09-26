import type { GridApi } from "ag-grid-community";
import type { ComponentType } from "react";
import { AutoSizeIcon, DownloadIcon, FitIcon } from "../../internal/icons";
import type { GridActionKind } from "./types";

/** "export" kinds share one format select; "size" kinds are buttons. */
export type ActionGroup = "export" | "size";

export interface ActionDef {
  label: string;
  group: ActionGroup;
  /** Text in the panel: an export format name, or a size button label. */
  shortLabel: string;
  icon: ComponentType;
  run: (api: GridApi, gridId: string) => void;
}

// AG Grid 32 appends ".csv"/".xlsx" only when fileName has no "." in it.
export const ACTION_CATALOG: Readonly<Record<GridActionKind, ActionDef>> = {
  exportCsv: {
    label: "Export CSV",
    group: "export",
    shortLabel: "CSV",
    icon: DownloadIcon,
    run: (api, gridId) => api.exportDataAsCsv({ fileName: gridId }),
  },
  exportExcel: {
    label: "Export Excel",
    group: "export",
    shortLabel: "Excel",
    icon: DownloadIcon,
    run: (api, gridId) => api.exportDataAsExcel({ fileName: gridId }),
  },
  autosizeColumns: {
    label: "Auto-size columns",
    group: "size",
    shortLabel: "Auto-size",
    icon: AutoSizeIcon,
    run: (api) => api.autoSizeAllColumns(),
  },
  fitColumns: {
    label: "Fit columns",
    group: "size",
    shortLabel: "Fit to width",
    icon: FitIcon,
    run: (api) => api.sizeColumnsToFit(),
  },
};
