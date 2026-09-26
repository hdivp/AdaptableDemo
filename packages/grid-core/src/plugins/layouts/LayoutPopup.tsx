import { useEffect, useState, type FormEvent } from "react";
import type { LayoutStoreSnapshot } from "./layoutStore";

/** What the pop-up can ask the plugin to do. Each returns an error or null. */
export interface LayoutActions {
  create: (name: string) => string | null;
  update: (id: string, name: string) => string | null;
  remove: (id: string) => string | null;
  apply: (id: string) => string | null;
  applyDefault: () => string | null;
}

export interface LayoutPopupProps {
  snapshot: LayoutStoreSnapshot;
  actions: LayoutActions;
  onClose: () => void;
}

interface NameFormProps {
  initialName: string;
  label: string;
  /** Returns an error message to show, or null when saved. */
  onSave: (name: string) => string | null;
  onCancel: () => void;
}

/** An inline name field with Save / Cancel and a validation message. */
function NameForm({ initialName, label, onSave, onCancel }: NameFormProps): JSX.Element {
  const [name, setName] = useState(initialName);
  const [message, setMessage] = useState<string | null>(null);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setMessage(onSave(name));
  };

  return (
    <form className="gridcore-layouts-form" onSubmit={submit}>
      <input
        className="gridcore-layouts-input"
        aria-label={label}
        value={name}
        autoFocus
        onChange={(event) => {
          setName(event.target.value);
          setMessage(null);
        }}
      />
      <button type="submit">Save</button>
      <button type="button" onClick={onCancel}>
        Cancel
      </button>
      {message && (
        <p className="gridcore-layouts-message" role="alert">
          {message}
        </p>
      )}
    </form>
  );
}

function CurrentMarker(): JSX.Element {
  return <span className="gridcore-layouts-current"> (current)</span>;
}

/** The layout list, shown as a modal panel over the grid. */
export function LayoutPopup({ snapshot, actions, onClose }: LayoutPopupProps): JSX.Element {
  const [creating, setCreating] = useState(false);

  // Escape closes it, wherever focus is.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  // Row actions only fail if the grid or the layout went away underneath.
  const [error, setError] = useState<string | null>(null);
  const report = (result: string | null) => setError(result);

  // At most one layout is being updated or deleted at a time.
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const update = (id: string, name: string) => {
    const error = actions.update(id, name);
    if (error === null) {
      setUpdatingId(null);
    }
    return error;
  };

  const create = (name: string) => {
    const error = actions.create(name);
    if (error === null) {
      setCreating(false);
    }
    return error;
  };

  return (
    <div className="gridcore-layouts-backdrop" onClick={onClose}>
      <div
        className="gridcore-layouts-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Layouts"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="gridcore-layouts-header">
          <h2 className="gridcore-layouts-title">Layouts</h2>
          <button type="button" className="gridcore-layouts-close" onClick={onClose}>
            Close
          </button>
        </div>
        <ul className="gridcore-layouts-list">
          <li className="gridcore-layouts-row">
            <span className="gridcore-layouts-name">
              Default layout
              {snapshot.currentId === null && <CurrentMarker />}
            </span>
            <button type="button" onClick={() => report(actions.applyDefault())}>
              Apply
            </button>
          </li>
          {snapshot.layouts.map((layout) => (
            <li key={layout.id} className="gridcore-layouts-row">
              <span className="gridcore-layouts-name">
                {layout.name}
                {snapshot.currentId === layout.id && <CurrentMarker />}
              </span>
              <button type="button" onClick={() => report(actions.apply(layout.id))}>
                Apply
              </button>
              <button
                type="button"
                onClick={() => {
                  setDeletingId(null);
                  setUpdatingId(layout.id);
                }}
              >
                Update
              </button>
              <button
                type="button"
                onClick={() => {
                  setUpdatingId(null);
                  setDeletingId(layout.id);
                }}
              >
                Delete
              </button>
              {updatingId === layout.id && (
                <NameForm
                  initialName={layout.name}
                  label={`New name for ${layout.name}`}
                  onSave={(name) => update(layout.id, name)}
                  onCancel={() => setUpdatingId(null)}
                />
              )}
              {deletingId === layout.id && (
                <div className="gridcore-layouts-confirm" role="group">
                  <span>Delete {layout.name}?</span>
                  <button type="button" onClick={() => report(actions.remove(layout.id))}>
                    Confirm
                  </button>
                  <button type="button" onClick={() => setDeletingId(null)}>
                    Cancel
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
        {error && (
          <p className="gridcore-layouts-message" role="alert">
            {error}
          </p>
        )}
        <div className="gridcore-layouts-create">
          {creating ? (
            <NameForm
              initialName=""
              label="New layout name"
              onSave={create}
              onCancel={() => setCreating(false)}
            />
          ) : (
            <button type="button" onClick={() => setCreating(true)}>
              Create new
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
