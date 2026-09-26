# FSD: Smart filter UI

## Summary
Grid users can build a filter across any column — pick a column, an operator, and a value, joined with AND/OR — without writing any code or knowing a column's data type.
The wrapper turns this on as a plugin; the filter itself is AG Grid's own built-in Advanced Filter, not a bespoke one.

## Users and triggers
| Who | When they do it |
| --- | --- |
| Consumer (developer embedding the wrapper) | Enables the plugin; optionally binds with a starting filter; listens for filter-change events if it wants to save the filter |
| End user | Opens the filter bar above the grid, builds or edits a filter across one or more columns, and clears it when done |

## Functional requirements
| Id | Requirement | Pass condition |
| --- | --- | --- |
| FR-01 | The feature is opt-in: a grid bound without it shows no filter bar and behaves as today. | Demo grid without the plugin shows the grid's normal per-column filters; typecheck and build pass. |
| FR-02 | When enabled, a filter bar appears above the grid where the user can type or build a filter that checks any column. | Bar is visible directly above the grid; typing a condition filters rows without picking a column first. |
| FR-03 | The bar offers a visual builder for users who do not want to type an expression: pick a column, an operator suited to that column's type, and a value. | Opening the builder shows a column picker, then an operator list matching the chosen column's data type (text/number/date/boolean). |
| FR-04 | Conditions can be joined with AND/OR and grouped, across any combination of columns. | Building "ticker = AAPL AND (side = Buy OR quantity > 100)" filters to exactly the matching rows. |
| FR-05 | Enabling this plugin replaces the grid's ordinary per-column filter icons; the two do not run at the same time. | With the plugin enabled, column headers show no per-column filter icon. |
| FR-06 | The consumer may pass a starting filter when binding the grid. | Bind with a filter for "side = Buy"; grid renders already filtered to Buy rows. |
| FR-07 | The wrapper emits an event whenever the applied filter changes (built, edited, or cleared), carrying the new filter. | A consumer listener receives one event per change, with the filter's full definition in the Data section, or an empty value when cleared. |
| FR-08 | Clearing the filter (via the bar's own clear control) shows every row again and fires the change event with an empty filter. | Click clear; all rows return; the event fires with no active conditions. |
| FR-09 | The wrapper does not write the filter to any storage (no localStorage, no network); persistence is the consumer's job via the change event. | Reloading the page with no starting filter passed shows an unfiltered grid, even after building one earlier in the session. |
| FR-10 | A filter referring to a column that no longer exists is dropped from the applied filter without an error. | Bind with a starting filter naming a removed column; the grid applies the rest of the filter and shows no error. |
| FR-11 | The feature is delivered as a `GridPlugin` and the demo/app never imports AG Grid (CLAUDE.md rules). | Demo enables it through `config.plugins`; no AG Grid import outside `packages/grid-core/src`. |

## Acceptance criteria
| Id | Covers | Given / When / Then |
| --- | --- | --- |
| AC-01 | FR-01 | Given a grid bound without the plugin, when it renders, then the ordinary per-column filters are shown and no filter bar appears. |
| AC-02 | FR-02 | Given the plugin is enabled, when the grid renders, then a filter bar is visible above it. |
| AC-03 | FR-03 | Given the bar's builder is open, when the user picks a number column, then only number-appropriate operators (e.g. greater than, less than) are offered. |
| AC-04 | FR-04 | Given two conditions on different columns joined with AND, when both are true for a row, then that row is shown; when only one is true, it is hidden. |
| AC-05 | FR-05 | Given the plugin is enabled, when the user looks at a column header, then no per-column filter icon is present. |
| AC-06 | FR-06 | Given the consumer binds with a starting filter, when the grid first renders, then only matching rows are shown. |
| AC-07 | FR-07 | Given the bar has no filter, when the user builds one, then a listener receives a change event carrying that filter. |
| AC-08 | FR-08 | Given a filter is applied, when the user clears it, then every row shows again and a change event fires with an empty filter. |
| AC-09 | FR-09 | Given the user built a filter this session, when the page reloads with no starting filter passed, then the grid shows unfiltered. |
| AC-10 | FR-10 | Given a starting filter names a column removed from `config.columns`, when the grid renders, then it applies the rest of the filter and throws no error. |
| AC-11 | FR-11 | Given the demo enables the plugin, when the code is inspected, then no AG Grid import exists outside `packages/grid-core/src`. |

## Data
| Field | Type | Rule |
| --- | --- | --- |
| Bind input: initial filter | filter definition, optional | Applied on first render; absent means unfiltered. Opaque to the consumer; must survive a JSON round-trip. |
| Change event payload | filter definition or empty | The full current filter after every build, edit, or clear. |

## Out of scope
- Building a bespoke rule-builder UI — this rides entirely on AG Grid's own Advanced Filter and its builder; no custom UI is designed here.
- Running this filter alongside the grid's per-column filters or the sidebar Filters panel at the same time (FR-05 makes them mutually exclusive).
- Saving the filter to any storage, or folding it into the separately delivered Layout feature — whether a saved layout should also capture this filter is left for the architect to decide.
- Natural-language search input beyond the type-ahead the builder itself offers.
- Row-level or cell-level styling based on filter results (see the separate "Style rules by data" FSD).
- Changes to `GridCore.tsx` beyond what the existing plugin seam allows; version bumps of react, ag-grid, vite or typescript.

## Non-functional
| Id | Requirement | Limit |
| --- | --- | --- |
| NF-01 | Verification must pass. | `npm run typecheck && npm run build` exit 0. |
| NF-02 | Filter definitions must be serialisable. | `JSON.parse(JSON.stringify(filter))` applies identically. |
| NF-03 | No limit on condition count or grid size is set by the brief. | None stated; not to be invented. |

## Source brief
User asked to add a "smart filter UI" feature: users build filters without writing code, matching what AdapTable offers over plain AG Grid ("Smart filter UI. Users build filters without writing code."). Investigation found AG Grid 32 Enterprise already ships this almost exactly as its built-in Advanced Filter (a cross-column filter bar with a no-code visual builder), so this FSD wraps that feature as a plugin rather than designing a new one.

## Decisions
- Built on AG Grid's own Advanced Filter (`enableAdvancedFilter`), not a custom rule engine — this is the reason effort for this feature is low despite the rich behaviour, and why FR-03/FR-04 describe AG Grid's own builder rather than a design we own.
- FR-05 assumes Advanced Filter and per-column filters cannot coexist per AG Grid's own design; needs a human check at build time (via `ag-mcp`) to confirm this is still true in the pinned 32.2.0 patch and to confirm the exact API surface (e.g. the method name to programmatically open the builder, expected `showAdvancedFilterBuilder` by naming symmetry with `showColumnFilter`, and how `advancedFilterParent` should be pointed at our own toolbar strip rather than rendering inside the grid viewport).
- Whether a saved Layout (from the already-delivered layout-persistence feature) should also capture this filter's model is explicitly deferred to the architecture stage, since the Layout FSD was written before this feature existed and its "Out of scope" list did not anticipate it.
- The demo's existing `sideBar: true` and `defaultColDef.filter: true` will conflict with this plugin per FR-05; resolving that for the demo specifically is an implementation detail, not a requirements decision.

## Handoff
- Opt-in `GridPlugin` via `config.plugins`: sets `enableAdvancedFilter: true` (and related grid options) in `applyGridOptions`; no bespoke popup or store beyond wiring AG Grid's own model in and out.
- Factory shape should mirror `createLayoutPlugin`: a `createSmartFilterPlugin<TRow>(options)` taking an optional initial filter and an `onFilterChange` callback, returning `{ plugin }`.
- Listen for AG Grid's filter-changed signal and forward the current advanced filter model to `onFilterChange`; no other state is owned by this plugin.
- AG Grid imports stay inside `packages/grid-core/src`; no feature code in `GridCore.tsx`.
- AG Grid 32 + React 18: `enableAdvancedFilter`, `advancedFilterBuilderParams`, `advancedFilterParent`, `includeHiddenColumnsInAdvancedFilter`, `suppressAdvancedFilterEval` all confirmed present in v32.2.0 via ag-mcp; confirm the exact change-event and open-builder API names at build time rather than trusting this document.
- Assumed: dropped/unknown columns in a starting filter are ignored rather than erroring, matching the pattern already used by the Layout feature.
- No test command exists; verification is typecheck and build only.
