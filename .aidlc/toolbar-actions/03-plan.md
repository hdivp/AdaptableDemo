# Plan: Toolbar actions

## Tasks
| Id | Task | Story | Files | Depends on | Done when |
| --- | --- | --- | --- | --- | --- |
| T-01 | Add public types `GridActionKind`, `ActionsPluginOptions`, `ActionsPluginHandle` matching the architecture's contract. | US-01 | `packages/grid-core/src/plugins/actions/types.ts` | | File exists, exports the three types exactly as in `02-architecture.md`'s Contracts block, `npm run typecheck` passes. |
| T-02 | Confirm `exportDataAsExcel`'s method name and `fileName` extension behaviour via `ag-mcp` (`set_versions` 32.2.0/react first), then add `ActionDef` and the four-entry `ACTION_CATALOG` (`exportCsv`, `exportExcel`, `autosizeColumns`, `fitColumns`), each calling its AG Grid 32 API with `fileName: gridId` where applicable. | US-01 | `packages/grid-core/src/plugins/actions/actionCatalog.ts` | T-01 | `ACTION_CATALOG` has exactly the 4 `GridActionKind` keys, each `run(api, gridId)` calls the confirmed AG Grid method; `npm run typecheck` passes. |
| T-03 | Build `ActionsToolbarItem.tsx`: one `<button>` per entry in `options.actions`, in array order, keyed `` `${kind}-${index}` ``, `onClick` calls that catalog entry's `run(ctx.api, ctx.gridId)`. | US-01 | `packages/grid-core/src/plugins/actions/ActionsToolbarItem.tsx` | T-01, T-02 | Component renders N buttons for an N-length `actions` array in the same order, with no internal state/store; `npm run typecheck` passes. |
| T-04 | Build `createActionsPlugin(options)`: returns `{ plugin }` where `plugin.id === "actions"`, only `ToolbarItem` set (no `applyGridOptions`, no `onGridReady`). | US-01 | `packages/grid-core/src/plugins/actions/createActionsPlugin.ts` | T-01, T-03 | Calling `createActionsPlugin({ actions: [...] }).plugin` yields a `GridPlugin` with only `id` and `ToolbarItem` set; `npm run typecheck` passes. |
| T-05 | Add the feature barrel and export `createActionsPlugin` plus `GridActionKind`/`ActionsPluginOptions`/`ActionsPluginHandle` from the package root. | US-01 | `packages/grid-core/src/plugins/actions/index.ts`, `packages/grid-core/src/index.ts` | T-04 | `import { createActionsPlugin } from "@grid-core"` (or the package's actual import path) resolves the factory and all three types; `npm run typecheck` passes. |
| T-06 | Wire the demo: create `tradeActions = createActionsPlugin({ actions: [...] })` once at module level, add it to `plugins` alongside `tradeLayouts.plugin`, guarded the same way as the layouts plugin (present unless its own `?actions=off` switch is set). | US-01 | `apps/demo/src/gridConfig.ts` | T-05 | `npm run dev` shows the action buttons in the same toolbar as the "Layout" button; no AG Grid import added to this file; `npm run typecheck && npm run build` exit 0. |
| T-07 | Exercise AC-01 through AC-04: a grid without the plugin shows no action buttons; `actions: ["fitColumns", "exportCsv"]` renders "Fit columns" before "Export CSV"; both plugins together show one combined toolbar ordered by `config.plugins` array position; `grep`/search confirms no AG Grid import outside `packages/grid-core/src`. | US-01 | (no new files — verification only) | T-06 | All four checks pass by inspection/browser, and `npm run typecheck && npm run build` exit 0. |
| T-08 | Exercise AC-05 and AC-06: clicking "Export CSV" on a grid with data downloads `<gridId>.csv` with the visible columns; with a filter applied, only filtered rows appear in the file and no callback fires. | US-02 | (no new files — verification only) | T-06 | Both checks pass by browser inspection of the downloaded file's contents. |
| T-09 | Exercise AC-07 and AC-08: clicking "Export Excel" downloads `<gridId>.xlsx` with the same rows as the CSV export; with a sort applied, the file reflects that sort order. | US-03 | (no new files — verification only) | T-06 | Both checks pass by browser inspection of the downloaded file's contents. |
| T-10 | Exercise AC-09: with a column narrower than its longest cell value, clicking "Auto-size columns" widens that column to fit. | US-04 | (no new files — verification only) | T-06 | Check passes by browser inspection. |
| T-11 | Exercise AC-10: with columns narrower than the grid's width, clicking "Fit columns" scales them to fill the width with no horizontal scrollbar (when min-widths allow it). | US-05 | (no new files — verification only) | T-06 | Check passes by browser inspection. |

## Order and reason
Each file in the architecture's build-first list depends on the one before it (types → catalog → toolbar item → factory → exports → demo wiring), so T-01 through T-06 run in that order with no room to reorder. T-01 proves the approach (the plugin shape compiles against `GridPlugin` with no changes to `GridCore.tsx`); T-06 is the first point every story becomes checkable, so T-07 through T-11 (one acceptance task per story) all depend on it and can run in any order relative to each other.

## Coverage
| Story | Tasks |
| --- | --- |
| US-01 | T-01, T-02, T-03, T-04, T-05, T-06, T-07 |
| US-02 | T-08 |
| US-03 | T-09 |
| US-04 | T-10 |
| US-05 | T-11 |

## Decisions
- No open sequencing questions: the architecture's file list has a strict linear dependency chain (types → catalog → toolbar item → factory → exports → demo), so there was no second ordering to choose between.
- The four-entry `ACTION_CATALOG` is built once in T-02 as a single task (the `Record<GridActionKind, ActionDef>` type requires all four keys to compile), so US-02 through US-05 are covered by their acceptance task alone rather than by separate build tasks.

## Handoff
- Start at T-01. Build order is fixed: T-01 types → T-02 catalog → T-03 toolbar item → T-04 factory → T-05 exports → T-06 demo wiring → T-07..T-11 acceptance checks (any order).
- Seam: a stateless `GridPlugin` with only `ToolbarItem` set, built by `createActionsPlugin(options)`. Copy the plugin shape from `packages/grid-core/src/types.ts` and the factory style from `packages/grid-core/src/plugins/layouts/createLayoutPlugin.ts`, minus its store/api-guard/callback machinery.
- Do not touch `GridCore.tsx`, `types.ts`, `internal/*`, `App.tsx`, or any `package.json`.
- Before writing T-02's `exportExcel` catalog entry, confirm `exportDataAsExcel`'s method name and `fileName` behaviour via `ag-mcp` (`set_versions` 32.2.0/react first) — flagged unconfirmed by the architecture stage.
- No store, no consumer callbacks, no persistence, no new dependency, no version bump.
- AG Grid imports stay inside `packages/grid-core/src`; `apps/demo/src/gridConfig.ts` must not import it.
- Fast verify after each code task: `npm run typecheck`. Full verify before calling the feature done: `npm run typecheck && npm run build`.
