import {
  useCallback,
  useState,
  useSyncExternalStore,
  type ComponentType,
} from "react";
import type { GridPluginContext } from "../../types";
import { LayoutPopup, type LayoutActions } from "./LayoutPopup";
import type { LayoutStore } from "./layoutStore";
import "./layouts.css";

/**
 * Build the toolbar control for one plugin instance. `ToolbarItem` is only
 * handed `ctx`, so the store and the actions are closed over here.
 */
export function createLayoutToolbarItem<TRow>(
  store: LayoutStore,
  actions: LayoutActions,
): ComponentType<{ ctx: GridPluginContext<TRow> }> {
  function LayoutToolbarItem(): JSX.Element {
    const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot);
    const [open, setOpen] = useState(false);
    const close = useCallback(() => setOpen(false), []);

    return (
      <>
        <button
          type="button"
          className="gridcore-layouts-button"
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          Layout
        </button>
        {open && <LayoutPopup snapshot={snapshot} actions={actions} onClose={close} />}
      </>
    );
  }
  return LayoutToolbarItem;
}
