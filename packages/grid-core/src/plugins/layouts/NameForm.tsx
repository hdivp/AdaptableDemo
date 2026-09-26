import { useState, type FormEvent } from "react";

export interface NameFormProps {
  initialName: string;
  label: string;
  /** Returns an error message to show, or null when saved. */
  onSave: (name: string) => string | null;
  onCancel: () => void;
}

/** An inline name field with Save / Cancel and a validation message. */
export function NameForm({ initialName, label, onSave, onCancel }: NameFormProps): JSX.Element {
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
