import { useEffect, useRef, useState } from "react";
import type { LayoutActions } from "./layoutActions";
import { NameForm } from "./NameForm";

/** What the prompt is asking for. */
export type LayoutPromptMode =
  | { kind: "saveAs" }
  | { kind: "rename"; id: string; name: string }
  | { kind: "delete"; id: string; name: string };

export interface LayoutPromptProps {
  mode: LayoutPromptMode;
  actions: LayoutActions;
  /** Close it. `restoreFocus` is true when focus should go back to the opener. */
  onClose: (restoreFocus: boolean) => void;
  /** The button that opened it. A mousedown on it is not "outside". */
  anchor: HTMLElement | null;
}

const LABELS: Record<LayoutPromptMode["kind"], string> = {
  saveAs: "Save layout as",
  rename: "Rename layout",
  delete: "Delete layout",
};

/**
 * A small pop-up under the Layout panel: a name form for Save as and Rename,
 * or a Delete / Cancel confirmation. No browser `prompt` or `confirm`. Closes
 * on Escape or on a mousedown outside it.
 */
export function LayoutPrompt({ mode, actions, onClose, anchor }: LayoutPromptProps): JSX.Element {
  const rootRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose(true);
      }
    };
    const onMouseDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || anchor?.contains(target)) {
        return;
      }
      onClose(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onMouseDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onMouseDown);
    };
  }, [onClose, anchor]);

  // Close only when the action worked; otherwise the form shows the error.
  const closeOnSuccess = (result: string | null) => {
    if (result === null) {
      onClose(true);
    }
    return result;
  };

  return (
    <div ref={rootRef} className="gridcore-layout-prompt" role="dialog" aria-label={LABELS[mode.kind]}>
      {mode.kind === "saveAs" && (
        <NameForm
          initialName=""
          label="New layout name"
          onSave={(name) => closeOnSuccess(actions.create(name))}
          onCancel={() => onClose(true)}
        />
      )}
      {mode.kind === "rename" && (
        <NameForm
          initialName={mode.name}
          label={`New name for ${mode.name}`}
          onSave={(name) => closeOnSuccess(actions.rename(mode.id, name))}
          onCancel={() => onClose(true)}
        />
      )}
      {mode.kind === "delete" && (
        <div className="gridcore-layouts-confirm" role="group">
          <span>Delete {mode.name}?</span>
          <button
            type="button"
            className="gridcore-btn gridcore-btn--primary"
            onClick={() => setError(closeOnSuccess(actions.remove(mode.id)))}
          >
            Delete
          </button>
          <button type="button" className="gridcore-btn" autoFocus onClick={() => onClose(true)}>
            Cancel
          </button>
          {error && (
            <p className="gridcore-layouts-message" role="alert">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
