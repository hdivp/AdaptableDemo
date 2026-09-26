| Task | Status | Files | Verify | Note |
| --- | --- | --- | --- | --- |
| T-01 | DONE | packages/grid-core/src/plugins/actions/types.ts | typecheck pass | Contract's `createActionsPlugin` signature left to T-04's file; types.ts holds the three types only. |
| T-02 | DONE | packages/grid-core/src/plugins/actions/actionCatalog.ts | typecheck pass | ag-mcp not reachable from this session; confirmed instead from installed v32.2 sources: `exportDataAsExcel(params?: ExcelExportParams)` exists; `BaseCreator.getFileName` appends `.csv`/`.xlsx` only if `fileName` has no "." (demo `gridId` "demo-trades" is fine). Labels taken from FSD. |
| T-03 | DONE | packages/grid-core/src/plugins/actions/ActionsToolbarItem.tsx | typecheck pass | Stateless; plain `<button type="button">`, no CSS class (D-05). |
| T-04 | DONE | packages/grid-core/src/plugins/actions/createActionsPlugin.ts | typecheck pass | Plugin sets only `id: "actions"` and `ToolbarItem`. |
| T-05 | DONE | packages/grid-core/src/plugins/actions/index.ts, packages/grid-core/src/index.ts | typecheck pass | Import path is `@grid-aidlc/core`. |
| T-06 | DONE | apps/demo/src/gridConfig.ts | typecheck pass | Plan left the list open; chose `["fitColumns", "autosizeColumns", "exportCsv", "exportExcel"]` so every action and AC-02's order are checkable. Module-level `plugins` array; `?layouts=off` now drops only layouts, `?layouts=off&actions=off` gives no plugins (AC-01). Build/dev not run (verify_full is the tester's). |
| T-07 | SKIPPED | | static checks pass | Verification only. AC-04 search: no AG Grid import outside packages/grid-core (src, plus its dist output). AC-01..03 by reading code: GridCore renders toolbar items in `config.plugins` order and hides the toolbar when none. Browser render and `npm run build` left to tester. |
| T-08 | SKIPPED | | | Browser-only check (AC-05, AC-06); no browser in this stage, left to tester. |
| T-09 | SKIPPED | | | Browser-only check (AC-07, AC-08); no browser in this stage, left to tester. Expect AG Grid trial watermark in the .xlsx (out of scope). |
| T-10 | SKIPPED | | | Browser-only check (AC-09); no browser in this stage, left to tester. |
| T-11 | SKIPPED | | | Browser-only check (AC-10); no browser in this stage, left to tester. Demo's `autoSizeStrategy: fitGridWidth` already fits on load, so narrow a column by hand first. |
