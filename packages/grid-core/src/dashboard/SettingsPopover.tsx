import { useEffect, useId, useRef, type RefObject } from "react";

export interface SettingsItem {
  id: string;
  title: string;
  /** Shown on the current tab. */
  checked: boolean;
}

export interface SettingsPopoverProps {
  /** Name of the current tab. */
  tabName: string;
  /** Every toolbar, in plugin order. */
  items: SettingsItem[];
  onShow: (id: string) => void;
  onHide: (id: string) => void;
  onClose: () => void;
  /** The button that opened it. Gets focus back on Escape; clicks on it are not "outside". */
  anchorRef: RefObject<HTMLElement>;
}

/**
 * Which toolbars show on the current tab, as a list of checkboxes. Closes on
 * Escape or on a mousedown outside it.
 */
export function SettingsPopover({
  tabName,
  items,
  onShow,
  onHide,
  onClose,
  anchorRef,
}: SettingsPopoverProps): JSX.Element {
  const rootRef = useRef<HTMLDivElement>(null);
  const headingId = useId();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        anchorRef.current?.focus();
      }
    };
    const onMouseDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || anchorRef.current?.contains(target)) {
        return;
      }
      onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onMouseDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onMouseDown);
    };
  }, [onClose, anchorRef]);

  return (
    <div ref={rootRef} className="gridcore-popover" role="dialog" aria-labelledby={headingId}>
      <h3 id={headingId}>Toolbars on this tab</h3>
      <p>Pick what shows under “{tabName}”.</p>
      {items.map((item) => (
        <label key={item.id}>
          <input
            type="checkbox"
            checked={item.checked}
            onChange={(event) => (event.target.checked ? onShow(item.id) : onHide(item.id))}
          />
          {item.title}
        </label>
      ))}
    </div>
  );
}
