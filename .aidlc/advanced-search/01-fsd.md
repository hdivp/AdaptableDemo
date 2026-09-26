# FSD: Advanced search

## Summary
Grid users get a search box above the grid that finds matching cells across every column at once, shows how many matches there are, and lets them jump from one to the next.
Unlike a filter, searching never hides rows — it only finds and highlights.

## Users and triggers
| Who | When they do it |
| --- | --- |
| Consumer (developer embedding the wrapper) | Enables the plugin; optionally excludes hidden columns from being searched |
| End user | Types into the search box to find matching cells anywhere in the grid, then steps through matches |

## Functional requirements
| Id | Requirement | Pass condition |
| --- | --- | --- |
| FR-01 | The feature is opt-in: a grid bound without it shows no search box and behaves as today. | Demo grid without the plugin shows no search box; typecheck and build pass. |
| FR-02 | When enabled, a search box appears in the toolbar above the grid. | Toolbar shows a text input, visible directly above the grid. |
| FR-03 | Typing searches every visible column's cell values, across the rows currently shown by any other sort/filter/grouping, case-insensitively, matching on partial text. | Typing "buy" matches a cell containing "Buy" or "buyer"; rows hidden by another filter are not searched. |
| FR-04 | A live count next to the box shows the current match's position and the total, e.g. "2 of 7", or a "No matches" message. | Typing a term with 7 matching cells shows "1 of 7" as soon as results are found. |
| FR-05 | Next/previous controls step between matches; stepping scrolls and, if needed, scrolls the grid horizontally so the matched cell is visible. | Clicking "next" when a match is off-screen brings that cell into view and updates the count. |
| FR-06 | The current match is visually distinguished from other matches (e.g. a different highlight). | With 3 matches on screen, exactly one shows the "current" highlight style at a time. |
| FR-07 | Searching never changes which rows are shown; it only finds and highlights cells within the rows already visible. | Search for a term that exists only in a row hidden by an active filter; that row stays hidden and is not counted as a match. |
| FR-08 | Hidden columns are excluded from search by default; the consumer may opt in to include them. | With a hidden column containing the only match and the option left at its default, the count shows "No matches"; with the option enabled, the match is found. |
| FR-09 | Clearing the search box removes all highlighting and the match count. | Clear the box; no cell shows a highlight and the count area is empty. |
| FR-10 | The match count and current match stay correct when the grid's visible rows change while a search is active (new sort, filter, or grouping). | Apply a new filter while 5 matches are shown; the count updates to reflect only the matches still visible. |
| FR-11 | Pressing Enter in the search box moves to the next match; Shift+Enter moves to the previous match. | With the box focused and matches present, Enter advances the current match by one; Shift+Enter moves back one. |
| FR-12 | The feature is delivered as a `GridPlugin` and the demo/app never imports AG Grid (CLAUDE.md rules). | Demo enables it through `config.plugins`; no AG Grid import outside `packages/grid-core/src`. |

## Acceptance criteria
| Id | Covers | Given / When | Then |
| --- | --- | --- | --- |
| AC-01 | FR-01 | Given a grid bound without the plugin | no search box is shown. |
| AC-02 | FR-02 | Given the plugin is enabled | a search box is visible in the toolbar. |
| AC-03 | FR-03 | Given rows across several columns, when the user types a term that appears in two different columns | both matching cells count as matches. |
| AC-04 | FR-04 | Given 7 matching cells, when the user finishes typing | the count reads "1 of 7". |
| AC-05 | FR-05 | Given a match below the visible scroll area, when the user clicks "next" until reaching it | the grid scrolls so that cell is visible. |
| AC-06 | FR-06 | Given 3 matches are highlighted, when the user checks which one is current | exactly one has the current-match style. |
| AC-07 | FR-07 | Given an active column filter hides some rows, when the user searches for text that only exists in a hidden row | that row stays hidden and is not counted. |
| AC-08 | FR-08 | Given a hidden column contains the only match and the default option is used | the count shows no matches. |
| AC-09 | FR-08 | Given the consumer enables "include hidden columns" and a hidden column contains the only match | the count shows one match. |
| AC-10 | FR-09 | Given a search is active with highlights showing, when the user clears the box | no highlight remains and the count is empty. |
| AC-11 | FR-10 | Given 5 matches are shown, when a new filter removes 3 of the matching rows | the count updates to reflect the 2 remaining matches. |
| AC-12 | FR-11 | Given the search box is focused with matches present, when the user presses Enter | the current match advances by one. |
| AC-13 | FR-12 | Given the demo enables the plugin | no AG Grid import exists outside `packages/grid-core/src`. |

## Data
| Field | Type | Rule |
| --- | --- | --- |
| Bind input: includeHiddenColumns | boolean, optional | Defaults to `false`, matching AG Grid's own Quick Filter default. |

## Out of scope
- Regular expressions or wildcard syntax in the search box.
- Saving or recalling past searches.
- Replacing values found by search.
- Hiding non-matching rows — that is filtering, covered by the separate "Smart filter UI" FSD, and is deliberately not what this feature does (FR-07).
- Searching inside custom cell renderers whose displayed text differs from the underlying value, beyond what AG Grid's own text conversion provides.
- Any event to the consumer — search state is transient UI state, not something a consumer needs to persist.
- Changes to `GridCore.tsx` beyond what the existing plugin seam allows; version bumps of react, ag-grid, vite or typescript.

## Non-functional
| Id | Requirement | Limit |
| --- | --- | --- |
| NF-01 | Verification must pass. | `npm run typecheck && npm run build` exit 0. |
| NF-02 | Typing in the search box must not visibly lag the grid. | None stated; not to be invented — implementation may debounce keystrokes. |

## Source brief
User asked to add an "advanced search" feature, matching what AdapTable offers over plain AG Grid: "Advanced search. Search across all columns at once." Investigation found AG Grid 32 has a built-in Quick Filter that searches all columns but only hides non-matching rows — it has no match count, no highlight, and no next/previous navigation, so those parts of this FSD are new UI built on top of it, not something AG Grid ships.

## Decisions
- Chosen to behave as "find" (highlight + jump, rows stay visible) rather than "filter" (hide non-matching rows), so this feature stays distinct from the per-column filters, the Smart filter UI feature, and does not fight with either over which rows are shown. This is the main design call in this FSD and is open to revisiting if the user meant something closer to Quick Filter's row-hiding behaviour.
- AG Grid 32 has no built-in match-count/highlight/navigate ("Find") feature confirmed via ag-mcp — this is why the effort here is higher than the toolbar and smart-filter features: the matching, counting, and navigation logic is custom, only the underlying substring/case-insensitive text access rides on AG Grid conventions.
- Needs a human check at build time: confirm the exact AG Grid v32 API for scrolling a specific cell into view and flashing it (expected `ensureIndexVisible`, `ensureColumnVisible`, `flashCells`) via `ag-mcp`, not from memory.

## Handoff
- Opt-in `GridPlugin` via `config.plugins`: a `ToolbarItem` holding the search box, count, and next/previous controls; no store, no events, no persistence.
- Matching and counting are computed by the plugin itself (using `config.columns` field values on currently visible rows), not solely by setting AG Grid's `quickFilterText`, because the plugin needs to know *which* cells matched, not just which rows.
- Re-run matching whenever the grid's filtered/sorted/grouped row set changes, so the count in FR-10 stays correct; recompute rather than cache stale results.
- AG Grid imports stay inside `packages/grid-core/src`; no feature code in `GridCore.tsx`.
- AG Grid 32 + React 18: no built-in "Find" feature exists at this version (confirmed via ag-mcp); build on row/column iteration plus `ensureIndexVisible` / `ensureColumnVisible` / `flashCells`, confirming exact names at build time.
- Assumed: search box debounces keystrokes for performance; exact debounce interval is an implementation detail, not a requirement.
- No test command exists; verification is typecheck and build only.
