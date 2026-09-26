# grid-AIDLC

A wrapper around AG Grid, plus a demo app that uses it.

The wrapper is where higher level features live: saved layouts, conditional
formatting, and more later. None of those are built yet. What is built is the
shell and the seam they plug into.

## The two projects

| Path | Package | What it is |
| --- | --- | --- |
| `packages/grid-core` | `@grid-aidlc/core` | The library. It owns AG Grid. |
| `apps/demo` | `@grid-aidlc/demo` | An app that uses the library. |

The demo imports `@grid-aidlc/core` and nothing from AG Grid. That is the point:
an application says what it wants, and the wrapper deals with AG Grid.

## Run it

```bash
npm install
npm run dev          # demo on http://localhost:5173
```

Other scripts, all from the repository root:

```bash
npm run typecheck    # both projects
npm run build:core   # library only -> packages/grid-core/dist
npm run build        # library, then the demo
npm run clean        # remove both dist folders
```

While `npm run dev` is running, editing a file in `packages/grid-core/src`
reloads the demo straight away. There is no rebuild step, because the demo's
Vite config aliases `@grid-aidlc/core` to the library source.

## Versions

| Package | Range |
| --- | --- |
| `react`, `react-dom` | `^18.2.0` |
| `ag-grid-community`, `ag-grid-react`, `ag-grid-enterprise` | `^32.2.0` |
| `vite` | `^5.4.0` |
| `typescript` | `^5.6.0` |

Vite 5 and TypeScript 5 are held back on purpose, to match React 18 and
AG Grid 32.

AG Grid 32 is the older API, so three things differ from the current docs:

1. There is no `AgGridProvider`. Use `<AgGridReact>` on its own.
2. There is no `ModuleRegistry` call to make. Importing `ag-grid-enterprise`
   registers every Enterprise module by itself.
3. There is no `theme` grid option. The theme is a CSS class, and the two
   stylesheets must be imported by hand. `GridCore.tsx` does both.

### Enterprise licence

No key is set, so the grid runs in **trial mode**. AG Grid logs a licence error
and may draw a watermark. That is expected.

To add a key, pass it in the config. Do not hard code it in source:

```ts
const config: GridCoreConfig<Trade> = {
  gridId: "trades",
  licenseKey: import.meta.env.VITE_AG_GRID_LICENSE_KEY,
  columns: [...],
};
```

## Using the wrapper

```tsx
import { GridCore, type GridCoreConfig } from "@grid-aidlc/core";

interface Trade { id: string; ticker: string; quantity: number; }

const config: GridCoreConfig<Trade> = {
  gridId: "trades",       // stable id; features use it as a storage key
  rowIdField: "id",
  columns: [
    { field: "id", headerName: "Trade ID", width: 130 },
    { field: "ticker" },
    { field: "quantity", dataType: "number" },
  ],
};

<GridCore data={rows} config={config} />
```

`dataType` picks sensible AG Grid defaults: the filter, the cell data type, and
right alignment for numbers. `headerName` defaults to a title-cased `field`.

Two escape hatches exist, and both are merged last so the caller always wins:

- `column.agColDef` — raw AG Grid column options.
- `config.agGridOptions` — raw AG Grid grid options. The demo uses this for
  `autoSizeStrategy`.

## Adding a feature later

Do not add feature code to `GridCore.tsx`. Write a `GridPlugin` and pass it in
`config.plugins`. A plugin has three optional hooks:

```ts
const myFeature: GridPlugin<Trade> = {
  id: "my-feature",

  // 1. Change the grid options before the grid is created.
  applyGridOptions: (options, config) => ({ ...options, /* ... */ }),

  // 2. Run once the grid api exists. Return a cleanup function.
  onGridReady: (ctx) => {
    ctx.api.applyColumnState(/* ... */);
    return () => { /* undo */ };
  },

  // 3. Render a control in the wrapper toolbar.
  ToolbarItem: ({ ctx }) => <button onClick={() => ctx.api.sizeColumnsToFit()}>Fit</button>,
};
```

Plugins run in array order. Each one sees the previous plugin's grid options.
Cleanups run in reverse order when the grid goes away.

That shape covers the planned work:

- **Conditional formatting** uses `applyGridOptions`, to inject `cellClassRules`
  and `cellStyle`.
- **Saved layouts** uses `onGridReady` to push column state through the api,
  plus a `ToolbarItem` for the layout picker.

The toolbar only appears when at least one plugin supplies a `ToolbarItem`.

## Source map

```
packages/grid-core/src/
├── index.ts                        the only public surface
├── types.ts                        GridCoreConfig, GridCoreColumn, GridPlugin
├── GridCore.tsx                    the component; AG Grid lives here
├── GridCore.css                    shell layout only
└── internal/
    ├── licence.ts                  setLicenseKey, at most once
    ├── buildGridOptions.ts         our config -> AG Grid options (pure)
    └── runPlugins.ts               the plugin pipeline
```

`buildGridOptions` is pure and exported, so it can be tested without a browser.

## The AIDLC flow

Features in this repository are built with a five stage pipeline: requirements,
architecture, planning, development, test. It stops and asks you to approve after
every stage. Everything it produces lands in `.aidlc/<feature-slug>/`.

| Editor | How to start |
| --- | --- |
| Claude Code | `/aidlc <feature name>` |
| VS Code Copilot | pick **aidlc** in the Agent dropdown, then type the feature name |

Both read the same files. The pipeline lives in `.claude/skills/aidlc*` and
`.claude/agents/aidlc-*`, its only project-specific file is `.aidlc/config.yaml`,
and `.aidlc/PORTING.md` explains what each editor needs.
