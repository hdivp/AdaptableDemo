import type { ColDef, GridOptions } from "ag-grid-community";
import type { GridCoreColumn, GridCoreConfig, GridCoreDataType } from "../types";

/** "tradeDate" -> "Trade Date". Used when a column has no headerName. */
export function titleCase(field: string): string {
  const spaced = field
    .replace(/[_-]+/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .trim();
  return spaced
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/** AG Grid defaults that follow from the kind of data in a column. */
const DEFAULTS_BY_DATA_TYPE: Record<GridCoreDataType, ColDef> = {
  text: { cellDataType: "text", filter: "agTextColumnFilter" },
  number: {
    cellDataType: "number",
    filter: "agNumberColumnFilter",
    type: "rightAligned",
  },
  date: { cellDataType: "dateString", filter: "agDateColumnFilter" },
  boolean: { cellDataType: "boolean", filter: "agSetColumnFilter" },
};

function buildColDef<TRow>(column: GridCoreColumn<TRow>): ColDef<TRow> {
  const dataType = column.dataType ?? "text";
  const colDef: ColDef<TRow> = {
    ...(DEFAULTS_BY_DATA_TYPE[dataType] as ColDef<TRow>),
    colId: column.field,
    field: column.field as ColDef<TRow>["field"],
    headerName: column.headerName ?? titleCase(column.field),
  };
  if (column.width !== undefined) {
    colDef.width = column.width;
  }
  if (column.hidden !== undefined) {
    colDef.hide = column.hidden;
  }
  // The raw escape hatch is merged last, so the caller always wins.
  return { ...colDef, ...column.agColDef };
}

/**
 * Turn our own config plus the rows into AG Grid options.
 *
 * Kept pure and separate from the component, so it is easy to test and easy
 * for plugins to reason about.
 */
export function buildGridOptions<TRow>(
  data: TRow[],
  config: GridCoreConfig<TRow>,
): GridOptions<TRow> {
  const { rowIdField } = config;
  const options: GridOptions<TRow> = {
    rowData: data,
    columnDefs: config.columns.map((column) => buildColDef(column)),
    defaultColDef: {
      sortable: true,
      resizable: true,
      filter: true,
      floatingFilter: false,
      minWidth: 90,
    },
    animateRows: true,
    suppressColumnVirtualisation: false,
  };
  if (rowIdField) {
    options.getRowId = (params) => String(params.data[rowIdField]);
  }
  // The raw escape hatch is merged last, so the caller always wins.
  return { ...options, ...config.agGridOptions };
}
