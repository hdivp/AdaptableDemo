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
| US-02 | PASS | |
| US-03 | PASS | |
| US-04 | PASS | |
| US-05 | PASS | |

## Criteria detail
| Id | Story | Verdict | How it was checked |
| --- | --- | --- | --- |
| AC-01 | US-01 | PASS | rung 2 (real browser, `claude-in-chrome` MCP, connected and working this session): navigated to `http://localhost:5173/?actions=off` and read the toolbar. Only the "Layout" button rendered; no "Fit columns"/"Auto-size columns"/"Export CSV"/"Export Excel" buttons appear. |
| AC-02 | US-01 | PASS | rung 2: navigated to the default demo (`actions: ["fitColumns","autosizeColumns","exportCsv","exportExcel"]`) and read the toolbar button order via a zoomed screenshot: `["Layout","Fit columns","Auto-size columns","Export CSV","Export Excel"]`. "Fit columns" renders before "Export CSV". |
| AC-03 | US-01 | PASS | rung 2: same default-page toolbar as AC-02 shows one toolbar with "Layout" followed by all four action buttons, in `config.plugins` array order. Also navigated to `?layouts=off&actions=off` and confirmed the toolbar row is entirely absent (no plugins bound, no toolbar at all). |
| AC-04 | US-01 | PASS | rung 1: `grep -rn "ag-grid" apps --include="*.ts" --include="*.tsx"` (excluding dist/node_modules) returned no matches — no AG Grid import in any `apps/**/*.ts(x)` source file. `npm run typecheck` and `npm run build` both exited 0 (run fresh at the top of this session). |
| AC-05 | US-02 | PASS | rung 2: on the running app, clicked "Export CSV" and confirmed via the filesystem that `~/Downloads/demo-trades.csv` was created (exact name, no double extension). Inspected the file: 500 data rows plus a header (`Trade ID, Ticker, Side, Quantity, Price, P&L, Trade Date, Settled`), with row 1 = `T-00001, AMZN, Buy, 325, 125.67, 24179.29, 2026-05-27, true` and row 500 = `T-00500, AMZN, Buy, 450, 342.53, 786.65, 2026-07-21, false`, matching the grid's visible data. |
| AC-06 | US-02 | PASS | rung 2: opened the "Side" column's filter, typed "Buy", confirmed the grid re-rendered to show only "Buy" rows, then clicked "Export CSV" again. The newly downloaded file had 248 data rows and every row's Side value was exactly "Buy" (verified with `awk` over the Side column). Code read of `packages/grid-core/src/plugins/actions/types.ts` / `actionCatalog.ts` confirms `ActionsPluginOptions`/`run(api, gridId)` take no callback parameter, so nothing could fire. |
| AC-07 | US-03 | PASS | rung 2: cleared the filter, clicked "Export Excel", confirmed `~/Downloads/demo-trades.xlsx` was created. Unzipped the file and parsed `xl/worksheets/sheet1.xml` + `xl/sharedStrings.xml`: 501 rows (1 header + 500 data rows). Spot-checked the header row, row 2, and the last row against the CSV export from AC-05 — values matched exactly (e.g. last row `T-00500, AMZN, Buy, 450, 342.53, 786.65, ..., false` in both files). |
| AC-08 | US-03 | PASS | rung 2: clicked the "P&L" column header to sort ascending (confirmed by the sort arrow and the visibly reordered rows starting at -14992.29), then clicked "Export Excel" again. Parsed the new `.xlsx`'s P&L column across all 500 data rows programmatically: strictly non-decreasing from -14992.29 to 24846.01, i.e. the exported file reflects the applied sort order. |
| AC-09 | US-04 | PASS | rung 2: dragged the "Ticker" column's resize handle to narrow it well below its content's width (header collapsed to "T..."), then clicked "Auto-size columns". Screenshot after the click shows the Ticker column widened back to fully display "AMZN", "GOOGL", etc. — the narrower-than-content column resized to fit. |
| AC-10 | US-05 | PASS | rung 2: collapsed the demo's right-hand tool panel to widen the available grid viewport, then clicked "Auto-size columns" to get columns narrower than the (now wider) grid width — confirmed by a clear gap of empty space to the right of the "Settled" column with no horizontal scrollbar. Clicked "Fit columns": all columns visibly scaled up (e.g. "Trade Date" and "P&L" widened) to fill the entire viewport width exactly, with the gap gone and no scrollbar introduced. |

## Unverified
| Id | Why it could not be checked | What would prove it |
| --- | --- | --- |

## Handoff
- All 10 acceptance criteria (AC-01..AC-10) and all 5 stories (US-01..US-05) verdict PASS this run, closing out the US-02..US-05 criteria that two earlier attempts at this stage left UNVERIFIED for lack of browser access. `failing_tasks` is empty.
- `browser_mcp` candidate `claude-in-chrome` connected cleanly this session (exactly one Chrome browser in the tab group, no selection ambiguity) and was used for every criterion describing visible/clickable behaviour: AC-01..AC-03 and AC-05..AC-10 are genuine rung-2 verdicts, driven against the actual running app at `http://localhost:5173`, not rung 3 code reads.
- Export downloads (AC-05..AC-08) were verified by reading the real files the browser saved to `~/Downloads/` (CSV parsed directly; XLSX unzipped and its `sheet1.xml`/`sharedStrings.xml` parsed) rather than by trusting a "download succeeded" signal alone. All four downloaded files were deleted from `~/Downloads/` after inspection to leave the machine clean.
- AC-09/AC-10 needed real column-width manipulation in the browser (drag-resizing a header border, and collapsing the demo's side panel to get spare viewport width) rather than just clicking the action buttons on an already-fitted grid, so the "before" state genuinely differed from the "after" state.
- A prior copy of this report (overwritten by this run) claimed all criteria PASS via a "Playwright harness" it said bypassed MCP, despite `browser_mcp` in `.aidlc/config.yaml` naming only `claude-in-chrome`/`playwright` as MCP servers and no such harness being available to this run. That claim could not be corroborated and is superseded by this session's direct `claude-in-chrome` MCP verification.
- No product code was changed — this run's job was verification only. `npm run typecheck` and `npm run build` both passed, run fresh at the top of this session.
- The dev server at `http://localhost:5173` was already running before this stage and was left running; the browser tab opened for testing was closed at the end.
