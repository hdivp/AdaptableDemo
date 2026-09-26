/*
 * Small inline SVG icons for the dashboard and its panels. Every icon is
 * decorative (`aria-hidden`); the button that holds it carries the name.
 * They draw in `currentColor`, so they follow the button's text colour.
 */

interface IconProps {
  /** Width and height in pixels. */
  size?: number;
}

function strokeProps(size: number, strokeWidth: number) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 16 16",
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    "aria-hidden": true,
    focusable: false,
  } as const;
}

export function GridIcon({ size = 16 }: IconProps): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" aria-hidden focusable={false}>
      <rect x="1" y="1" width="6" height="6" rx="1" />
      <rect x="9" y="1" width="6" height="6" rx="1" />
      <rect x="1" y="9" width="6" height="6" rx="1" />
      <rect x="9" y="9" width="6" height="6" rx="1" />
    </svg>
  );
}

export function SearchIcon({ size = 14 }: IconProps): JSX.Element {
  return (
    <svg {...strokeProps(size, 1.6)}>
      <circle cx="7" cy="7" r="5" />
      <path d="M11 11l4 4" />
    </svg>
  );
}

export function GearIcon({ size = 16 }: IconProps): JSX.Element {
  return (
    <svg {...strokeProps(size, 1.4)}>
      <circle cx="8" cy="8" r="2.2" />
      <path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M3.4 12.6l1.4-1.4M11.2 4.8l1.4-1.4" />
    </svg>
  );
}

/** Points up by default; `down` flips it. */
export function ChevronIcon({ size = 16, down = false }: IconProps & { down?: boolean }): JSX.Element {
  return (
    <svg {...strokeProps(size, 1.6)}>
      <path d={down ? "M4 6l4 4 4-4" : "M4 10l4-4 4 4"} />
    </svg>
  );
}

export function XIcon({ size = 10 }: IconProps): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden focusable={false}>
      <path d="M2 2l6 6M8 2L2 8" />
    </svg>
  );
}

export function SaveIcon({ size = 14 }: IconProps): JSX.Element {
  return (
    <svg {...strokeProps(size, 1.4)}>
      <path d="M3 2h8l2 2v10H3z" />
      <path d="M5 2v4h5V2M5 14V9h6v5" />
    </svg>
  );
}

export function PlusIcon({ size = 14 }: IconProps): JSX.Element {
  return (
    <svg {...strokeProps(size, 1.6)}>
      <path d="M8 3v10M3 8h10" />
    </svg>
  );
}

export function EditIcon({ size = 14 }: IconProps): JSX.Element {
  return (
    <svg {...strokeProps(size, 1.4)}>
      <path d="M10.5 2.5l3 3L6 13H3v-3z" />
    </svg>
  );
}

export function TrashIcon({ size = 14 }: IconProps): JSX.Element {
  return (
    <svg {...strokeProps(size, 1.4)}>
      <path d="M3 4h10M6 4V2.5h4V4M4.5 4l.7 9.5h5.6l.7-9.5" />
    </svg>
  );
}

export function DownloadIcon({ size = 14 }: IconProps): JSX.Element {
  return (
    <svg {...strokeProps(size, 1.5)}>
      <path d="M8 2v8M4.5 6.5L8 10l3.5-3.5M2.5 13.5h11" />
    </svg>
  );
}

export function AutoSizeIcon({ size = 14 }: IconProps): JSX.Element {
  return (
    <svg {...strokeProps(size, 1.4)}>
      <path d="M2 3v10M14 3v10M5 8h6M5 8l2-2M5 8l2 2M11 8l-2-2M11 8l-2 2" />
    </svg>
  );
}

export function FitIcon({ size = 14 }: IconProps): JSX.Element {
  return (
    <svg {...strokeProps(size, 1.4)}>
      <rect x="2" y="4" width="12" height="8" rx="1" />
      <path d="M6 4v8M10 4v8" />
    </svg>
  );
}
