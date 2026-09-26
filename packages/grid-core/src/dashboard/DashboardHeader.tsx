import { useCallback, useRef, useState } from "react";
import { ChevronIcon, GearIcon, GridIcon } from "../internal/icons";
import type { ResolvedTab } from "./dashboardModel";
import { QuickSearch } from "./QuickSearch";
import { SettingsPopover, type SettingsItem } from "./SettingsPopover";

export interface DashboardHeaderProps {
  title: string;
  /** Small muted text after the title, or nothing. */
  subtitle?: string;
  tabs: ResolvedTab[];
  activeTab: number;
  collapsed: boolean;
  /** Prefix for the tab and tab panel element ids. */
  idPrefix: string;
  onSelectTab: (index: number) => void;
  onToggleCollapsed: () => void;
  quickFilterText: string;
  onQuickFilterTextChange: (text: string) => void;
  /** Every toolbar, ticked when it shows on the current tab. */
  settingsItems: SettingsItem[];
  onShowToolbar: (id: string) => void;
  onHideToolbar: (id: string) => void;
}

export function tabId(idPrefix: string, index: number): string {
  return `${idPrefix}-tab-${index}`;
}

export function tabPanelId(idPrefix: string): string {
  return `${idPrefix}-panel`;
}

/** Title, tabs, then quick search, settings and collapse on the right. */
export function DashboardHeader({
  title,
  subtitle,
  tabs,
  activeTab,
  collapsed,
  idPrefix,
  onSelectTab,
  onToggleCollapsed,
  quickFilterText,
  onQuickFilterTextChange,
  settingsItems,
  onShowToolbar,
  onHideToolbar,
}: DashboardHeaderProps): JSX.Element {
  const gearRef = useRef<HTMLButtonElement>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const closeSettings = useCallback(() => setSettingsOpen(false), []);
  const collapseLabel = collapsed ? "Expand dashboard" : "Collapse dashboard";

  return (
    <div className="gridcore-dashboard-head">
      <div className="gridcore-dashboard-brand">
        <GridIcon />
        <span className="gridcore-dashboard-title">{title}</span>
        {subtitle && <small>{subtitle}</small>}
      </div>
      <div className="gridcore-dashboard-tabs" role="tablist" aria-label="Toolbar tabs">
        {tabs.map((tab, index) => {
          const selected = index === activeTab;
          return (
            <button
              key={index}
              id={tabId(idPrefix, index)}
              type="button"
              role="tab"
              // Every tab is a Tab stop, so the Tab key alone reaches each one.
              tabIndex={0}
              className="gridcore-dashboard-tab"
              aria-selected={selected}
              aria-controls={selected && !collapsed ? tabPanelId(idPrefix) : undefined}
              onClick={() => onSelectTab(index)}
            >
              {tab.name}
            </button>
          );
        })}
      </div>
      <div className="gridcore-dashboard-spacer" />
      <div className="gridcore-dashboard-tools">
        <QuickSearch value={quickFilterText} onChange={onQuickFilterTextChange} />
        <span className="gridcore-dashboard-vsep" aria-hidden="true" />
        <span className="gridcore-popover-anchor">
          <button
            ref={gearRef}
            type="button"
            className="gridcore-dashboard-ibtn"
            aria-label="Dashboard settings"
            title="Dashboard settings"
            aria-haspopup="dialog"
            aria-expanded={settingsOpen}
            onClick={() => setSettingsOpen((open) => !open)}
          >
            <GearIcon />
          </button>
          {settingsOpen && (
            <SettingsPopover
              tabName={tabs[activeTab]?.name ?? ""}
              items={settingsItems}
              onShow={onShowToolbar}
              onHide={onHideToolbar}
              onClose={closeSettings}
              anchorRef={gearRef}
            />
          )}
        </span>
        <button
          type="button"
          className="gridcore-dashboard-ibtn"
          aria-label={collapseLabel}
          title={collapseLabel}
          aria-expanded={!collapsed}
          onClick={onToggleCollapsed}
        >
          <ChevronIcon down={collapsed} />
        </button>
      </div>
    </div>
  );
}
