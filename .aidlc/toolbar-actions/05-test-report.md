# Test report: Toolbar actions

failing_tasks:

## Verify commands
| Command | Result |
| --- | --- |
| npm run typecheck | pass |
| npm run build | pass |

## Story verdicts
| Story | Verdict | Failing criteria |
| --- | --- | --- |
| US-01 | PASS | |
| US-02 | UNVERIFIED | AC-05, AC-06 |
| US-03 | UNVERIFIED | AC-07, AC-08 |
| US-04 | UNVERIFIED | AC-09 |
| US-05 | UNVERIFIED | AC-10 |

## Criteria detail
| Id | Story | Verdict | How it was checked |
| --- | --- | --- | --- |
| AC-01 | US-01 | PASS | rung 3: `GridCore.tsx` filters `plugins` for a `ToolbarItem` and only shows the toolbar when that list is non-empty; a grid bound without the actions plugin has nothing to filter in, so no buttons render. |
| AC-02 | US-01 | PASS | rung 3: `ActionsToolbarItem.tsx` maps `options.actions` straight into `<button>` elements in array order; with `actions: ["fitColumns", "exportCsv", ...]` "Fit columns" renders first. |
| AC-03 | US-01 | PASS | rung 3: `GridCore.tsx` builds `toolbarItems` from `plugins` in array order; `apps/demo/src/gridConfig.ts` puts `tradeLayouts.plugin` before `tradeActions.plugin` in that array, so the Layout button renders before this plugin's buttons in one toolbar. |
| AC-04 | US-01 | PASS | rung 1: grepped `apps/**/*.ts` and `apps/**/*.tsx` for `ag-grid` imports — none found outside `packages/grid-core/src` (only `package.json` dependency entries and built `dist` output matched); `npm run typecheck && npm run build` both exited 0. |

## Unverified
| Id | Why it could not be checked | What would prove it |
| --- | --- | --- |
| AC-05 | No `browser_mcp` connected this session (`claude-in-chrome`/`playwright` unavailable); a real file download can't be confirmed by reading code. Code read: `actionCatalog.ts` calls `api.exportDataAsCsv({ fileName: gridId })`. | Click "Export CSV" in the running app and inspect the downloaded file's name and rows. |
| AC-06 | Same as AC-05 — needs a real filtered grid and a real download to inspect. | Filter the grid, click "Export CSV", and check only the filtered rows are in the downloaded file, and no plugin callback exists to fire. |
| AC-07 | Same browser unavailability; filename and row parity with the CSV export can't be read from code alone. Code read: `actionCatalog.ts` calls `api.exportDataAsExcel({ fileName: gridId })`. | Click "Export Excel" in the running app and compare the downloaded `.xlsx` rows against the CSV export. |
| AC-08 | Same as AC-07 — sort order in the exported file needs an actual export to inspect. | Sort the grid, click "Export Excel", and check the file's row order matches the sort. |
| AC-09 | Same browser unavailability; visual column widening can't be confirmed by reading code. Code read: `actionCatalog.ts` calls `api.autoSizeAllColumns()`. | Narrow a column by hand, click "Auto-size columns", and check it widens to fit its longest value. |
| AC-10 | Same browser unavailability; visual fill-to-width and scrollbar absence need a rendered page. Code read: `actionCatalog.ts` calls `api.sizeColumnsToFit()`. | Narrow columns, click "Fit columns", and check the columns scale to fill the grid width with no horizontal scrollbar. |

## Handoff
- `npm run typecheck` and `npm run build` both passed (rung 1).
- US-01 PASS: opt-in, button ordering, and combined toolbar with the layouts plugin all confirmed at rung 3 by reading `GridCore.tsx`, `ActionsToolbarItem.tsx`, and `apps/demo/src/gridConfig.ts`; AC-04's import search and build/typecheck also passed.
- US-02..05 are UNVERIFIED, not FAIL: no evidence of a defect, just no way to prove file-download and visual-resize behaviour without a browser.
- Browser rung (rung 2) was not used: no `browser_mcp` candidate (`claude-in-chrome`, `playwright`) was connected in this session, though the dev server was already running at `http://localhost:5173`.
- No `failing_tasks` — nothing failed; T-08..11 (the browser-only tasks the developer skipped) remain the ones that would need re-running once a browser check is possible.
- The developer's note that `ag-mcp` was unreachable and `exportDataAsExcel`/`fileName` behaviour was confirmed from installed sources instead was not independently re-checked this session.
