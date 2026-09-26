import type { GridLayout, GridLayoutId } from "@grid-aidlc/core";

/**
 * A stand-in for the consumer's database. It lives in a module variable only,
 * so a page reload starts again from the seed list. The wrapper itself never
 * stores anything; this file is where a real app would call its server.
 */

const seedLayouts: GridLayout[] = [
  {
    id: "layout-a",
    name: "A: Buys by P&L",
    state: {
      version: 1,
      columnState: [
        { colId: "ticker", pinned: "left", width: 140, hide: false },
        { colId: "pnl", sort: "desc", sortIndex: 0, width: 170, hide: false },
        { colId: "id", hide: true },
      ],
      filterModel: {
        side: { filterType: "text", type: "equals", filter: "Buy" },
      },
      pivotMode: false,
    },
  },
  {
    // Saved before a "desk" column was removed from the grid. Applying it must
    // still work, quietly, for the columns that remain.
    id: "layout-b",
    name: "B: Grouped by ticker",
    state: {
      version: 1,
      columnState: [
        { colId: "ticker", rowGroup: true, rowGroupIndex: 0, hide: true },
        { colId: "desk", width: 150, sort: "asc", sortIndex: 1 },
        { colId: "quantity", aggFunc: "sum" },
        { colId: "pnl", aggFunc: "sum", sort: "desc", sortIndex: 0 },
      ],
      filterModel: {
        desk: { filterType: "text", type: "equals", filter: "Rates" },
        settled: { filterType: "set", values: ["true"] },
      },
      pivotMode: false,
    },
  },
];

/** What "Replace layouts from server" sends to the wrapper. */
export const replacementLayouts: GridLayout[] = [
  {
    id: "layout-c",
    name: "C: From server",
    state: {
      version: 1,
      columnState: [{ colId: "price", sort: "asc", sortIndex: 0 }],
      filterModel: {},
      pivotMode: false,
    },
  },
];

let savedLayouts: GridLayout[] = [...seedLayouts];

/** The list the demo passes to the wrapper at bind time. */
export function getSavedLayouts(): GridLayout[] {
  return [...savedLayouts];
}

export interface LayoutEvent {
  seq: number;
  kind: "create" | "update" | "delete" | "apply";
  payload: GridLayout | GridLayoutId;
}

let events: LayoutEvent[] = [];
const eventListeners = new Set<() => void>();

function logEvent(kind: LayoutEvent["kind"], payload: LayoutEvent["payload"]): void {
  events = [...events, { seq: events.length + 1, kind, payload }];
  for (const listener of eventListeners) {
    listener();
  }
}

/** Every consumer callback received so far. Stable between events. */
export function getLayoutEvents(): readonly LayoutEvent[] {
  return events;
}

export function subscribeLayoutEvents(listener: () => void): () => void {
  eventListeners.add(listener);
  return () => {
    eventListeners.delete(listener);
  };
}

/** The consumer callbacks: write to the list, and log what arrived. */
export const layoutHandlers = {
  onLayoutCreate(layout: GridLayout): void {
    savedLayouts = [...savedLayouts, layout];
    logEvent("create", layout);
  },
  onLayoutUpdate(layout: GridLayout): void {
    savedLayouts = savedLayouts.map((item) => (item.id === layout.id ? layout : item));
    logEvent("update", layout);
  },
  onLayoutDelete(id: string): void {
    savedLayouts = savedLayouts.filter((item) => item.id !== id);
    logEvent("delete", id);
  },
  onLayoutApply(id: GridLayoutId): void {
    logEvent("apply", id);
  },
};
