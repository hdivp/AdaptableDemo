# Architecture: Toolbar actions

## Approach
Delivered as a `GridPlugin` (the seam in `packages/grid-core/src/types.ts`), reusing the same `ToolbarItem` slot `GridCore.tsx` already renders — no change to `GridCore.tsx`.
A factory `createActionsPlugin(options)` mirrors `createLayoutPlugin`'s shape but is stateless: no store, no api-null guard, no consumer callbacks, since every action reads and acts on the live grid at click time (FR-07) and nothing survives the click.
`options.actions` is a plain ordered list mapped straight onto a small internal catalog of the four AG Grid 32 API calls (`exportDataAsCsv`, `exportDataAsExcel`, `autoSizeAllColumns`, `sizeColumnsToFit`), so the `ToolbarItem` is just buttons in array order.

## Design decisions
| Id | Decision | Why | Rejected |
| --- | --- | --- | --- |
| D-01 | `createActionsPlugin<TRow>(options)` returns `{ plugin }` only — no extra handle methods. | Nothing about this feature changes after bind (no list-replace, no events to wire); `LayoutPluginHandle`'s `setLayouts` has no equivalent need here. | Returning a handle with a `setActions` method (not asked for by any FR; the FSD's list is fixed per bind). |
| D-02 | No store, no `useSyncExternalStore`. The `ToolbarItem` reads `options.actions` (closed over at creation) and calls straight into `ctx.api` from its `onClick`. | Nothing needs to re-render the toolbar: the button list is fixed at creation and every action is a one-shot side effect with no state to reflect back (FR-07: no event, no persistence). | Copying the layouts store pattern (adds a subscribe/getSnapshot layer with nothing to publish). |
| D-03 | One internal catalog: `Record<GridActionKind, { label, run(api, gridId) }>`. The `ToolbarItem` maps `options.actions` to catalog entries, one button per array entry (in order), keyed by `` `${kind}-${index}` ``. | Matches FR-02's ordering rule directly; a duplicate entry in the array simply renders twice, which the FSD explicitly leaves undefined rather than requiring de-duplication. | De-duplicating the array (not asked for, and the FSD says duplicates are "not defined behaviour" — building a specific behaviour for them would be inventing a requirement). |
| D-04 | Export filenames: pass `fileName: gridId` (no extension appended by us) to `exportDataAsCsv`/`exportDataAsExcel`. | Matches AG Grid's own documented convention for `fileName` (grid appends the correct extension), and gives exactly `<gridId>.csv` / `<gridId>.xlsx` per FR-03/FR-04 without string-building an extension ourselves. | Building `` `${gridId}.csv` `` by hand (double-extension risk if the grid also appends one; confirm the exact AG Grid 32 behaviour per the Risk below before wiring FR-04). |
| D-05 | No options beyond `actions`. No per-button `disabled`/visibility logic, no icons — plain-text `<button>` elements styled like the existing "Layout" button (no dedicated CSS class rule; relies on the browser default the Layout button already relies on). | FSD explicitly puts disabled/greyed-out states, icons and filename overrides out of scope. | Adding a CSS file for the buttons (nothing in the existing toolbar buttons needs one; would be new surface for no FR). |

## Files
| Path | Add or change | What for |
| --- | --- | --- |
| `packages/grid-core/src/plugins/actions/types.ts` | Add | Public types: `GridActionKind`, `ActionsPluginOptions`, `ActionsPluginHandle`. |
| `packages/grid-core/src/plugins/actions/actionCatalog.ts` | Add | Internal: `ActionDef` shape and the `ACTION_CATALOG` map from `GridActionKind` to `{ label, run(api, gridId) }`, one entry per action calling the matching AG Grid 32 API. |
| `packages/grid-core/src/plugins/actions/ActionsToolbarItem.tsx` | Add | Builds the toolbar control: one `<button>` per entry in `options.actions`, in order, `onClick` calling that entry's `run`. |
| `packages/grid-core/src/plugins/actions/createActionsPlugin.ts` | Add | The factory: builds the `GridPlugin` (`id: "actions"`, only `ToolbarItem` set — no `applyGridOptions`, no `onGridReady`) and returns `{ plugin }`. |
| `packages/grid-core/src/plugins/actions/index.ts` | Add | Barrel for the feature. |
| `packages/grid-core/src/index.ts` | Change | Export `createActionsPlugin` and the `GridActionKind` / `ActionsPluginOptions` / `ActionsPluginHandle` types. |
| `apps/demo/src/gridConfig.ts` | Change | Create `tradeActions = createActionsPlugin({ actions: [...] })` once at module level; add it to `plugins` alongside `tradeLayouts.plugin` (both present unless their own `?layouts=off` / `?actions=off` switch is set), so FR-08/AC-08 (both toolbars together) is exercisable. No AG Grid import. |

No change to `GridCore.tsx`, `types.ts`, `internal/*`, `App.tsx`, or any `package.json`.

## Contracts
```ts
// packages/grid-core/src/plugins/actions/types.ts
import type { GridPlugin } from "../../types";

export type GridActionKind =
  | "exportCsv"
  | "exportExcel"
  | "autosizeColumns"
  | "fitColumns";

export interface ActionsPluginOptions {
  /**
   * Buttons to show, and the order they appear in. A kind repeated more than
   * once renders more than once; not defined behaviour beyond that.
   */
  actions: GridActionKind[];
}

export interface ActionsPluginHandle<TRow = unknown> {
  /** Put this in config.plugins. */
  plugin: GridPlugin<TRow>;
}

export function createActionsPlugin<TRow = unknown>(
  options: ActionsPluginOptions,
): ActionsPluginHandle<TRow>;
```

```ts
// actionCatalog.ts (internal)
import type { GridApi } from "ag-grid-community";

interface ActionDef {
  label: string;
  run: (api: GridApi, gridId: string) => void;
}

const ACTION_CATALOG: Readonly<Record<GridActionKind, ActionDef>>;
```

```ts
// ActionsToolbarItem.tsx (internal)
function createActionsToolbarItem<TRow>(
  actions: GridActionKind[],
): ComponentType<{ ctx: GridPluginContext<TRow> }>;
```

## Library notes
| Library | Version in use | Note from the docs |
| --- | --- | --- |
| ag-grid-community | ^32.2.0 | `api.exportDataAsCsv(params?: CsvExportParams)`, `api.autoSizeAllColumns(skipHeader?)`, `api.sizeColumnsToFit(params?: ISizeColumnsToFitParams)` — signatures confirmed for AG Grid 32 via `ag-mcp` during the FSD stage (see `01-fsd.md` Handoff). Carried over unchanged; not re-run this session. |
| ag-grid-community | ^32.2.0 | `exportDataAsCsv`/`exportDataAsExcel` both take `fileName` in their params object; documented convention is to pass it without an extension and let the grid append `.csv`/`.xlsx`. **Not independently re-confirmed this session** (`ag-mcp` unavailable) — the FSD Handoff already flagged FR-04's exact method name (`exportDataAsExcel`, expected) for re-confirmation; the developer must confirm both the method name and this `fileName` behaviour with `ag-mcp` (`set_versions` 32.2.0/react first) before wiring D-04. |
| ag-grid-enterprise | ^32.2.0 | Excel export is an Enterprise feature; already registered by the existing side-effect `import "ag-grid-enterprise"` in `GridCore.tsx` — no new import needed. With no licence key (demo default), AG Grid's own trial watermark may appear in the exported file; explicitly out of scope to suppress (FSD out-of-scope list). |

## User stories
| Id | Story | Covers | Size |
| --- | --- | --- | --- |
| US-01 | As a consumer I can enable the toolbar-actions plugin with an ordered list of actions, so that end users see exactly those buttons, in that order, alongside any other plugin's toolbar controls, with no impact on grids that don't use it. | FR-01, FR-02, FR-08, FR-09 | S |
| US-02 | As an end user I can click "Export CSV" to download the grid's current data, so that I get a file matching what's on screen without leaving the page. | FR-03, FR-07 | S |
| US-03 | As an end user I can click "Export Excel" to download the grid's current data, so that I get the same data as the CSV export in spreadsheet form. | FR-04, FR-07 | S |
| US-04 | As an end user I can click "Auto-size columns" to fit every column to its contents, so that I can read data that was clipped by a bound width. | FR-05, FR-07 | S |
| US-05 | As an end user I can click "Fit columns" to scale every column to the grid's width, so that there's no wasted space or unwanted scrollbar. | FR-06, FR-07 | S |

## Story acceptance criteria
| Id | Story | Given / When / Then |
| --- | --- | --- |
| AC-01 | US-01 | Given a grid bound without the plugin, when it renders, then no toolbar buttons from this plugin appear. |
| AC-02 | US-01 | Given the plugin is bound with `actions: ["fitColumns", "exportCsv"]`, when the toolbar renders, then "Fit columns" appears before "Export CSV". |
| AC-03 | US-01 | Given both the layouts plugin and this plugin are bound, when the grid renders, then one toolbar shows the "Layout" button and this plugin's buttons together, ordered by `config.plugins` array position. |
| AC-04 | US-01 | Given the demo enables the plugin through `config.plugins`, when the repository is searched, then no AG Grid import exists outside `packages/grid-core/src`; `npm run typecheck && npm run build` exit 0. |
| AC-05 | US-02 | Given the grid has data, when the user clicks "Export CSV", then a file named `<gridId>.csv` downloads containing the visible columns' data. |
| AC-06 | US-02 | Given the grid is filtered to a subset of rows, when the user clicks "Export CSV", then only the filtered rows appear in the file, and no callback fires (none exists to fire). |
| AC-07 | US-03 | Given the grid has data, when the user clicks "Export Excel", then a file named `<gridId>.xlsx` downloads with the same rows as the CSV export. |
| AC-08 | US-03 | Given the grid is sorted, when the user clicks "Export Excel", then the file reflects the current sort order. |
| AC-09 | US-04 | Given a column narrower than its longest cell value, when the user clicks "Auto-size columns", then that column widens to fit. |
| AC-10 | US-05 | Given columns narrower than the grid's width, when the user clicks "Fit columns", then the columns scale up to fill the width, leaving no horizontal scrollbar (when the sum of min-widths allows it). |

## Risks
| Risk | What to do about it |
| --- | --- |
| `exportDataAsExcel`'s exact method name and its `fileName` extension-handling are carried over from the FSD stage, not re-checked this session (`ag-mcp` unavailable here). | Developer confirms both with `ag-mcp` (`set_versions` 32.2.0/react, then `search_docs`) before wiring FR-04; if the method name or `fileName` behaviour differs, adjust D-04's catalog entry only — no other file is affected. |
| Excel export with no licence key shows AG Grid's trial watermark in the demo. | Leave as-is; explicitly out of scope (FSD out-of-scope list). |
| A duplicate entry in `options.actions` renders the same button twice. | Leave as-is; the FSD defines this as not meaningful, so no de-duplication logic is built. |

## Handoff
- Seam: a stateless `GridPlugin` with only `ToolbarItem` set, built by `createActionsPlugin(options)` in `packages/grid-core/src/plugins/actions/`. Copy the plugin shape from `packages/grid-core/src/types.ts` and the factory style from `createLayoutPlugin.ts`, minus its store/api-guard/callback machinery — `GridCore.tsx` does not change.
- Build first: `types.ts`, then `actionCatalog.ts`, then `ActionsToolbarItem.tsx`, then `createActionsPlugin.ts`, then exports in `src/index.ts`.
- Story build order: US-01, US-02, US-03, US-04, US-05 — US-01 (opt-in + ordering) exercises the whole plumbing; US-02..05 each just add one catalog entry plus its acceptance check.
- `apps/demo/src/gridConfig.ts` creates the plugin once at module level (same rule as `tradeLayouts`) and adds it to `plugins` alongside the layouts plugin, so FR-08/AC-03 (both toolbars together) is exercisable; no change to `App.tsx`.
- Before wiring FR-04, confirm `exportDataAsExcel`'s name and `fileName` extension behaviour with `ag-mcp` (set version 32.2.0/react first) — flagged as unconfirmed this session.
- No store, no consumer callbacks, no persistence, no new dependency, no version bump — this is the simplest plugin in the set.
- AG Grid imports stay inside `packages/grid-core/src`; no feature code added to `GridCore.tsx`.
