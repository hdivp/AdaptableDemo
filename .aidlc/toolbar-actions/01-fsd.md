# FSD: Toolbar actions

## Summary
Grid users get a row of ready-made buttons above the grid — export to CSV/Excel and auto-size columns — without the consumer writing any AG Grid code.
The consumer picks which buttons appear; every button acts on the grid immediately and needs no persistence.

## Users and triggers
| Who | When they do it |
| --- | --- |
| Consumer (developer embedding the wrapper) | Enables the plugin and lists which actions to show, in the order they should appear |
| End user | Clicks a toolbar button to export the current grid data, or to resize columns |

## Functional requirements
| Id | Requirement | Pass condition |
| --- | --- | --- |
| FR-01 | The feature is opt-in: a grid bound without it shows no extra toolbar buttons and behaves as today. | Demo grid without the plugin shows no action buttons; typecheck and build pass. |
| FR-02 | The consumer lists which actions to show, from: export CSV, export Excel, auto-size all columns, fit columns to grid width. | Passing `["exportCsv", "autosizeColumns"]` shows exactly those two buttons, in that order. |
| FR-03 | "Export CSV" downloads the grid's current data as a `.csv` file named after the grid's `gridId`. | Click downloads `<gridId>.csv` containing the visible columns' data with any active sort/filter applied. |
| FR-04 | "Export Excel" downloads the grid's current data as a `.xlsx` file named after the grid's `gridId`. | Click downloads `<gridId>.xlsx` with the same data as the CSV export. |
| FR-05 | "Auto-size columns" resizes every column to fit its rendered contents. | Click resizes all columns; a column with long content becomes wider than its bound width. |
| FR-06 | "Fit columns" scales every column to fill the grid's width, keeping relative proportions. | Click leaves no empty space to the right of the last column and no horizontal scrollbar, if the sum of min-widths allows it. |
| FR-07 | Buttons act on the grid state at the moment of the click (current sort, filter, grouping); no event is emitted to the consumer for any action. | Filter the grid, click Export CSV; the file reflects only the filtered rows. No callback fires. |
| FR-08 | This plugin's toolbar buttons appear alongside any other plugin's toolbar controls (e.g. the Layout button), in `config.plugins` order. | Enabling both layouts and toolbar-actions shows both controls in one toolbar strip, ordered by plugin array position. |
| FR-09 | Export buttons are hidden (not shown disabled) if the underlying export is unavailable — e.g. Excel export with no AG Grid Enterprise licence still exports, but with the trial watermark AG Grid itself adds. | No custom "unavailable" state is invented; AG Grid's own trial behaviour is left as-is. |
| FR-10 | The feature is delivered as a `GridPlugin` and the demo/app never imports AG Grid (CLAUDE.md rules). | Demo enables it through `config.plugins`; no AG Grid import outside `packages/grid-core/src`. |

## Acceptance criteria
| Id | Covers | Given / When / Then |
| --- | --- | --- |
| AC-01 | FR-01 | Given a grid bound without the plugin, when it renders, then no action buttons are shown. |
| AC-02 | FR-02 | Given the plugin is bound with `["fitColumns", "exportCsv"]`, when the toolbar renders, then "Fit columns" appears before "Export CSV". |
| AC-03 | FR-03 | Given the grid has data, when the user clicks "Export CSV", then a file named `<gridId>.csv` downloads with the grid's rows. |
| AC-04 | FR-04 | Given the grid has data, when the user clicks "Export Excel", then a file named `<gridId>.xlsx` downloads with the grid's rows. |
| AC-05 | FR-05 | Given a column narrower than its longest cell value, when the user clicks "Auto-size columns", then that column widens to fit. |
| AC-06 | FR-06 | Given columns narrower than the grid's width, when the user clicks "Fit columns", then the columns scale up to fill the width. |
| AC-07 | FR-07 | Given the grid is filtered to a subset of rows, when the user clicks "Export CSV", then only the filtered rows appear in the file. |
| AC-08 | FR-08 | Given both the layouts plugin and this plugin are bound, when the grid renders, then one toolbar shows both the Layout button and the action buttons. |
| AC-09 | FR-10 | Given the demo enables the plugin, when the code is inspected, then no AG Grid import exists outside `packages/grid-core/src`. |

## Data
| Field | Type | Rule |
| --- | --- | --- |
| Bind input: actions | `("exportCsv" \| "exportExcel" \| "autosizeColumns" \| "fitColumns")[]` | Order in the array is the order buttons appear. Duplicates are not meaningful; not defined behaviour. |

## Out of scope
- Persisting or reporting which action a user clicked (no events, no analytics hook).
- Customising export filename, column selection, or Excel styling beyond AG Grid's defaults.
- A "reset columns" or "clear filters" button — reset-to-default already exists on the Layout plugin's Default button.
- Printing.
- Disabling individual buttons based on grid state (e.g. greying out Export when the grid is empty).
- Changes to `GridCore.tsx` beyond what the existing plugin seam allows; version bumps of react, ag-grid, vite or typescript.

## Non-functional
| Id | Requirement | Limit |
| --- | --- | --- |
| NF-01 | Verification must pass. | `npm run typecheck && npm run build` exit 0. |
| NF-02 | No limit on row/column count for export is set by the brief. | None stated; not to be invented — AG Grid's own export performs the work. |

## Source brief
User asked to add a "toolbar" feature to the grid wrapper, matching what AdapTable offers over plain AG Grid: "Toolbar with ready-made buttons. Export, filter, layout save — all built in." Layout save/apply already exists as its own plugin (`.aidlc/layout-persistence`); this FSD covers the remaining ready-made actions: export and column sizing.

## Decisions
- Scope narrowed from "toolbar" in general to a specific, closed list of stateless actions (export CSV/Excel, auto-size, fit-to-width), since the toolbar *shell* already exists (`GridCore` renders one automatically once any plugin supplies a `ToolbarItem`) — this FSD only adds a new plugin that fills it with buttons.
- "Filter" and "layout save" from the AdapTable comparison are deliberately excluded: layout save is already its own delivered feature, and filter-building is covered by the separate "Smart filter UI" and "Advanced search" FSDs.
- No confirmation grid button (e.g. "are you sure?") before export, since export is non-destructive.
- Needs a human check: confirm the exact AG Grid v32 API method name for Excel export before implementation (expected `exportDataAsExcel`, symmetric with `exportDataAsCsv`) — verify with `ag-mcp` `search_docs` at build time rather than trusting this document.

## Handoff
- Opt-in `GridPlugin` via `config.plugins`: no popup, just buttons wired straight to AG Grid API calls (`exportDataAsCsv`, `exportDataAsExcel`, `autoSizeAllColumns`, `sizeColumnsToFit`).
- Factory shape should mirror `createLayoutPlugin`: a `createActionsPlugin<TRow>(options)` returning `{ plugin }`, with `options.actions` as an ordered list of action kinds.
- No store, no events, no persistence — this is the simplest plugin in the set; treat it as the first one built.
- Coexists with the layouts plugin's toolbar item; `GridCore` already renders all plugins' `ToolbarItem`s side by side in `config.plugins` order — no change to `GridCore.tsx` needed.
- AG Grid imports stay inside `packages/grid-core/src`; no feature code in `GridCore.tsx`.
- AG Grid 32 + React 18: confirmed via ag-mcp — `exportDataAsCsv`, `autoSizeAllColumns`, `sizeColumnsToFit` all exist in v32; Excel export method name to be re-confirmed at build time.
- Assumed: filenames are `<gridId>.csv` / `<gridId>.xlsx`; no per-call filename override in this iteration.
