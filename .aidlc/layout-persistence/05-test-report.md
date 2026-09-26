# Test report: Layout persistence

failing_tasks:

## Verify commands
| Command | Result |
| --- | --- |
| npm run typecheck | pass (exit 0, no errors) |
| npm run build | pass (exit 0; grid-core lib and demo bundle built; only the non-fatal Vite "Some chunks are larger than 500 kB" notice) |
| test_command | none configured in `config.yaml`, so rung 1 is not available |
| Browser (rung 2) | available: `claude-in-chrome` connected. The demo was already running at http://localhost:5173 (HTTP 200), so this run reused it and left it running. |

This is a re-test after FIX-01. File timestamps show that `packages/grid-core/src/plugins/layouts/layoutState.ts` (14:55) is the only product file changed since the previous test run. Nothing else under `packages/grid-core/src` or `apps/demo/src` is newer than 14:23, and `GridCore.tsx` is still dated 12:06. The fix only affects the apply path (`applyLayoutState`). So this run re-drove every criterion that goes through apply, plus the user's check, in the live demo. Criteria whose code paths the fix does not touch keep their rung 2 verdicts from the previous run, and the table below labels them "carried".

The only console errors were AG Grid Enterprise's trial-licence banner, printed at page load. No console message appeared during any layout action.

## User-requested check: seed A after seed B
PASS (rung 2, browser). On `/` I applied B. The grid grouped by Ticker, and the side bar Values showed `sum(Quantity)` and `sum(P&L)`. I then applied A. After that, the Values drop zone read "Drag here to aggregate" (empty), the column headers read plain "P&L" and "Quantity" (no `sum(...)`), Row Groups was empty, Ticker was pinned left, P&L was sorted desc, Trade ID was hidden and Side was filtered to Buy. The log showed `apply id="layout-b"`, then `apply id="layout-a"`, and there was no console message. I also applied B after a wrapper-captured layout ("Rich", which has `sum(Ticker)`). Values then held only `sum(Quantity)` and `sum(P&L)`, so no aggregation leaked through.

## Story verdicts
| Story | Verdict | Failing criteria |
| --- | --- | --- |
| US-01 | PASS | |
| US-02 | PASS | |
| US-03 | PASS | |
| US-04 | PASS | |
| US-05 | PASS | |
| US-06 | PASS | |
| US-07 | PASS | |
| US-08 | PASS | |

## Criteria detail
| Id | Story | Verdict | How it was checked |
| --- | --- | --- | --- |
| AC-01 | US-01 | PASS | Carried, rung 2 (previous run): with `?layouts=off` there is no toolbar and no Layout button. The fix does not touch this path. |
| AC-02 | US-01 | PASS | Rung 2, browser: on `/` the toolbar above the grid shows "Layout", and clicking it opened the "Layouts" panel with its list. |
| AC-03 | US-01 | PASS | Carried, rung 2: Close, Escape and backdrop each closed the panel with no grid change and no event. This run also closed the panel with Escape several times, and no event was logged. |
| AC-04 | US-01 | PASS | Rung 2, browser: the panel listed "Default layout", "A: Buys by P&L" and "B: Grouped by ticker". |
| AC-05 | US-01 | PASS | Carried, rung 2: `?layouts=empty` showed only "Default layout". The fix does not touch this path. |
| AC-19 | US-01 | PASS | Rung 2 plus search: I created "Rich", then loaded `?initialLayout=layout-a` (a reload). The panel listed only Default, A and B. A grep for `localStorage\|sessionStorage\|fetch\|XMLHttpRequest\|document.cookie` under `plugins/layouts` found nothing. |
| AC-26 | US-01 | PASS | Search and verify: `ag-grid` appears outside `packages/grid-core/src` only in `packages/grid-core/vite.config.ts` (externals, not imports). The demo uses `plugins: [tradeLayouts.plugin]` (`gridConfig.ts:40`). `GridCore.tsx` is unchanged (12:06, older than every layout file). typecheck and build both exit 0. |
| AC-06 | US-02 | PASS | Rung 2, browser: after pivot, grouping and sorting, I created "Rich". It appeared at once as "Rich (current)", and the log shows `create id="b37dbf54-a009-47f9-9586-1f2e50e8c120" name="Rich"` with a payload, a new UUID unlike any listed id. The previous run checked the grouped+sorted "Q1" case in full. |
| AC-07 | US-02 | PASS | Carried, rung 2: "q1" and "  " were refused with an inline message and no event. Validation code is unchanged. |
| AC-23 | US-02 | PASS | Carried, rung 2: "  Q3  " was listed and emitted as "Q3". The code is unchanged. |
| AC-24 | US-02 | PASS | Rung 2 plus rung 3: `captureLayoutState` returns a `JSON.parse(JSON.stringify())` copy, so the stored and emitted state is the round-tripped form (read `layoutState.ts`). Applying that stored "Rich" state after Default and B gave back an identical grid (see AC-11). The browser tools cannot run the literal round-trip on a live payload. |
| AC-11 | US-03 | PASS | Rung 2, browser: from Default I set pivot mode on, values `sum(Ticker)`/`sum(Quantity)`/`sum(P&L)`, Side as the pivot column (Buy/Sell headers), Trade ID as the row group sorted desc, the Group column widened to about 370px, and the filter Quantity = 450. That showed 4 rows: T-00500, T-00363, T-00119, T-00092. I saved this as "Rich". Default gave a flat grid with pivot off. B gave a Ticker group with pivot off. Applying Rich then restored pivot on, Buy/Sell with three sums each, Trade ID desc, the wide Group column and the same 4 rows. The log shows `apply id="b37dbf54-…"`. Hidden columns and pinning were checked with A: Trade ID hidden and Ticker pinned. |
| AC-12 | US-03 | PASS | Rung 2, browser: with B applied, I expanded JNJ, selected 2 child rows (the header checkbox went indeterminate), scrolled into JNJ's children and sorted Price asc. I then applied B. The sort went back to P&L desc and Price lost its sort. JNJ stayed expanded, the header checkbox stayed indeterminate and the same rows stayed in view. |
| AC-17 | US-03 | PASS | Rung 2, browser: after applying Rich I reopened the panel. Only "Rich (current)" was marked. After B, A and Default, the marker moved to that row each time. |
| AC-18 | US-03 | PASS | Rung 2, browser: B (unknown `desk` column in its column state and filter model) applied three times in this run. Each time it grouped by Ticker, summed Quantity/P&L, sorted P&L desc and filtered Settled. `read_console_messages` returned nothing for these actions. |
| AC-15 | US-04 | PASS | Rung 2, browser: Default after A, and after Rich (pivot on), gave the column-def order with Trade ID visible, no group, empty Values, no sort, no filter and pivot off. Each time the log gained exactly one `apply id=null`. The initial-layout variant is carried from the previous run, and `resetToDefault` is unchanged. |
| AC-16 | US-04 | PASS | Rung 2, browser: the Default row shows only Apply. Named rows show Apply, Update and Delete. |
| AC-25 | US-04 | PASS | Rung 2, browser: after Default Apply, the panel showed "Default layout (current)", and so did the next opening after Create. |
| AC-08 | US-05 | PASS | Carried, rung 2: the update event carried Q1's id and the new filter, and Default then Q1 restored it. The update path is unchanged. This run re-proved the apply half with AC-11. |
| AC-09 | US-05 | PASS | Carried, rung 2: the rename showed at once, and the event kept the same id. The code is unchanged. |
| AC-10 | US-05 | PASS | Carried, rung 2: "q2" and "  " were refused with a message and no event. The code is unchanged. |
| AC-27 | US-05 | PASS | Carried, rung 2: a case-only self-rename was accepted. The code is unchanged. |
| AC-13 | US-06 | PASS | Carried, rung 2: Confirm removed the row at once, and a delete event carried its id. The code is unchanged. |
| AC-14 | US-06 | PASS | Carried, rung 2: an inline "Delete X? Confirm / Cancel" appeared with no native dialog. Cancel kept the row and logged nothing. |
| AC-28 | US-06 | PASS | Carried, rung 2: deleting the current layout left the grid unchanged and marked Default current. The delete path does not call apply. |
| AC-20 | US-07 | PASS | Rung 2, browser (StrictMode dev): `?initialLayout=layout-a` opened with Ticker pinned left at about 140px, P&L desc, Trade ID hidden and only Buy rows. The panel shows "A: Buys by P&L (current)", the log reads "None yet." and the console is clean. |
| AC-21 | US-07 | PASS | Rung 2, browser: `?initialLayout=does-not-exist` opened in the column-def state with "Default layout (current)", "None yet." in the log and no console message. Plain `/` also showed Default current. |
| AC-22 | US-08 | PASS | Carried, rung 2: after Replace, only Default and C were listed, the grid was unchanged and no event was logged. `setLayouts` makes no api call. |
| AC-29 | US-08 | PASS | Carried, rung 2: after Replace, no row was marked current, the grid was unchanged and no event was logged. The code is unchanged. |

## Unverified
| Id | Why it could not be checked | What would prove it |
| --- | --- | --- |

None. AC-24's literal `JSON.parse(JSON.stringify(...))` step still rests on rung 3 (the capture code). Rung 2 shows that the stored, round-tripped state re-applies to an identical grid.

## Handoff
- Verdict: all 8 stories PASS (29 of 29 criteria). failing_tasks is empty.
- Full verify ran once: `npm run typecheck` and `npm run build` both exit 0.
- FIX-01 is confirmed in the running demo. Applying seed A after seed B leaves Values empty and the headers plain, with no `sum(...)` left over from B.
- This run re-drove every apply-dependent criterion in Chrome, because FIX-01 only touched `layoutState.ts`: AC-11, AC-12, AC-15, AC-17, AC-18, AC-20, AC-21, plus AC-02/04/06/16/19/25. 13 criteria in paths the fix does not touch are carried from the previous rung 2 run and labelled "carried".
- Observation, not an AC failure: D-04's `defaultState` does not reset `hide`, width or order. A partial layout such as B therefore leaves Trade ID hidden if the previous layout hid it (seen after Rich then B). Seed A works around this with explicit `hide: false`. Decide whether partial consumer layouts should reset visibility too.
- Observation: after A, the selection checkbox column sits after the pinned Ticker column, because A's order puts Ticker first. This is cosmetic and not covered by an AC.
- Console: the only errors are the AG Grid Enterprise trial-licence banner at load.
- The dev server on port 5173 was already running and was left running. The test tab was closed.
