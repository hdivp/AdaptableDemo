import type { GridCoreTab } from "../types";

/** Name of the one tab shown when the config defines none. */
export const FALLBACK_TAB_NAME = "Toolbars";

/** A tab whose toolbar ids are known and de-duplicated. */
export interface ResolvedTab {
  name: string;
  toolbars: string[];
}

export interface DashboardState {
  activeTab: number;
  collapsed: boolean;
  /** Visible toolbar ids for each tab, by tab index. */
  visible: ReadonlySet<string>[];
}

export type DashboardAction =
  /** Also expands the dashboard. */
  | { type: "selectTab"; index: number }
  | { type: "toggleCollapsed" }
  /** Current tab only. */
  | { type: "hide"; id: string }
  /** Current tab only. */
  | { type: "show"; id: string };

/**
 * The tabs to show. Absent or empty tabs give one "Toolbars" tab with every
 * toolbar in plugin order. Otherwise each tab keeps only the ids of toolbars
 * that exist, first occurrence wins.
 */
export function resolveTabs(
  tabs: GridCoreTab[] | undefined,
  toolbarIds: string[],
): ResolvedTab[] {
  if (!tabs || tabs.length === 0) {
    return [{ name: FALLBACK_TAB_NAME, toolbars: [...toolbarIds] }];
  }
  const known = new Set(toolbarIds);
  return tabs.map((tab) => ({
    name: tab.name,
    toolbars: [...new Set(tab.toolbars)].filter((id) => known.has(id)),
  }));
}

/** First tab selected, expanded, every tab showing its configured toolbars. */
export function initialDashboardState(tabs: ResolvedTab[]): DashboardState {
  return {
    activeTab: 0,
    collapsed: false,
    visible: tabs.map((tab) => new Set(tab.toolbars)),
  };
}

function withVisible(
  state: DashboardState,
  change: (current: Set<string>) => void,
): DashboardState {
  const current = state.visible[state.activeTab];
  if (!current) {
    return state;
  }
  const next = new Set(current);
  change(next);
  const visible = [...state.visible];
  visible[state.activeTab] = next;
  return { ...state, visible };
}

export function dashboardReducer(
  state: DashboardState,
  action: DashboardAction,
): DashboardState {
  switch (action.type) {
    case "selectTab":
      if (action.index < 0 || action.index >= state.visible.length) {
        return state;
      }
      return { ...state, activeTab: action.index, collapsed: false };
    case "toggleCollapsed":
      return { ...state, collapsed: !state.collapsed };
    case "hide":
      return withVisible(state, (set) => set.delete(action.id));
    case "show":
      return withVisible(state, (set) => set.add(action.id));
  }
}

/**
 * The toolbars to render on a tab: its configured order first, then any added
 * through the settings pop-up, in plugin order.
 */
export function visibleToolbarIds(
  tab: ResolvedTab,
  visible: ReadonlySet<string>,
  toolbarIds: string[],
): string[] {
  const configured = new Set(tab.toolbars);
  return [
    ...tab.toolbars.filter((id) => visible.has(id)),
    ...toolbarIds.filter((id) => !configured.has(id) && visible.has(id)),
  ];
}
