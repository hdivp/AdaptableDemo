# grid-AIDLC

A wrapper around AG Grid (`packages/grid-core`), plus a demo app that uses it
(`apps/demo`). See `README.md` for how to run it and how the plugin seam works.

## AG Grid: use the ag-mcp server, not memory

This project is pinned to **AG Grid 32** and **React 18**. AG Grid's current
version is 36, and the API changed a lot in between. Answering from memory
produces v36 code that does not work here.

The official AG Grid MCP server is installed as `ag-mcp`. Use it.

### Always set the version first

`detect_version` fails at the repository root, because the root `package.json`
is a workspace root and holds no AG Grid dependency. Do one of these before
searching:

- call `set_versions` with `version: "32.2.0"` and `framework: "react"`, or
- call `detect_version` with `path: "apps/demo"`.

Then `search_docs` returns v32 React content.

### v32 differences that catch people out

| Topic | v32 (this project) | v36 (what the model remembers) |
| --- | --- | --- |
| Setup | `<AgGridReact>` on its own | wrapped in `<AgGridProvider>` |
| Modules | automatic; importing `ag-grid-enterprise` registers them | a `modules={[...]}` prop |
| Licence | `LicenseManager.setLicenseKey(key)` | a `licenseKey` prop on the provider |
| Theme | a CSS class plus two CSS imports | a `theme` grid option, no CSS imports |
| Column api | gone; use `event.api` only | same |

`packages/grid-core/src/GridCore.tsx` already handles all of the above. Do not
"modernise" it.

## Rules for this repository

- AG Grid is imported **only** inside `packages/grid-core/src`. The demo and any
  real app must not import it.
- New features are `GridPlugin` objects passed in `config.plugins`. Do not add
  feature code to `GridCore.tsx`.
- Do not bump `react`, `ag-grid-*`, `vite`, or `typescript` without being asked.
  The versions are held back on purpose.
- Verify with `npm run typecheck && npm run build` from the repository root.
