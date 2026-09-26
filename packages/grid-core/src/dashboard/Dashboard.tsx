import { useId, useMemo, useReducer } from "react";
import type { GridCoreConfig, GridPlugin, GridPluginContext } from "../types";
import {
  dashboardReducer,
  initialDashboardState,
  resolveTabs,
  visibleToolbarIds,
  type ResolvedTab,
} from "./dashboardModel";
import { DashboardHeader, tabId, tabPanelId } from "./DashboardHeader";
import { ToolbarPanel, toolbarTitleOf } from "./ToolbarPanel";
import "./dashboard.css";

export interface DashboardProps<TRow> {
  config: GridCoreConfig<TRow>;
  /** Plugins that have a ToolbarItem, in config order. Never empty. */
  toolbars: GridPlugin<TRow>[];
  ctx: GridPluginContext<TRow>;
  quickFilterText: string;
  onQuickFilterTextChange: (text: string) => void;
}

interface DashboardViewProps<TRow> extends DashboardProps<TRow> {
  tabs: ResolvedTab[];
  toolbarIds: string[];
}

/**
 * The dashboard above the grid: a header with tabs, then one panel per
 * visible toolbar on the selected tab. Its state lives here, in memory only.
 */
export function Dashboard<TRow>(props: DashboardProps<TRow>): JSX.Element {
  const { config, toolbars } = props;
  const toolbarIds = useMemo(() => toolbars.map((plugin) => plugin.id), [toolbars]);
  const tabs = useMemo(() => resolveTabs(config.tabs, toolbarIds), [config.tabs, toolbarIds]);
  // The config is meant to be created once. Start over only if the number of
  // tabs changes, so the state never points at a tab that is gone.
  return <DashboardView key={tabs.length} {...props} tabs={tabs} toolbarIds={toolbarIds} />;
}

function DashboardView<TRow>({
  config,
  toolbars,
  ctx,
  quickFilterText,
  onQuickFilterTextChange,
  tabs,
  toolbarIds,
}: DashboardViewProps<TRow>): JSX.Element {
  const idPrefix = useId();
  const [state, dispatch] = useReducer(dashboardReducer, tabs, initialDashboardState);
  const { activeTab } = state;

  const byId = new Map(toolbars.map((plugin) => [plugin.id, plugin]));
  const visible = state.visible[activeTab];
  const shown = visibleToolbarIds(tabs[activeTab], visible, toolbarIds);
  const settingsItems = toolbars.map((plugin) => ({
    id: plugin.id,
    title: toolbarTitleOf(plugin as GridPlugin<unknown>),
    checked: visible.has(plugin.id),
  }));

  return (
    <div className={state.collapsed ? "gridcore-dashboard is-collapsed" : "gridcore-dashboard"}>
      <DashboardHeader
        title={config.title ?? config.gridId}
        subtitle={config.title ? config.gridId : undefined}
        tabs={tabs}
        activeTab={activeTab}
        collapsed={state.collapsed}
        idPrefix={idPrefix}
        onSelectTab={(index) => dispatch({ type: "selectTab", index })}
        onToggleCollapsed={() => dispatch({ type: "toggleCollapsed" })}
        quickFilterText={quickFilterText}
        onQuickFilterTextChange={onQuickFilterTextChange}
        settingsItems={settingsItems}
        onShowToolbar={(id) => dispatch({ type: "show", id })}
        onHideToolbar={(id) => dispatch({ type: "hide", id })}
      />
      {/* Collapsed: only the header. The panels unmount; plugin state lives in their stores. */}
      {!state.collapsed && (
        <div
          className="gridcore-dashboard-body"
          role="tabpanel"
          id={tabPanelId(idPrefix)}
          aria-labelledby={tabId(idPrefix, activeTab)}
        >
          {shown.length === 0 ? (
            <p className="gridcore-dashboard-empty">
              No toolbars on this tab. Use the gear to add one.
            </p>
          ) : (
            shown.map((id) => (
              <ToolbarPanel
                key={id}
                plugin={byId.get(id)!}
                ctx={ctx}
                onHide={() => dispatch({ type: "hide", id })}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
