import type { FilterModel, GridApi } from "ag-grid-community";
import type { GridLayoutState } from "./types";

/**
 * Read the parts of the grid a layout holds: column state (order, widths,
 * visibility, pinning, sort, grouping, aggregation, pivot columns), filters and
 * pivot mode. Scroll, selection and group expansion are left out on purpose.
 */
export function captureLayoutState(api: GridApi): GridLayoutState {
  const state: GridLayoutState = {
    version: 1,
    columnState: api.getColumnState(),
    filterModel: api.getFilterModel(),
    pivotMode: api.isPivotMode(),
  };
  // A deep copy, so the result is plain JSON that shares nothing with the grid.
  return JSON.parse(JSON.stringify(state)) as GridLayoutState;
}

/**
 * Put a layout on the grid. Pivot mode goes first, so pivot and value columns
 * land correctly. Columns the layout does not mention lose their sort, group,
 * pivot, aggregation and pinning. Column state for columns that no longer exist
 * is ignored by the grid quietly; the filter model is not, so it is trimmed first.
 */
export function applyLayoutState(api: GridApi, state: GridLayoutState): void {
  api.setGridOption("pivotMode", state.pivotMode);
  api.applyColumnState({
    state: state.columnState,
    applyOrder: true,
    defaultState: { sort: null, rowGroup: null, pivot: null, aggFunc: null, pinned: null },
  });
  const filterModel: FilterModel = {};
  for (const [colId, model] of Object.entries(state.filterModel)) {
    if (api.getColumn(colId)) {
      filterModel[colId] = model;
    }
  }
  api.setFilterModel(filterModel);
}

/**
 * Back to how the grid was bound: columns as defined in the column
 * definitions, no filters, and the pivot mode the grid was created with.
 */
export function resetToDefault(api: GridApi, boundPivotMode: boolean): void {
  api.resetColumnState();
  api.setFilterModel(null);
  api.setGridOption("pivotMode", boundPivotMode);
}
