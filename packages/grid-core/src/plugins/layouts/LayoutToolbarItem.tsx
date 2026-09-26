import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ComponentType,
} from "react";
import { EditIcon, PlusIcon, SaveIcon, TrashIcon } from "../../internal/icons";
import type { GridPluginContext } from "../../types";
import type { LayoutActions } from "./layoutActions";
import { LayoutPrompt, type LayoutPromptMode } from "./LayoutPrompt";
import type { LayoutStore } from "./layoutStore";
import "./layouts.css";

/** Select values for the two entries that are not saved layouts. */
const DEFAULT_VALUE = "__gridcore-default__";
const NONE_VALUE = "";

/**
 * Build the toolbar control for one plugin instance: a layout select, then
 * Save, Save as, Rename and Delete. `ToolbarItem` is only handed `ctx`, so the
 * store and the actions are closed over here.
 */
export function createLayoutToolbarItem<TRow>(
  store: LayoutStore,
  actions: LayoutActions,
): ComponentType<{ ctx: GridPluginContext<TRow> }> {
  function LayoutToolbarItem(): JSX.Element {
    const { layouts, currentId } = useSyncExternalStore(store.subscribe, store.getSnapshot);
    // Actions only fail if the grid or the layout went away underneath.
    const [error, setError] = useState<string | null>(null);
    const [prompt, setPrompt] = useState<LayoutPromptMode | null>(null);
    const [opener, setOpener] = useState<HTMLButtonElement | null>(null);
    const selectRef = useRef<HTMLSelectElement>(null);

    const current =
      typeof currentId === "string" ? layouts.find((item) => item.id === currentId) : undefined;
    const value =
      currentId === null ? DEFAULT_VALUE : current ? current.id : NONE_VALUE;

    // A second click on the same button closes its prompt.
    const open = (mode: LayoutPromptMode, button: HTMLButtonElement) => {
      if (prompt?.kind === mode.kind) {
        setPrompt(null);
        return;
      }
      setError(null);
      setOpener(button);
      setPrompt(mode);
    };

    const [focusBack, setFocusBack] = useState(false);

    const close = useCallback((restoreFocus: boolean) => {
      setPrompt(null);
      setFocusBack(restoreFocus);
    }, []);

    // After the render that closed the prompt, so a Delete that just disabled
    // its own button is seen. Fall back to the select in that case.
    useEffect(() => {
      if (!focusBack) {
        return;
      }
      setFocusBack(false);
      if (opener && !opener.disabled && opener.isConnected) {
        opener.focus();
      } else {
        selectRef.current?.focus();
      }
    }, [focusBack, opener]);

    return (
      <>
        <select
          ref={selectRef}
          className="gridcore-select"
          aria-label="Current layout"
          value={value}
          onChange={(event) => {
            const next = event.target.value;
            setError(next === DEFAULT_VALUE ? actions.applyDefault() : actions.apply(next));
          }}
        >
          {value === NONE_VALUE && (
            <option value={NONE_VALUE} disabled>
              Select a layout
            </option>
          )}
          <option value={DEFAULT_VALUE}>Default</option>
          {layouts.map((layout) => (
            <option key={layout.id} value={layout.id}>
              {layout.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="gridcore-btn gridcore-btn--icon"
          title="Save"
          aria-label="Save"
          disabled={!current}
          onClick={() => current && setError(actions.update(current.id, current.name))}
        >
          <SaveIcon />
        </button>
        <button
          type="button"
          className="gridcore-btn gridcore-btn--icon"
          title="Save as"
          aria-label="Save as"
          aria-haspopup="dialog"
          aria-expanded={prompt?.kind === "saveAs"}
          onClick={(event) => open({ kind: "saveAs" }, event.currentTarget)}
        >
          <PlusIcon />
        </button>
        <button
          type="button"
          className="gridcore-btn gridcore-btn--icon"
          title="Rename"
          aria-label="Rename"
          aria-haspopup="dialog"
          aria-expanded={prompt?.kind === "rename"}
          disabled={!current}
          onClick={(event) =>
            current && open({ kind: "rename", id: current.id, name: current.name }, event.currentTarget)
          }
        >
          <EditIcon />
        </button>
        <button
          type="button"
          className="gridcore-btn gridcore-btn--icon"
          title="Delete"
          aria-label="Delete"
          aria-haspopup="dialog"
          aria-expanded={prompt?.kind === "delete"}
          disabled={!current}
          onClick={(event) =>
            current && open({ kind: "delete", id: current.id, name: current.name }, event.currentTarget)
          }
        >
          <TrashIcon />
        </button>
        {error && (
          <p className="gridcore-layouts-message" role="alert">
            {error}
          </p>
        )}
        {prompt && (
          <LayoutPrompt
            // A new prompt starts fresh, even when one was already open.
            key={prompt.kind}
            mode={prompt}
            actions={actions}
            onClose={close}
            anchor={opener}
          />
        )}
      </>
    );
  }
  return LayoutToolbarItem;
}
