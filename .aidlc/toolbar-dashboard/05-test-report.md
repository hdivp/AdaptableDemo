# Test report: Toolbar dashboard

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
| US-06 | PASS | |
| US-07 | PASS | |
| US-08 | PASS | |

## Criteria detail
| Id | Story | Verdict | How it was checked |
| --- | --- | --- | --- |
| AC-01 | US-01 | PASS | Browser: `http://localhost:5173/?layouts=off&actions=off` renders no `.gridcore-dashboard`; grid renders normally with 500 rows. |
| AC-02 | US-01 | PASS | Browser: default demo header shows, left to right: "Trades" title, tabs (Trading/Export/All), quick search, `Dashboard settings` button, `Collapse dashboard` button. |
| AC-03 | US-01 | PASS | Browser: `?title=off` shows header title text "demo-trades". |
| AC-04 | US-01 | PASS | Browser: `?tabs=off` shows a single tab "Toolbars" with panels Layout, Export, Columns in that order. |
| AC-05 | US-01 | PASS | Browser: each panel (Layout, Export, Columns) has a bordered frame, an uppercase title strip, and a visible × ("Hide <name>") button. |
| AC-06 | US-01 | PASS | Browser: `?titles=off` — used `find` to read the DOM name of the panel title strips directly (not a screenshot, since CSS uppercases the text); DOM text is "export" and "columns" (the plugin ids), matching the risk note. |
| AC-07 | US-01 | PASS | Code (rung 3) + browser (rung 2): `dashboard.css` hard-codes every colour under `.gridcore-dashboard` (no `@media (prefers-color-scheme)` rule anywhere) and sets `color-scheme: light`; header background `--gridcore-head:#f3f5f8` (light grey), panel/selected-tab background `--gridcore-surface:#fff` (white) with an `inset 0 2px 0 var(--gridcore-accent)` top line on the selected tab, and quick-search/select inputs use `--gridcore-surface`. Visually confirmed these exact colours render in the browser. The browser tool available in this session (`claude-in-chrome`) has no control to actually toggle OS/`prefers-color-scheme` dark mode, so the "given the OS is in dark mode" precondition itself was not reproduced — the verdict rests on the code guaranteeing no dark-mode branching exists, which is the strongest available proof given the tooling. |
| AC-08 | US-02 | PASS | Browser: tabs "Trading", "Export", "All" show in that order; exactly one (`Trading`) is `aria-selected="true"` on load. |
| AC-09 | US-02 | PASS | Browser: clicked "Export" tab; only the Export panel is present in the DOM and only "Export" carries the selected-tab styling. |
| AC-10 | US-02 | PASS | Browser: "Trading" tab shows the Layout panel then the Columns panel (Export panel absent), in that order. |
| AC-11 | US-03 | PASS | Browser: on "All", clicked × on the Columns panel — it disappeared from "All"; switched to "Trading" — Columns panel still shown there. |
| AC-12 | US-03 | PASS | Browser: opened the settings popover on "All", unticked "Layout" — the Layout panel disappeared; reticked it — it reappeared in its original first position (before Export). |
| AC-13 | US-03 | PASS | Browser: with the popover open, pressed Escape — popover closed and focus visibly returned to the settings button (focus ring shown on it); reopened the popover and clicked a grid cell outside it — popover closed (confirmed the click passed through to select the underlying grid cell). |
| AC-14 | US-03 | PASS | Browser: hid the only toolbar on the "Export" tab via its × — text "No toolbars on this tab. Use the gear to add one." appeared. |
| AC-15 | US-04 | PASS | Browser: clicked collapse — only the header remained, panel area removed from the DOM, grid viewport grew; clicked collapse again — panels returned. |
| AC-16 | US-04 | PASS | Browser: while collapsed, clicked the "All" tab — dashboard expanded and showed All's panels (Layout, Export). |
| AC-17 | US-05 | PASS | Browser: typed "NVDA" into quick search on the Default layout — only NVDA rows shown; cleared the field — all 500 rows returned (confirmed via full row list in page text). |
| AC-18 | US-05 | PASS | Browser: typing rendered the filtered result with no observable delay between keystrokes and grid update. (Automated typing is inherently instantaneous, so this is a weaker check than a human timing it; code confirms no debounce/cache is used, per D-06, consistent with immediate filtering on 500 rows.) |
| AC-19 | US-06 | PASS | Browser: with quick search set to "NVDA", selected CSV and clicked Export — downloaded `demo-trades.csv` with exactly 30 data rows, all containing "NVDA" (verified by line/grep count on the file). Selected Excel and exported — downloaded `demo-trades.xlsx`; unzipped and confirmed 31 `<row>` elements (1 header + 30 data rows), matching the filtered count. Both files were deleted afterward. |
| AC-20 | US-06 | PASS | Browser: on the Columns panel, clicked Auto-size — columns visibly narrowed to content width; clicked Fit to width — columns visibly widened back to fill the grid width. |
| AC-21 | US-07 | PASS | Browser: opened the Layout dropdown — lists "Default", "A: Buys by P&L", "B: Grouped by ticker", with "Default" selected on load. |
| AC-22 | US-07 | PASS | Browser: selected "B: Grouped by ticker" — grid regrouped by ticker, the select stayed on "B: Grouped by ticker", and the events log showed `1. apply id="layout-b"`. |
| AC-23 | US-07 | PASS | Browser: with "Default" selected, Save/Rename/Delete icons showed the disabled (faded, ~45% opacity) styling seen in a zoomed screenshot; with "B: Grouped by ticker" selected, clicked Save — events log showed `update id="layout-b" name="B: Grouped by ticker"`. |
| AC-24 | US-07 | PASS | Browser: clicked Save as, entered the existing name "A: Buys by P&L" — error `A layout named "A: Buys by P&L" already exists.` shown; changed the name to "Mine" and saved — events log showed `create id="…" name="Mine"` and the dropdown selected "Mine". |
| AC-25 | US-07 | PASS | Browser: with "Mine" selected, clicked Rename, changed the name to "Mine 2" and saved — dropdown now shows "Mine 2" and events log showed `update id="…" name="Mine 2"`. |
| AC-26 | US-07 | PASS | Browser: clicked Delete — an in-grid "Delete Mine 2?" confirmation with Delete/Cancel buttons appeared (no native browser dialog interrupted the automated screenshot/read, confirming no `window.confirm`); clicked Delete — events log showed `delete id="…"` and the dropdown no longer lists "Mine 2" (back to Default/A/B). |
| AC-27 | US-07 | PASS | Code (rung 3) + browser (rung 2 attempted): `LayoutToolbarItem.tsx` sets both `title` and `aria-label` to "Save", "Save as", "Rename", "Delete" respectively — this is the mechanism that produces a native hover tooltip. Hovering each button in the browser was attempted; the OS-rendered native tooltip is not reliably captured by an automated screenshot, so this criterion leans on the code guarantee plus the confirmed attribute values rather than a captured tooltip image. |
| AC-28 | US-08 | PASS | Browser: pressed real Tab key-presses (not synthetic focus calls) starting from a neutral click; captured screenshots after each hop and confirmed a visible focus ring on: the "Trading" tab, the quick search input, the "Dashboard settings" button, the "Collapse dashboard" button, the panel's "Hide Layout" (×) button, and the Layout `<select>`, in that sequence — all reachable by Tab alone. |
| AC-29 | US-08 | PASS | Browser: read the accessibility tree — confirmed distinct accessible names "Dashboard settings", "Collapse dashboard", "Hide Layout", "Hide Columns", "Save", "Save as", "Rename", "Delete", "Auto-size columns", "Fit columns"; "Trading"/"Export"/"All" are exposed with `role="tab"`. (Read via the accessibility tree, not a live screen reader.) |

## Unverified
| Id | Why it could not be checked | What would prove it |
| --- | --- | --- |
| (none — all 29 criteria reached a PASS verdict; AC-07, AC-18, AC-27 and AC-29 note in the "How it was checked" column that the check fell short of the ideal rung because of tooling limits, but each still had a positive result at the best rung reachable.) | | |

## Handoff
- Overall verdict: PASS. All 8 stories (US-01 through US-08) pass; all 29 acceptance criteria pass.
- `npm run typecheck && npm run build` both pass cleanly from the repository root (only a Vite chunk-size warning on the demo build, not an error).
- Browser rung (rung 2, `claude-in-chrome`) was used for the large majority of criteria, driving the real demo at `http://localhost:5173` (an already-running dev server from a prior session; no new server was started or left running by this test pass).
- Two tooling gaps to flag: (1) no available control to toggle OS/`prefers-color-scheme` dark mode, so AC-07's "given OS dark mode" precondition was verified by code guarantee (no dark-mode CSS branch) rather than by reproducing real dark mode. (2) native `title`-attribute hover tooltips (AC-27) are not reliably visible in an automated screenshot; verified via the `title`/`aria-label` source instead.
- AC-29 was checked by reading the accessibility tree's exposed names/roles, not a live screen reader.
- Downloaded test files (`demo-trades.csv`, `demo-trades.xlsx`) from the AC-19 export check were deleted after verifying their row counts, to leave the machine as found.
- No product code was changed or reviewed for style; only acceptance-criteria behaviour was checked.
