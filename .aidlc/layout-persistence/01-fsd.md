# FSD: Layout persistence

## Summary
Grid users can save, apply, update (including rename), delete and reset named layouts from a Layout pop-up on a toolbar above the grid.
The wrapper never stores layouts itself; the consumer supplies the list at bind time and persists changes from the events the wrapper emits.

## Users and triggers
| Who | When they do it |
| --- | --- |
| Consumer (developer embedding the wrapper) | Binds the grid, passes the saved layouts and optionally an initial layout id; listens to layout events to write them to its DB; may later pass a new list |
| End user | Clicks the Layout button in the toolbar and creates, updates, renames, applies, deletes a layout, or returns to the default layout |

## Functional requirements
| Id | Requirement | Pass condition |
| --- | --- | --- |
| FR-01 | The feature is opt-in: a grid bound without it enabled shows no toolbar and behaves as today. | Demo grid without the feature shows no toolbar; typecheck and build pass. |
| FR-02 | When enabled, a toolbar appears above the grid containing a "Layout" button. | Toolbar with a button labelled "Layout" is visible directly above the grid. |
| FR-03 | Clicking the Layout button opens a pop-up; it can be closed without side effects. | Pop-up opens on click; closing it changes no grid state and emits no event. |
| FR-04 | The consumer can pass a list of saved layouts when binding the grid. | Layouts passed at bind time are listed by name in the pop-up. |
| FR-05 | The pop-up lists every layout in the wrapper's current list by name, plus a "Default layout" entry. | Pop-up shows N named rows for N layouts and one Default entry. |
| FR-06 | A layout captures full column state (width, visibility, order, pinning, sort, row grouping, aggregation, pivot), the filter model and pivot mode. | Set every listed property, create a layout, reset to Default, apply it; every property is restored. |
| FR-07 | A layout does not capture scroll position, row selection or expanded/collapsed group rows. | Apply a layout after scrolling, selecting rows and expanding groups; those three are not changed by the apply. |
| FR-08 | "Create new" asks for a name and captures the current grid state as a new layout. | After create, the new name appears in the list at once and a create event is emitted. |
| FR-09 | The wrapper generates the id of a newly created layout; it is unique within the current list. | Create event payload carries a non-empty id not used by any other listed layout. |
| FR-10 | "Update" overwrites a selected layout's state with the current grid state, keeping its id. | After update, an update event carries the same id and the current state. |
| FR-11 | "Update" lets the user change the layout's name in the same action. | Update "Q1" with name "Q2"; list shows "Q2" not "Q1"; update event carries the same id and name "Q2". |
| FR-12 | "Apply" sets the grid to the selected layout's state. | Every FR-06 property matches the layout after apply. |
| FR-13 | "Delete" removes the selected layout from the list after the user confirms. | After confirm, the name is gone from the list at once and a delete event is emitted; cancelling changes nothing. |
| FR-14 | "Default layout" returns the grid to the column definitions as bound, even if an initial layout was applied at bind. | Change state, click Default; grid matches the bound column definitions; no persistence event is emitted. |
| FR-15 | The Default layout cannot be updated, renamed or deleted. | Update and Delete are unavailable for the Default entry. |
| FR-16 | The wrapper emits an event for each of create, update, delete, carrying the layout data. | A consumer listener receives one event per action with the payload in the Data section. |
| FR-17 | The wrapper emits an event when a layout (or Default) is applied by the user. | A consumer listener receives the applied layout id, or a marker meaning Default. |
| FR-18 | The wrapper does not write layouts to any storage (no localStorage, no network). | Reloading the page shows only the layouts the consumer passes in. |
| FR-19 | Layout names must be non-empty after trimming and unique among the listed layouts (case-insensitive), ignoring the layout being renamed. | Create or rename with an empty or duplicate name is refused with a visible message and no event. |
| FR-20 | The pop-up shows which layout is currently applied, or Default. | After applying layout X, X is marked as current in the pop-up. |
| FR-21 | A stored layout referring to a column that no longer exists still applies; unknown columns are ignored. | Apply a layout containing a removed column id; the grid applies the rest and shows no error. |
| FR-22 | The consumer may pass an optional initial layout id at bind; the grid starts in that layout. | Bind with the id of "Q1"; grid first renders with Q1's state and Q1 is marked current. |
| FR-23 | If the initial layout id is absent or not in the list, the grid starts in Default without error. | Bind with an unknown id; grid shows the bound column definitions, Default is marked current, no error. |
| FR-24 | The wrapper's list reflects create, update and delete immediately, without waiting for the consumer. | After each action the pop-up list changes before the consumer passes any new list. |
| FR-25 | When the consumer passes a new list after bind, it replaces the wrapper's list entirely. | Pass a new list [C]; pop-up shows only C plus Default, whatever was created earlier. |
| FR-26 | The feature is delivered as a GridPlugin and the demo/app never imports AG Grid (CLAUDE.md rules). | Demo enables it through `config.plugins`; no AG Grid import outside `packages/grid-core/src`. |

## Acceptance criteria
| Id | Covers | Given / When / Then |
| --- | --- | --- |
| AC-01 | FR-01 | Given a grid bound without the layout feature, when it renders, then no toolbar is shown. |
| AC-02 | FR-02, FR-03 | Given the feature is enabled, when the user clicks "Layout", then a pop-up opens listing layouts. |
| AC-03 | FR-03 | Given the pop-up is open, when the user closes it, then grid state is unchanged and no event fires. |
| AC-04 | FR-04, FR-05 | Given the consumer passes layouts A and B, when the pop-up opens, then A, B and "Default layout" are listed. |
| AC-05 | FR-04, FR-05 | Given the consumer passes an empty list, when the pop-up opens, then only "Default layout" is listed. |
| AC-06 | FR-08, FR-09, FR-16, FR-24 | Given the user has grouped and sorted the grid, when they create layout "Q1", then "Q1" is listed at once and a create event carries a new unique id, its name and state. |
| AC-07 | FR-19 | Given layout "Q1" exists, when the user creates another named "q1" or "  ", then it is refused with a message and no event fires. |
| AC-08 | FR-10, FR-16 | Given layout "Q1" exists, when the user changes filters and updates "Q1", then an update event carries Q1's id and the new state. |
| AC-09 | FR-11, FR-24 | Given layout "Q1" exists, when the user updates it with name "Q2", then the list shows "Q2" and the update event carries Q1's id and name "Q2". |
| AC-10 | FR-11, FR-19 | Given layouts "Q1" and "Q2" exist, when the user renames "Q1" to "q2", then it is refused with a message and no event fires. |
| AC-11 | FR-06, FR-12, FR-17 | Given layout "Q1" with widths, hidden columns, order, pinning, sort, grouping, aggregation, pivot, filters and pivot mode set, when the user applies it, then all match "Q1" and an apply event carries Q1's id. |
| AC-12 | FR-07 | Given the grid is scrolled with rows selected and groups expanded, when a layout is applied, then scroll, selection and expansion are not taken from the layout. |
| AC-13 | FR-13, FR-16, FR-24 | Given layout "Q1" exists, when the user deletes it and confirms, then "Q1" leaves the list at once and a delete event carries its id. |
| AC-14 | FR-13 | Given the delete confirmation is showing, when the user cancels, then "Q1" stays and no event fires. |
| AC-15 | FR-14, FR-17 | Given the grid was bound with initial layout "Q1", when the user clicks "Default layout", then the grid shows the bound column definitions and an apply event carries the Default marker. |
| AC-16 | FR-15 | Given the pop-up is open, when the user looks at the Default entry, then Update and Delete are not offered for it. |
| AC-17 | FR-20 | Given the user applied "Q1", when they reopen the pop-up, then "Q1" is marked as current. |
| AC-18 | FR-21 | Given a layout references a column no longer in the grid, when it is applied, then the remaining state applies and no error is thrown. |
| AC-19 | FR-18 | Given the user created a layout, when the page reloads and the consumer passes its original list, then the new layout is absent. |
| AC-20 | FR-22 | Given the consumer binds with initial layout id of "Q1", when the grid first renders, then Q1's state is shown and Q1 is marked current. |
| AC-21 | FR-23 | Given the consumer binds with an id not in the list, when the grid renders, then it shows the Default state, Default is marked current and no error is thrown. |
| AC-22 | FR-25 | Given the user created "Q1", when the consumer then passes the list [C], then the pop-up lists only C and "Default layout". |

## Data
| Field | Type | Rule |
| --- | --- | --- |
| id | string | Unique within the list; stable across updates and renames. Generated by the wrapper on create; supplied by the consumer for passed-in layouts. |
| name | string | Required; trimmed non-empty; unique case-insensitive within the list. |
| state | object | Full column state (width, visibility, order, pinning, sort, row grouping, aggregation, pivot), filter model, pivot mode. Opaque to the consumer; must survive a JSON round-trip. |
| Bind input: layouts | layout[] | The saved layouts; may be empty. A later new list replaces the wrapper's list. |
| Bind input: initial layout id | string, optional | If absent or not in the list, the grid starts in Default. |
| Create event payload | layout | Full layout (wrapper-generated id, name, state). |
| Update event payload | layout | Full layout with the existing id, possibly a new name, and the current state. |
| Delete event payload | id | Id of the removed layout. |
| Apply event payload | id or Default marker | Id of applied layout, or a value meaning Default. |

## Out of scope
- Storing layouts anywhere inside the wrapper (DB, localStorage, server calls).
- Sharing layouts between users, permissions, or per-user ownership.
- Import / export of layouts to files.
- Scroll position, row selection, cell focus and expanded/collapsed group rows.
- Auto-save or an "unsaved changes" indicator.
- Undo of delete after confirmation.
- Merging a consumer-passed list with the wrapper's list; the new list simply replaces it.
- Toolbar buttons other than "Layout".
- Changes to `GridCore.tsx` beyond what the existing plugin seam allows; version bumps of react, ag-grid, vite or typescript.

## Non-functional
| Id | Requirement | Limit |
| --- | --- | --- |
| NF-01 | Verification must pass. | `npm run typecheck && npm run build` exit 0. |
| NF-02 | Layout state must be serialisable. | `JSON.parse(JSON.stringify(state))` applies identically. |
| NF-03 | No limit on layout count, name length or apply time is set by the brief. | None stated; not to be invented. |

## Source brief

I want to build a functionality into the wrapper. I want it to be able to persist layouts.
In a layout it will save:
- grouping
- filtering
- sorting
- column order
- pinning
- any other available property

When the consumer binds the grid it will also provide details of layouts.
The wrapper will use the list to show them to the user. The user can then apply, delete, or update the layouts.
The user can create new layouts too.
The consumer has the responsibility to persist layouts in a DB.
The wrapper will only emit events and data for save, update, delete etc. so that the consumer may take action.
Make the UI just like how Adaptable gives it - a toolbar on top of the grid where the user can click on a Layout button and a pop-up opens.
The user can see the layouts in the pop-up and perform the following actions:
- create new
- update existing
- apply
- delete
- and also a button for the default layout (on this, the grid will go to its original state with which it was bound)

## Decisions
- OQ-1: Full column state (width, visibility, order, pinning, sort, row grouping, aggregation, pivot) plus filter model and pivot mode; exclude scroll, selection, expanded groups.
- OQ-2: Yes, an optional initial layout id; if absent or unknown the grid starts in Default, and Default always means the column definitions as bound.
- OQ-3: Yes, update may change the name and always overwrites state with the current grid state.
- OQ-4: Wrapper updates its list immediately and generates the id for new layouts; if the consumer later passes a new list, that list replaces the wrapper's.

## Handoff
- Opt-in GridPlugin via `config.plugins`: toolbar above the grid, a "Layout" button, a pop-up listing layouts plus Default.
- Actions: create, update (with optional rename), apply, delete (with confirm), Default (reset to bound column definitions).
- Layout state = full column state + filter model + pivot mode; never scroll, selection or group expansion.
- Wrapper stores nothing; emits create/update/delete/apply events with the Data payloads; generates ids on create.
- Wrapper list updates immediately; a later consumer-passed list replaces it wholesale. Optional initial layout id at bind; unknown id falls back to Default.
- AG Grid imports stay inside `packages/grid-core/src`; no feature code in `GridCore.tsx`.
- AG Grid 32 + React 18: use ag-mcp at version 32.2.0 for column state / filter model / pivot mode APIs, not memory.
- Unknown columns in a stored layout are ignored on apply; state must survive a JSON round-trip.
- Assumed: names unique case-insensitive; Default cannot be updated or deleted; if a replacing list drops the current layout, the grid state stays and the current marker is the architect's call.
- No test command exists; verification is typecheck and build only.
