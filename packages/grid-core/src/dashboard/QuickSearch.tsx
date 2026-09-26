import { SearchIcon } from "../internal/icons";

export interface QuickSearchProps {
  value: string;
  onChange: (text: string) => void;
}

/** A search box. Controlled: the text lives in `GridCore`. */
export function QuickSearch({ value, onChange }: QuickSearchProps): JSX.Element {
  return (
    <label className="gridcore-quick-search">
      <SearchIcon />
      <input
        type="search"
        placeholder="Quick search"
        aria-label="Quick search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
