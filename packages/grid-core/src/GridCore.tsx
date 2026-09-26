// AG Grid v32 needs its stylesheets imported by hand. Importing the enterprise
// package for its side effect is what registers every enterprise module; there
// is no ModuleRegistry call to make in v32.
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import "ag-grid-enterprise";
import "./GridCore.css";

import type { GridApi, GridReadyEvent } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { applyLicence } from "./internal/licence";
import { buildGridOptions } from "./internal/buildGridOptions";
import { foldGridOptions, startPlugins } from "./internal/runPlugins";
import type { GridCoreProps, GridPluginContext } from "./types";

const NO_PLUGINS: never[] = [];

/**
 * The wrapper. Give it rows and a config, and it renders an AG Grid.
 *
 * Higher level features are not built into this component. They arrive as
 * plugins on `config.plugins`, so this file stays small.
 */
export function GridCore<TRow>({
  data,
  config,
  loading = false,
  onGridReady,
  className,
}: GridCoreProps<TRow>): JSX.Element {
  const plugins = config.plugins ?? NO_PLUGINS;
  const themeClass = config.themeClass ?? "ag-theme-quartz";
  const height = config.height ?? "100%";

  // Must happen before the grid is created, so do it during render.
  applyLicence(config.licenseKey);

  const gridOptions = useMemo(
    () => foldGridOptions(buildGridOptions(data, config), config, plugins),
    [data, config, plugins],
  );

  // Held in state, not a ref, so the toolbar re-renders once the api exists.
  const [api, setApi] = useState<GridApi<TRow> | null>(null);
  const stopPluginsRef = useRef<(() => void) | null>(null);

  const handleGridReady = useCallback(
    (event: GridReadyEvent<TRow>) => {
      setApi(event.api);
      const ctx: GridPluginContext<TRow> = {
        gridId: config.gridId,
        api: event.api,
        config,
      };
      stopPluginsRef.current = startPlugins(ctx, plugins);
      onGridReady?.(event.api);
    },
    [config, plugins, onGridReady],
  );

  // Let every plugin undo its work when the grid goes away.
  useEffect(
    () => () => {
      stopPluginsRef.current?.();
      stopPluginsRef.current = null;
    },
    [],
  );

  const toolbarItems = plugins.filter((plugin) => plugin.ToolbarItem);
  const showToolbar = api !== null && toolbarItems.length > 0;

  return (
    <div className={className ? `gridcore-root ${className}` : "gridcore-root"}>
      {showToolbar && (
        <div className="gridcore-toolbar">
          {toolbarItems.map((plugin) => {
            const ToolbarItem = plugin.ToolbarItem!;
            return (
              <ToolbarItem
                key={plugin.id}
                ctx={{ gridId: config.gridId, api: api!, config }}
              />
            );
          })}
        </div>
      )}
      <div className={`gridcore-viewport ${themeClass}`} style={{ height }}>
        <AgGridReact<TRow> {...gridOptions} onGridReady={handleGridReady} />
      </div>
      {loading && <div className="gridcore-overlay">Loading…</div>}
    </div>
  );
}
