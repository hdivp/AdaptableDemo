# FSD: Toolbar dashboard

## Summary
The plain row of browser-default buttons above the grid becomes an AdapTable-style dashboard: a light header bar with the grid title, tabs, quick search, settings and collapse, and below it a set of small titled toolbar panels.
The existing features (layouts, export, column sizing) move into those panels, so the grid looks like a finished product instead of a prototype.

The agreed look is the clickable mockup at `.aidlc/toolbar-dashboard/mockup.html` (published: https://claude.ai/artifact/DzK7QgDhxETdreebMSzNzj). Where this FSD and the mockup disagree, this FSD wins.

## Users and triggers
| Who | When they do it |
| --- | --- |
| Consumer (developer embedding the wrapper) | Sets the grid title and the tabs (which toolbars each tab shows) in config |
| End user | Switches tabs, collapses or expands the dashboard, hides or shows toolbars, types in quick search, uses a toolbar's controls |

## Functional requirements
| Id | Requirement | Pass condition |
| --- | --- | --- |
| FR-01 | When at least one plugin supplies a toolbar control, the grid shows a dashboard in place of today's toolbar strip. With no such plugin, no dashboard shows and the grid behaves as today. | Demo with `?layouts=off&actions=off` shows no dashboard; the default demo shows one. |
| FR-02 | The dashboard has a header bar holding, left to right: grid title, tabs, a flexible gap, quick search, settings button, collapse button. | All six parts are visible in the default demo, in that order. |
| FR-03 | The grid title comes from a new optional config value; when it is not set, the `gridId` is shown. | Demo with a title shows it; a config without one shows `demo-trades`. |
| FR-04 | The consumer defines tabs in config: each tab has a name and an ordered list of toolbar ids. When no tabs are defined, one tab named "Toolbars" shows every toolbar in `config.plugins` order. | Demo config with tabs "Trading", "Export", "All" shows those three tabs; a config with no tabs shows one "Toolbars" tab with every toolbar. |
| FR-05 | Clicking a tab shows that tab's toolbars in the area under the header and marks the tab as selected. | Click "Export": only the Export panel shows and "Export" is marked selected. |
| FR-06 | Each toolbar is a bordered panel with a small uppercase title strip and a hide (×) button. Its title comes from its plugin; if the plugin gives none, the plugin `id` is used. | Layout, Export and Columns panels each show their title; a plugin without a title shows its id. |
| FR-07 | The hide (×) button removes that toolbar from the current tab only. | Hide "Columns" on "All": it is gone from "All" but still on "Trading". |
| FR-08 | The settings button opens a pop-up listing every toolbar with a checkbox; ticking or unticking shows or hides it on the current tab. Escape or a click outside closes it. | Untick "Layout": the Layout panel disappears; tick it again: it comes back in its config order. |
| FR-09 | When a tab has no toolbars, the area shows "No toolbars on this tab. Use the gear to add one." | Hide every toolbar on a tab: the message shows. |
| FR-10 | The collapse button hides the toolbar area and leaves only the header; clicking it again brings the area back. Clicking a tab while collapsed expands the dashboard. | Collapse: grid moves up, header stays. Click a tab: toolbars return. |
| FR-11 | Quick search filters grid rows as the user types, across all columns, using AG Grid's quick filter. Clearing it shows every row. | Type `NVDA`: only rows holding NVDA show. Clear: all 500 rows return. |
| FR-12 | Layout toolbar: a dropdown lists Default and every saved layout, with the current one selected. Choosing one applies it. Beside it: Save, Save as, Rename and Delete icon buttons with tooltips. | Pick "By ticker" in the dropdown: the grid changes to that layout. Each button shows its tooltip on hover. |
| FR-13 | Layout toolbar actions use the existing layout plugin rules and events: Save as asks for a name, Rename asks for a new name, Delete asks for confirmation inside the grid UI (no browser `confirm`), and name errors show as today. | Save as with a duplicate name shows the existing error; Delete asks first and fires the existing delete event. |
| FR-14 | Save overwrites the current saved layout with the grid's present state. Save is disabled when the current layout is Default. | With Default selected, Save is greyed out; with a saved layout selected, Save fires the existing update event. |
| FR-15 | Export toolbar: a format dropdown (CSV, Excel) and a primary Export button. Export downloads `<gridId>.csv` or `<gridId>.xlsx` with the same content rules as today's actions plugin. | Pick Excel, click Export: `demo-trades.xlsx` downloads with the filtered rows. |
| FR-16 | Columns toolbar: "Auto-size" and "Fit to width" buttons with icons, same behaviour as today's actions. | Each button resizes the columns as the current buttons do. |
| FR-17 | The dashboard uses one light theme, as in the mockup: light grey header, white panels, one blue accent, the selected tab white with a blue top line. It does not follow the operating system dark mode. | With the OS in dark mode, the dashboard still looks like the mockup. |
| FR-18 | Every control can be used by keyboard and has a visible focus ring; tabs use tab roles, icon-only buttons have an accessible name. | Tab key reaches every control; a screen reader names each icon button. |

## Acceptance criteria
| Id | Covers | Given / When / Then |
| --- | --- | --- |
| AC-01 | FR-01 | Given no plugin has a toolbar control, when the grid renders, then no dashboard shows. |
| AC-02 | FR-02, FR-03 | Given the default demo, when it renders, then the header shows title, tabs, quick search, settings and collapse, in that order. |
| AC-03 | FR-03 | Given a config without a title, when it renders, then the header shows the `gridId`. |
| AC-04 | FR-04 | Given a config with no tabs, when it renders, then one "Toolbars" tab shows every toolbar in plugin order. |
| AC-05 | FR-05 | Given three tabs, when the user clicks "Export", then only that tab's toolbars show and it is marked selected. |
| AC-06 | FR-06, FR-07 | Given "Columns" shows on two tabs, when the user hides it on one, then it still shows on the other. |
| AC-07 | FR-08 | Given the settings pop-up is open, when the user unticks a toolbar, then it disappears; when Escape is pressed, then the pop-up closes. |
| AC-08 | FR-09 | Given a tab with every toolbar hidden, when it shows, then the empty message is visible. |
| AC-09 | FR-10 | Given the dashboard is expanded, when the user clicks collapse, then only the header shows and the grid grows; when the user clicks a tab, then it expands. |
| AC-10 | FR-11 | Given 500 rows, when the user types a ticker in quick search, then only matching rows show; when cleared, then all 500 show. |
| AC-11 | FR-12, FR-14 | Given saved layouts, when the user picks one in the dropdown, then it applies and becomes selected; with Default selected, then Save is disabled. |
| AC-12 | FR-13 | Given a saved layout is selected, when the user clicks Delete, then an in-grid confirmation appears; when confirmed, then the existing delete event fires. |
| AC-13 | FR-15 | Given the grid is filtered, when the user picks Excel and clicks Export, then `<gridId>.xlsx` downloads with only the filtered rows. |
| AC-14 | FR-16 | Given narrow columns, when the user clicks Auto-size, then columns widen to fit content. |
| AC-15 | FR-17 | Given the OS is in dark mode, when the grid renders, then the dashboard uses the light theme. |
| AC-16 | FR-18 | Given keyboard only, when the user presses Tab, then every dashboard control gets focus with a visible ring. |

## Data
| Field | Type | Rule |
| --- | --- | --- |
| Config: title | `string` (optional) | Header title. Falls back to `gridId`. |
| Config: tabs | `{ name: string; toolbars: string[] }[]` (optional) | `toolbars` holds plugin ids, in display order. Unknown ids are ignored. No tabs means one "Toolbars" tab with all toolbars. |
| Plugin: toolbar title | `string` (optional) | Title on the panel. Falls back to plugin `id`. |
| Runtime: selected tab, collapsed, hidden toolbars | in-memory | Reset when the page reloads. Not saved. |

## Out of scope
- Dark theme, or following the OS colour scheme.
- Saving dashboard state (selected tab, collapsed, hidden toolbars) across reloads, or adding it to saved layouts.
- A floating or pop-out dashboard, and dragging toolbars to reorder them.
- Shortcut icon buttons in the header (the mockup's Layouts and Export icons). The toolbars already hold those actions.
- An "Unsaved" marker on the Layout toolbar (shown in the mockup). It needs change tracking that the layout plugin does not have.
- New export options: report choice, column choice, custom file names.
- Version bumps of react, ag-grid, vite or typescript.

## Non-functional
| Id | Requirement | Limit |
| --- | --- | --- |
| NF-01 | Verification must pass. | `npm run typecheck && npm run build` exit 0. |
| NF-02 | Quick search must stay responsive on the demo data. | No visible lag typing into quick search with 500 rows. |
| NF-03 | AG Grid is imported only inside `packages/grid-core/src`. | Zero AG Grid imports in `apps/demo`. |

## Source brief
"the toolbar currently created by the wrapper has very bad UI. make it just like adaptable. create a new FSD by first showing me how will it look finally?"

Follow-ups: "use light theme". Chose option 1: the dashboard shell lives in `GridCore`.

## Decisions
- The dashboard shell (header, tabs, collapse, settings, panel frames) is built into `GridCore`. The user explicitly approved changing `GridCore.tsx` for this feature, which overrides the CLAUDE.md "no feature code in GridCore.tsx" rule for this shell only. Toolbar contents stay in plugins.
- Light theme only.
- The mockup at `.aidlc/toolbar-dashboard/mockup.html` is the visual reference.
- Assumed (change if wrong): header shortcut icons and the "Unsaved" marker are left out; dashboard state is not saved; quick search is part of the shell, not a plugin.

## Handoff
- Visual target: `.aidlc/toolbar-dashboard/mockup.html`. Match its layout, spacing and light palette.
- User approved changing `GridCore.tsx` for the dashboard shell only. Keep the shell in its own component files under `packages/grid-core/src` (for example a `dashboard/` folder), with `GridCore.tsx` just rendering it.
- New optional config: `title`, `tabs`. New optional plugin field for a toolbar title. Existing plugins without it still work (title falls back to `id`).
- Layout toolbar replaces the "Layout" button + modal with an inline dropdown and icon buttons; reuse the existing `LayoutActions` and store. Save as, Rename and Delete need small in-grid prompts (no `window.confirm` / `prompt`).
- Actions plugin splits into an Export panel (format select + Export) and a Columns panel. Decide whether that is two plugins or one plugin giving two panels; the demo must show three panels: Layout, Export, Columns.
- Quick search: confirm the v32 call with `ag-mcp` (expected `api.setGridOption("quickFilterText", text)`). Set version `32.2.0`, framework `react` first.
- Dashboard state is in-memory only. No persistence, no events.
- The tester must check that the light theme holds when the OS is in dark mode.
- No version bumps. AG Grid imports stay inside `packages/grid-core/src`.
