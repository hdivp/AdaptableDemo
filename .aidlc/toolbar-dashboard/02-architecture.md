# Architecture: Toolbar dashboard

## Approach
The existing `GridPlugin.ToolbarItem` seam stays the only way a feature gets a control. `GridCore.tsx` swaps its plain `.gridcore-toolbar` strip for a new `<Dashboard>` shell, which lives in `packages/grid-core/src/dashboard/`. The FSD's Decisions approve this change to GridCore for the shell only.
The shell owns the header, tabs, collapse, settings, quick search and the panel frames. Each panel still renders one plugin's `ToolbarItem`, which gets a new optional `toolbarTitle` on the plugin.
The layouts plugin (`plugins/layouts/LayoutToolbarItem.tsx`) and the actions plugin (`plugins/actions/ActionsToolbarItem.tsx`) keep their stores, rules and events. Only what their toolbar items render changes.

## Design decisions
| Id | Decision | Why | Rejected |
| --- | --- | --- | --- |
| D-01 | The shell is a set of components under `packages/grid-core/src/dashboard/`. `GridCore.tsx` only renders `<Dashboard>` and holds the quick search text. | This is the FSD decision, and it keeps GridCore small. Toolbar contents stay in plugins. | Writing the shell inline in `GridCore.tsx`, or making the shell a plugin. The user chose option 1. |
| D-02 | Add an optional `toolbarTitle?: string` to `GridPlugin`. The panel title is `plugin.toolbarTitle ?? plugin.id`. | This is the smallest change to the contract, and existing plugins keep working. | A `toolbar: { title, Item }` object. That would break the existing `ToolbarItem` field. |
| D-03 | The actions plugin gets optional `id` (default `"actions"`) and `title` options. The demo creates two instances: `export` (exportCsv, exportExcel) and `columns` (autosizeColumns, fitColumns). | One factory keeps the demo's three panels and the existing content rules, and needs no new plugin. | New `createExportPlugin` and `createColumnsPlugin` factories, which would duplicate the catalog. Also rejected: one plugin that renders two panels, which the one-panel-per-plugin seam does not allow. |
| D-04 | `ActionsToolbarItem` groups its kinds. Export kinds become one format `<select>` (only the kinds given, in the given order) plus a primary Export button. Sizing kinds become buttons with an icon and a label ("Auto-size", "Fit to width"). | FR-15 and FR-16. File names and the export calls stay as they are in `actionCatalog.ts`. | Keeping one button per kind. That does not match the mockup. |
| D-05 | Quick search text lives in `GridCore` state and reaches the grid as the `quickFilterText` prop on `<AgGridReact>`, placed after the options spread. | The v32 docs recommend updating options through props. The text also survives the grid being re-created. | Calling `api.setGridOption("quickFilterText", …)` from the header. That is valid in v32, but the text is lost when the grid is re-created. |
| D-06 | Quick search uses AG Grid's default of searching visible columns only. It adds no debounce and no `cacheQuickFilter`. | It searches what the user sees. The docs say the cache only matters above about 10k rows, and the demo has 500. | Turning on `includeHiddenColumnsInQuickFilter`. |
| D-07 | Dashboard state is one `useReducer` inside `Dashboard`, built by pure functions in `dashboardModel.ts`. It holds the active tab index, the collapsed flag, and the set of visible toolbar ids for each tab. | In-memory state that resets on reload, as the FSD asks. Pure functions are easy to reason about. | A store shared with plugins. Nothing outside the shell needs this state. |
| D-08 | Visible order on a tab is the tab's configured `toolbars` order first, then any toolbar added through the gear, in `config.plugins` order. Unknown and duplicate ids are dropped. | "Comes back in its config order" (FR-08) holds for both kinds of toolbar. | Appending in the order the user clicked, which does not satisfy FR-08. |
| D-09 | Collapsed or inactive panels are unmounted, not hidden. | Plugin state lives in external stores (for example the layout store), so nothing is lost that matters. The Export format choice resets, which is acceptable. | Keeping every panel mounted with `hidden`. |
| D-10 | Every tab is a `role="tab"` button with `tabIndex=0`, so the Tab key reaches each one. The area below is `role="tabpanel"`. The collapse button uses `aria-expanded`. Icon buttons get both `aria-label` and `title`. | AC-16 says the Tab key reaches every control. | A roving tabindex with arrow keys, which the Tab key alone would not reach. |
| D-11 | Light theme only. Every dashboard colour is a hard-coded token under `.gridcore-dashboard`, which also sets `color-scheme: light` so native select, checkbox and search inputs stay light when the OS is in dark mode. It uses the system font stack, not IBM Plex. | FR-17. Loading a web font from Google would be a new external dependency. | Following `prefers-color-scheme`, or loading the mockup's Google font. |
| D-12 | The header shows the grid icon and the title. When `config.title` is set, `gridId` also shows as small muted text after it, as in the mockup. | This matches the visual reference, and the FSD does not forbid it. | Showing the title alone. |
| D-13 | The Layout toolbar has an inline `<select>` plus Save, Save as, Rename and Delete icon buttons. Save as, Rename and Delete open a small prompt popover under the panel: a name form, or a Delete/Cancel confirmation. `LayoutPopup.tsx` (the modal) is removed and `NameForm` moves to its own file. | FR-12 and FR-13. There is no browser `prompt` or `confirm`. | Keeping the modal next to the dropdown. |
| D-14 | Save calls the existing `update(id, currentName)`, which captures state and fires `onLayoutUpdate`. Rename calls a new `rename(id, name)` action. It checks the name with `validateLayoutName`, keeps the saved state, and fires `onLayoutUpdate`. Save as calls `create(name)`. | Renaming a layout should not quietly overwrite its contents. The events are the same as today. | Rename through `update`, which would also overwrite the saved state. |
| D-15 | Save, Rename and Delete are disabled unless a saved layout is current. When `currentId` is `undefined` (after `setLayouts` drops the current layout), the select shows a disabled "Select a layout" option. | FR-14 for Save. Rename and Delete have no meaning for Default. | Letting a user rename Default, which has no stored record. |
| D-16 | Shared control classes (`gridcore-btn`, `gridcore-btn--primary`, `gridcore-btn--icon`, `gridcore-select`) and icons (`internal/icons.tsx`) live in grid-core. Plugins use them so every panel looks the same. | This gives one visual system with no duplicate CSS. | Each plugin styling its own buttons. |
| D-17 | The settings popover and the layout prompt close on Escape (focus goes back to the button that opened them) and on a `mousedown` outside them. They use `z-index: 1000`, the same as today's layouts backdrop. | FR-08. Both sit above the AG Grid header and side bar. | A full-screen backdrop, which is heavier than the mockup. |

## Files
| Path | Add or change | What for |
| --- | --- | --- |
| `packages/grid-core/src/types.ts` | change | Add `GridCoreTab`, `GridCoreConfig.title?` and `.tabs?`, and `GridPlugin.toolbarTitle?`. |
| `packages/grid-core/src/index.ts` | change | Export the `GridCoreTab` type. |
| `packages/grid-core/src/GridCore.tsx` | change | Replace the toolbar strip with `<Dashboard>`. Hold `quickFilterText` state and pass it to `<AgGridReact>`. |
| `packages/grid-core/src/GridCore.css` | change | Remove the `.gridcore-toolbar` rule. Keep the root, viewport and overlay rules. |
| `packages/grid-core/src/dashboard/Dashboard.tsx` | add | The shell root. Owns the reducer and renders the header, tab panel, empty message and panels. |
| `packages/grid-core/src/dashboard/DashboardHeader.tsx` | add | Title, tablist, spacer, quick search, settings, collapse. |
| `packages/grid-core/src/dashboard/ToolbarPanel.tsx` | add | A bordered panel with an uppercase title strip and a × hide button. Renders the plugin's `ToolbarItem`. |
| `packages/grid-core/src/dashboard/SettingsPopover.tsx` | add | A checkbox list of every toolbar for the current tab. Closes on Escape or an outside click. |
| `packages/grid-core/src/dashboard/QuickSearch.tsx` | add | A search input, controlled by the value from GridCore. |
| `packages/grid-core/src/dashboard/dashboardModel.ts` | add | Pure functions: `resolveTabs`, `initialDashboardState`, `dashboardReducer`, `visibleToolbarIds`. |
| `packages/grid-core/src/dashboard/dashboard.css` | add | Light theme tokens, the header, tabs, panels, popover, focus rings, and the shared `gridcore-btn` and `gridcore-select` classes. |
| `packages/grid-core/src/internal/icons.tsx` | add | Small inline SVG icons (grid, search, gear, chevron, x, save, plus, edit, trash, download, auto-size, fit), all `aria-hidden`. |
| `packages/grid-core/src/plugins/actions/types.ts` | change | Add `id?` and `title?` to `ActionsPluginOptions`. |
| `packages/grid-core/src/plugins/actions/actionCatalog.ts` | change | Add a `group: "export" \| "size"`, a short label and an icon to each kind. The run functions do not change. |
| `packages/grid-core/src/plugins/actions/ActionsToolbarItem.tsx` | change | Render the export group as a select plus an Export button, and the size group as icon buttons. |
| `packages/grid-core/src/plugins/actions/createActionsPlugin.ts` | change | Use `options.id ?? "actions"`. Set `toolbarTitle` from `options.title`. |
| `packages/grid-core/src/plugins/layouts/createLayoutPlugin.ts` | change | Add the `rename` action. Set `toolbarTitle: "Layout"`. Import `LayoutActions` from its new file. |
| `packages/grid-core/src/plugins/layouts/layoutActions.ts` | add | The `LayoutActions` interface, moved out of `LayoutPopup.tsx`, plus `rename`. |
| `packages/grid-core/src/plugins/layouts/NameForm.tsx` | add | `NameForm`, moved out of `LayoutPopup.tsx` without changing its behaviour. |
| `packages/grid-core/src/plugins/layouts/LayoutPrompt.tsx` | add | The popover for Save as, Rename and Delete confirmation. |
| `packages/grid-core/src/plugins/layouts/LayoutToolbarItem.tsx` | change | The inline select and the four icon buttons, with an error line. |
| `packages/grid-core/src/plugins/layouts/LayoutPopup.tsx` | remove | The modal is replaced by the inline toolbar. |
| `packages/grid-core/src/plugins/layouts/layouts.css` | change | Remove the modal styles. Add the prompt popover styles. |
| `apps/demo/src/gridConfig.ts` | change | `title: "Trades"`; tabs Trading / Export / All; two actions plugin instances. Add the test switches `?title=off`, `?tabs=off` and `?titles=off`. |
| `README.md` | change | Document `title`, `tabs`, `toolbarTitle`, and the shared control classes for plugin authors. |

Totals: 11 files added, 13 changed, 1 removed.

## Contracts
```ts
// types.ts
export interface GridCoreTab {
  /** Tab label. */
  name: string;
  /** Plugin ids in display order. Unknown ids are ignored. */
  toolbars: string[];
}
export interface GridCoreConfig<TRow = unknown> {
  // ...existing fields
  /** Header title. Falls back to gridId. */
  title?: string;
  /** Absent or empty: one "Toolbars" tab with every toolbar, in plugin order. */
  tabs?: GridCoreTab[];
}
export interface GridPlugin<TRow = unknown> {
  // ...existing fields
  /** Title of this plugin's dashboard panel. Falls back to `id`. */
  toolbarTitle?: string;
}

// dashboard/dashboardModel.ts
export interface ResolvedTab { name: string; toolbars: string[] } // known, de-duplicated ids
export interface DashboardState {
  activeTab: number;
  collapsed: boolean;
  /** Visible toolbar ids for each tab, by tab index. */
  visible: ReadonlySet<string>[];
}
export type DashboardAction =
  | { type: "selectTab"; index: number }       // also sets collapsed = false
  | { type: "toggleCollapsed" }
  | { type: "hide"; id: string }               // current tab only
  | { type: "show"; id: string };              // current tab only
export function resolveTabs(tabs: GridCoreTab[] | undefined, toolbarIds: string[]): ResolvedTab[];
export function initialDashboardState(tabs: ResolvedTab[]): DashboardState;
export function dashboardReducer(state: DashboardState, action: DashboardAction): DashboardState;
/** The tab's configured order first, then ids added through the gear, in plugin order. */
export function visibleToolbarIds(tab: ResolvedTab, visible: ReadonlySet<string>, toolbarIds: string[]): string[];

// dashboard/Dashboard.tsx
export interface DashboardProps<TRow> {
  config: GridCoreConfig<TRow>;
  /** Plugins that have a ToolbarItem, in config order. Never empty. */
  toolbars: GridPlugin<TRow>[];
  ctx: GridPluginContext<TRow>;
  quickFilterText: string;
  onQuickFilterTextChange: (text: string) => void;
}
export function Dashboard<TRow>(props: DashboardProps<TRow>): JSX.Element;

// plugins/actions/types.ts
export interface ActionsPluginOptions {
  actions: GridActionKind[];
  /** Plugin id, used in config.tabs. Defaults to "actions". Unique per grid. */
  id?: string;
  /** Panel title. Falls back to the id. */
  title?: string;
}

// plugins/layouts/layoutActions.ts
export interface LayoutActions {
  create: (name: string) => string | null;
  update: (id: string, name: string) => string | null;   // captures state (used by Save)
  rename: (id: string, name: string) => string | null;   // name only, keeps state, fires onLayoutUpdate
  remove: (id: string) => string | null;
  apply: (id: string) => string | null;
  applyDefault: () => string | null;
}
```
The DOM hooks the tester can rely on:
- `.gridcore-dashboard` (with `.is-collapsed` when collapsed)
- `[role=tablist]` and `[role=tab][aria-selected]`
- `[role=tabpanel]`
- `section.gridcore-panel[aria-label="<title> toolbar"]`
- the gear button: `aria-label="Dashboard settings"`
- the collapse button: `aria-label="Collapse dashboard"` or `"Expand dashboard"`
- the quick search input: `aria-label="Quick search"`

## Library notes
| Library | Version in use | Note from the docs |
| --- | --- | --- |
| AG Grid | 32.2.0 | `quickFilterText` is a grid option that can be updated after the grid is created. The docs recommend changing it as an `AgGridReact` prop; `api.setGridOption` also works. |
| AG Grid | 32.2.0 | The quick filter splits the text into words; every word must match some column, case-insensitive. Hidden columns are excluded unless `includeHiddenColumnsInQuickFilter` is set. |
| AG Grid | 32.2.0 | `cacheQuickFilter` only helps on large data sets (the docs say about 10,000 rows or more), so it is not needed for 500 rows. |
| AG Grid | 32.2.0 | `exportDataAsCsv` and `exportDataAsExcel` export the filtered, sorted rows by default. `fileName` gets `.csv` or `.xlsx` only when it has no dot (this is already noted in `actionCatalog.ts`). |
| AG Grid | 32.2.0 | The v32 setup does not change: CSS imports, a theme class, and the `ag-grid-enterprise` side-effect import stay in `GridCore.tsx`. |
| React | 18 | `useReducer` and `useSyncExternalStore` are already used by the layouts plugin. No new dependency. |

## User stories
| Id | Story | Covers | Size |
| --- | --- | --- | --- |
| US-01 | As an end user I see a light dashboard above the grid, with a header (title, tabs, search, settings, collapse) and one titled panel per toolbar, so the grid looks like a finished product. | FR-01, FR-02, FR-03, FR-04, FR-06, FR-17 | L |
| US-02 | As a consumer I can define named tabs in config, and as an end user I can switch between them to see each tab's toolbars. | FR-04, FR-05 | S |
| US-03 | As an end user I can hide a toolbar with its × and bring toolbars back with the gear, per tab, so I only see what I use. | FR-07, FR-08, FR-09 | M |
| US-04 | As an end user I can collapse the dashboard to its header to give the grid more room, and expand it again. | FR-10 | S |
| US-05 | As an end user I can type in quick search to filter rows across columns as I type. | FR-11 | S |
| US-06 | As an end user I can export to CSV or Excel from an Export panel, and size columns from a Columns panel. | FR-15, FR-16 | M |
| US-07 | As an end user I can pick, save, save as, rename and delete layouts right in the Layout panel, without a modal. | FR-12, FR-13, FR-14 | L |
| US-08 | As a keyboard or screen reader user I can reach and name every dashboard control. | FR-18 | S |

## Story acceptance criteria
| Id | Story | Given / When / Then |
| --- | --- | --- |
| AC-01 | US-01 | Given `?layouts=off&actions=off`, when the grid renders, then no dashboard (`.gridcore-dashboard`) shows and the grid works as before. |
| AC-02 | US-01 | Given the default demo, when it renders, then the header shows, left to right: title "Trades", tabs, a gap, quick search, settings button, collapse button. |
| AC-03 | US-01 | Given `?title=off`, when it renders, then the header title is `demo-trades`. |
| AC-04 | US-01 | Given `?tabs=off`, when it renders, then exactly one tab, "Toolbars", shows, with the Layout, Export and Columns panels in that order. |
| AC-05 | US-01 | Given the default demo, when it renders, then each panel has a bordered frame, an uppercase title strip reading Layout, Export or Columns, and a × button. |
| AC-06 | US-01 | Given `?titles=off`, when it renders, then the two action panels' title text in the DOM is `export` and `columns` (their plugin ids). |
| AC-07 | US-01 | Given the OS is in dark mode, when the grid renders, then the header is light grey, the panels and the selected tab are white, the selected tab has a blue top line, and the select and search inputs are light. |
| AC-08 | US-02 | Given the demo tabs Trading, Export and All, when it renders, then those three tabs show in that order and one is marked `aria-selected="true"`. |
| AC-09 | US-02 | Given three tabs, when the user clicks "Export", then only the Export panel shows and "Export" is the only tab with `aria-selected="true"`. |
| AC-10 | US-02 | Given the "Trading" tab, when it is selected, then it shows Layout, then Columns. |
| AC-11 | US-03 | Given "Columns" shows on "All" and on "Trading", when the user clicks its × on "All", then it is gone from "All" and still shows on "Trading". |
| AC-12 | US-03 | Given the settings pop-up is open on "All", when the user unticks "Layout", then the Layout panel disappears; when the user ticks it again, then it returns in its original first position. |
| AC-13 | US-03 | Given the settings pop-up is open, when Escape is pressed, then it closes and focus returns to the settings button; when it is open and the user clicks outside it, then it closes. |
| AC-14 | US-03 | Given a tab with every toolbar hidden, when it shows, then the text "No toolbars on this tab. Use the gear to add one." is visible. |
| AC-15 | US-04 | Given the dashboard is expanded, when the user clicks collapse, then only the header shows and the grid grows taller; when the user clicks collapse again, then the panels return. |
| AC-16 | US-04 | Given the dashboard is collapsed, when the user clicks a tab, then the dashboard expands and shows that tab's panels. |
| AC-17 | US-05 | Given 500 rows, when the user types `NVDA` in quick search, then only rows holding NVDA show; when the field is cleared, then all 500 rows show. |
| AC-18 | US-05 | Given 500 rows, when the user types quickly, then there is no visible lag. |
| AC-19 | US-06 | Given the grid is filtered, when the user picks Excel and clicks Export, then `demo-trades.xlsx` downloads with only the filtered rows; with CSV picked, then `demo-trades.csv` downloads. |
| AC-20 | US-06 | Given narrow columns, when the user clicks Auto-size, then the columns widen to fit their content; when the user clicks Fit to width, then the columns fill the grid width. |
| AC-21 | US-07 | Given saved layouts, when the user opens the Layout dropdown, then it lists Default and every saved layout, with the current one selected. |
| AC-22 | US-07 | Given saved layouts, when the user picks one in the dropdown, then the grid changes to that layout, it stays selected, and an `apply` event is logged. |
| AC-23 | US-07 | Given Default is selected, when the Layout panel shows, then Save (and Rename and Delete) are disabled; given a saved layout is selected, when the user clicks Save, then an `update` event is logged for that layout. |
| AC-24 | US-07 | Given any layout, when the user clicks Save as and enters a name that already exists, then the existing error "A layout named "…" already exists." shows; with a new name, then a `create` event is logged and the new layout is selected. |
| AC-25 | US-07 | Given a saved layout is selected, when the user clicks Rename and saves a new name, then the dropdown shows the new name and an `update` event is logged with the new name. |
| AC-26 | US-07 | Given a saved layout is selected, when the user clicks Delete, then an in-grid confirmation appears and no browser dialog opens; when the user confirms, then a `delete` event is logged and the dropdown no longer lists it. |
| AC-27 | US-07 | Given the Layout panel, when the user hovers each icon button, then a tooltip shows: Save, Save as, Rename or Delete. |
| AC-28 | US-08 | Given keyboard only, when the user presses Tab repeatedly, then every tab, the quick search, settings, collapse, each × and every panel control gets focus with a visible ring. |
| AC-29 | US-08 | Given a screen reader, when it reads the icon-only buttons, then each has a name (for example "Dashboard settings", "Collapse dashboard", "Hide Layout", "Save as"), and the tabs are exposed as tabs. |

## Risks
| Risk | What to do about it |
| --- | --- |
| Quick search skips hidden columns. Layout "B" groups by ticker and hides that column, so typing `NVDA` there still matches through the group column but not through the leaf rows' ticker cell. | Test AC-17 on Default. D-06 records the choice. |
| Panel titles are uppercase in CSS, so "export" (the id) and "Export" (a title) look the same on screen. | The tester checks AC-06 against the DOM text, not a screenshot. |
| The settings popover and the layout prompt could sit under the AG Grid header or side bar. | `position: absolute` inside `.gridcore-root` with `z-index: 1000`. Check them over the grid in the browser. |
| A consumer's `agGridOptions.quickFilterText` would be overridden by the shell's prop. | The prop goes after the spread, so the shell wins only when a dashboard shows. Note this in the README. |
| Changing `config.tabs` at runtime does not reset the tab state. | The config is created once at module level, as the existing docs say. Re-initialise only when the number of tabs changes. |
| `?titles=off`, `?title=off` and `?tabs=off` are new demo switches the tester depends on. | Build them together with US-01 and US-02, and list them in the `gridConfig.ts` header comment. |

## Handoff
- Seam: the existing `GridPlugin.ToolbarItem` plus a new optional `toolbarTitle`. The shell lives in `packages/grid-core/src/dashboard/`, and `GridCore.tsx` only mounts it. The FSD Decisions approve this for the shell only.
- Build order: US-01, US-02, US-03, US-04, US-05, US-06, US-07, US-08.
- Build first: the `types.ts` contract (`title`, `tabs`, `toolbarTitle`, `GridCoreTab`), `dashboardModel.ts`, `internal/icons.tsx`, and the shared `gridcore-btn` and `gridcore-select` classes in `dashboard.css`. Every later story uses them.
- US-01 wraps the existing ToolbarItems unchanged. The old "Layout" button and the action buttons just sit inside panels until US-06 and US-07 restyle them.
- Quick search: GridCore state, passed as the `quickFilterText` prop on `<AgGridReact>` after the options spread (v32 docs confirmed through ag-mcp).
- Actions: optional `id` and `title` options; the demo creates `export` and `columns` instances. File names and export calls in `actionCatalog.ts` stay the same.
- Layouts: add a `rename` action (name only, keeps state, fires `onLayoutUpdate`). Save reuses `update(id, currentName)`. Delete `LayoutPopup.tsx` and move `NameForm` and `LayoutActions` into their own files.
- Light theme only: hard-coded tokens plus `color-scheme: light` on `.gridcore-dashboard`. No web font and no new dependency.
- No version bumps, and no AG Grid import outside `packages/grid-core/src`. Verify with `npm run typecheck && npm run build`.
- The tester needs the demo switches `?layouts=off&actions=off`, `?title=off`, `?tabs=off` and `?titles=off`, and should check AC-07 with the OS in dark mode.
