# FSD: Style rules by data

## Summary
Grid users can make a cell or a whole row change how it looks — text colour, background colour, bold, italic — based on a simple condition on one column's value, without writing any code.
The wrapper never stores rules itself; the consumer supplies the list at bind time and persists changes from the events the wrapper emits, the same pattern already used by layout persistence.

## Users and triggers
| Who | When they do it |
| --- | --- |
| Consumer (developer embedding the wrapper) | Binds the grid, passes the saved rules and listens for rule events to write them to its DB; may later pass a new list |
| End user | Clicks the "Style rules" button in the toolbar and creates, edits, reorders, enables/disables, or deletes a rule |

## Functional requirements
| Id | Requirement | Pass condition |
| --- | --- | --- |
| FR-01 | The feature is opt-in: a grid bound without it shows no extra toolbar button and no styling from this feature. | Demo grid without the plugin shows no "Style rules" button and no conditional styling; typecheck and build pass. |
| FR-02 | A toolbar button labelled "Style rules" opens a pop-up; closing it without action changes nothing and emits no event. | Click opens the pop-up; closing it leaves grid styling and the rule list unchanged. |
| FR-03 | The consumer can pass a list of saved rules when binding the grid. | Rules passed at bind time are listed by name in the pop-up and are already styling the grid on first render. |
| FR-04 | The pop-up lists every rule by name, in priority order, showing its scope (row or a named column) and whether it is enabled. | Pop-up shows one row per rule with name, scope, and an enabled/disabled state, in list order. |
| FR-05 | "Create new" lets the user choose a scope (a specific column, or the whole row), a condition (an operator and a value, offered for the chosen column's data type), and a style (text colour, background colour, bold, italic, or a combination), then name and save it. | Creating a rule for "pnl < 0 → red text" on the P&L column applies red text to every cell where pnl is negative, immediately. |
| FR-06 | The operators offered match the target column's data type: text offers equals / contains / starts with / ends with; number offers = / ≠ / > / < / ≥ / ≤ / between; date offers before / after / on / between; boolean offers is true / is false. | Choosing a number column offers only the number operators; choosing a text column offers only the text operators. |
| FR-07 | A "row" scope rule is evaluated against one chosen column's value, but the resulting style is applied to every cell in the row. | A row-scope rule "settled = false → yellow row" colours every cell in an unsettled trade's row yellow. |
| FR-08 | A rule can be switched off without deleting it; a disabled rule stops applying at once and stays in the list. | Disable a rule; its styling disappears immediately; the rule is still listed and can be re-enabled. |
| FR-09 | "Update" changes any part of an existing rule (scope, column, condition, style, or name) and the grid restyles immediately. | Change a rule's threshold from 0 to 100; cells between 0 and 100 that were styled stop being styled at once. |
| FR-10 | "Delete" removes a rule after the user confirms; matching cells or rows lose that rule's styling immediately. | Confirm delete; the rule leaves the list and its styling disappears at once; cancelling changes nothing. |
| FR-11 | The user can change a rule's priority in the list (e.g. move up/down). Where two enabled rules would set the same style property on the same cell, the one lower in the list wins; style properties that do not overlap are combined. | With rule A (background yellow) above rule B (background red) both matching one cell, that cell is red. With rule A (bold) and rule C (background blue) both matching, the cell is both bold and blue. |
| FR-12 | The wrapper generates the id of a newly created rule; it is unique within the current list. | Create event payload carries a non-empty id not used by any other listed rule. |
| FR-13 | The wrapper emits an event for each of create, update, delete, and reorder, carrying the affected rule's data (or the full reordered list for reorder). | A consumer listener receives one event per action with the payload described in the Data section. |
| FR-14 | The wrapper does not write rules to any storage (no localStorage, no network). | Reloading the page shows only the rules the consumer passes in. |
| FR-15 | Rule names must be non-empty after trimming and unique among the listed rules (case-insensitive), ignoring the rule being renamed. | Create or rename with an empty or duplicate name is refused with a visible message and no event. |
| FR-16 | Styling re-applies automatically whenever the underlying row data changes (e.g. a live value update), with no manual step from the consumer. | Update a row's `pnl` from 50 to -50 while a "pnl < 0 → red" rule is enabled; that row's styling updates without a page refresh or replay of any action. |
| FR-17 | A rule referring to a column that no longer exists in `config.columns` is skipped when styling, without an error. | Bind with a rule naming a removed column; the grid renders and styles normally, ignoring that one rule. |
| FR-18 | The wrapper's list reflects create, update, delete and reorder immediately, without waiting for the consumer. | After each action the pop-up list and the grid's styling change before the consumer passes any new list. |
| FR-19 | When the consumer passes a new list after bind, it replaces the wrapper's list entirely. | Pass a new list [C]; pop-up shows only C and grid styling reflects only C. |
| FR-20 | Rule conditions check a cell's underlying value, not the text produced by a custom cell renderer. | A rule on a date column matches by the actual date value even if the column renders it as "3 days ago". |
| FR-21 | The feature is delivered as a `GridPlugin` and the demo/app never imports AG Grid (CLAUDE.md rules). | Demo enables it through `config.plugins`; no AG Grid import outside `packages/grid-core/src`. |

## Acceptance criteria
| Id | Covers | Given / When / Then |
| --- | --- | --- |
| AC-01 | FR-01 | Given a grid bound without the plugin, when it renders, then no "Style rules" button appears and no cell is conditionally styled. |
| AC-02 | FR-02 | Given the plugin is enabled, when the user opens then closes the pop-up without acting, then nothing changes and no event fires. |
| AC-03 | FR-03, FR-04 | Given the consumer passes rules A and B, when the grid renders, then A and B are listed and already styling matching cells. |
| AC-04 | FR-05, FR-12, FR-13, FR-18 | Given no rules exist, when the user creates "Negative P&L" (pnl < 0, red text), then it is listed at once, matching cells turn red, and a create event carries a new unique id and the rule's data. |
| AC-05 | FR-06 | Given the create form is open for a text column, when the user opens the operator list, then only text operators are offered. |
| AC-06 | FR-07 | Given a row-scope rule on "settled = false", when a row's settled value is false, then every cell in that row is styled. |
| AC-07 | FR-08 | Given an enabled rule is styling cells, when the user disables it, then the styling disappears at once and the rule remains listed. |
| AC-08 | FR-09 | Given rule "Negative P&L" exists, when the user updates its threshold, then matching cells change immediately to reflect the new threshold. |
| AC-09 | FR-10 | Given rule "Negative P&L" exists, when the user deletes and confirms, then it leaves the list, its styling disappears, and a delete event fires; cancelling changes nothing. |
| AC-10 | FR-11 | Given rule A (background yellow) is above rule B (background red) and both match one cell, when the grid renders, then that cell shows red, not yellow. |
| AC-11 | FR-11 | Given rule A sets bold and rule C sets a background colour and both match one cell, when the grid renders, then that cell is both bold and coloured. |
| AC-12 | FR-15 | Given rule "Negative P&L" exists, when the user creates another named "negative p&l" or "  ", then it is refused with a message and no event fires. |
| AC-13 | FR-16 | Given a "pnl < 0 → red" rule is enabled, when a row's pnl value is updated from 50 to -50, then that row's pnl cell turns red without any other user action. |
| AC-14 | FR-17 | Given a rule names a column removed from `config.columns`, when the grid renders, then it applies normally and throws no error for that rule. |
| AC-15 | FR-14 | Given the user created a rule, when the page reloads and the consumer passes its original list, then the new rule is absent. |
| AC-16 | FR-19 | Given the user created rule "C", when the consumer then passes the list [D], then the pop-up and the grid's styling reflect only D. |
| AC-17 | FR-20 | Given a date column renders relative text via a custom formatter, when a rule checks the underlying date, then matching is based on the real date, not the rendered text. |
| AC-18 | FR-21 | Given the demo enables the plugin, when the code is inspected, then no AG Grid import exists outside `packages/grid-core/src`. |

## Data
| Field | Type | Rule |
| --- | --- | --- |
| id | string | Unique within the list; stable across updates. Generated by the wrapper on create; supplied by the consumer for passed-in rules. |
| name | string | Required; trimmed non-empty; unique case-insensitive within the list. |
| enabled | boolean | Defaults to `true` on create. |
| scope | "cell" \| "row" | "cell" styles only the evaluated column's cell; "row" styles every cell in the row. |
| column | string (field name) | The column the condition checks, for both scopes. |
| condition | operator + value(s) | Operator set depends on the column's `dataType`; "between" takes two values. |
| style | { textColor?, backgroundColor?, bold?, italic? } | At least one property set; values drawn from a fixed palette/toggle set, not free-form colour input. |
| priority | implicit from list position | Position in the list; last in the list wins on overlapping style properties (FR-11). |
| Bind input: rules | rule[] | The saved rules; may be empty. A later new list replaces the wrapper's list. |
| Create event payload | rule | Full rule (wrapper-generated id, name, scope, column, condition, style, enabled). |
| Update event payload | rule | Full rule with the existing id and the current definition. |
| Delete event payload | id | Id of the removed rule. |
| Reorder event payload | id[] | Full ordered list of rule ids after the move. |

## Out of scope
- A free-form colour picker; v1 offers a small fixed set of colours and the bold/italic toggles only.
- Colour scales, data bars, or icon sets (Excel/AdapTable-style heat-map formatting).
- A single rule combining conditions across more than one column (AND/OR between columns) — one column per rule only in v1.
- Import/export of rule sets to files, sharing rules between users, or per-user ownership.
- Undo of delete after confirmation.
- Storing rules anywhere inside the wrapper (DB, localStorage, server calls).
- Merging a consumer-passed list with the wrapper's list; a new list simply replaces it, matching the layout feature's convention.
- Changes to `GridCore.tsx` beyond what the existing plugin seam allows; version bumps of react, ag-grid, vite or typescript.

## Non-functional
| Id | Requirement | Limit |
| --- | --- | --- |
| NF-01 | Verification must pass. | `npm run typecheck && npm run build` exit 0. |
| NF-02 | Rule definitions must be serialisable. | `JSON.parse(JSON.stringify(rule))` applies identically. |
| NF-03 | No limit on rule count or grid size is set by the brief. | None stated; not to be invented. |

## Source brief
User asked to add a "style rules by data" feature, matching what AdapTable offers over plain AG Grid: "Style rules by data. Color a cell or row based on its value, with a UI to set it up. No code needed." No existing AG Grid feature provides a no-code rule-builder UI for this (AG Grid only exposes the underlying `cellClassRules` / `rowClassRules` / `cellStyle` mechanisms to code); this FSD designs that UI and rule model from scratch, following the same opt-in, wrapper-emits-events, consumer-persists pattern already used by the delivered layout-persistence feature.

## Decisions
- Chosen to follow the layout-persistence feature's exact pattern (wrapper stores nothing, consumer passes rules in, wrapper emits create/update/delete/reorder events) for consistency across the plugin family — needs confirmation this is still wanted here, since style rules could plausibly be simpler (e.g. wrapper keeps its own storage) if the consumer would rather not build a second persistence path.
- One column per rule, no cross-column conditions — flagged as the main scope-narrowing call in this FSD; combining conditions across columns could reuse the Smart filter UI's builder in a later iteration but is treated as new scope, not this one.
- Fixed style palette instead of a free colour picker — needs confirmation on exactly which colours/combinations should be offered; this FSD deliberately leaves the palette unspecified rather than inventing one.
- Priority/stacking rule (FR-11: last in the list wins on overlapping properties, non-overlapping properties combine) chosen to mirror AG Grid's own documented `cellClassRules` stacking behaviour (confirmed via ag-mcp) rather than invent a different model — needs confirmation this matches user expectation, since "last wins" vs "first wins" is an easy point of confusion in the UI copy.
- Needs a human check at build time: confirm via `ag-mcp` whether style updates require an explicit `api.refreshCells()` (or similar) call to repaint immediately per FR-09/FR-16, or whether AG Grid's own re-evaluation on data change is sufficient.

## Handoff
- Opt-in `GridPlugin` via `config.plugins`, structured like `createLayoutPlugin`: a store holding the rule list, a pop-up for create/update/delete/reorder/enable-toggle, a toolbar button, and an events object the consumer supplies at bind time.
- Rules are applied via AG Grid's `cellClassRules` (cell scope) and `rowClassRules` (row scope) — or `cellStyle`/`getRowStyle` functions — built dynamically from the current rule list; the plugin owns turning "column X, operator, value, style" into these functions, not the consumer.
- Re-evaluate and repaint whenever the rule list changes (create/update/delete/enable/reorder) and whenever the grid's own data-change events fire, per FR-16 — confirm the exact repaint API at build time.
- Highest effort of the four requested features: this is the only one with no equivalent AG Grid built-in (contrast with Smart filter UI, which rides on AG Grid's Advanced Filter) and needs its own rule model, condition-by-data-type UI, and stacking logic — comparable in size to the already-delivered layout-persistence feature.
- AG Grid imports stay inside `packages/grid-core/src`; no feature code in `GridCore.tsx`.
- AG Grid 32 + React 18: `cellClassRules`, `rowClassRules`, `cellStyle`, `getRowStyle` all confirmed present and re-evaluate automatically on data refresh/update in v32.2.0 via ag-mcp; confirm repaint/refresh API names at build time rather than trusting this document.
- Assumed: rule names unique case-insensitive; unknown columns in a rule are ignored rather than erroring; state must survive a JSON round-trip — all mirroring the layout feature's existing conventions for consistency.
- No test command exists; verification is typecheck and build only.
