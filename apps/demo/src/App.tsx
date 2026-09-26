import { GridCore } from "@grid-aidlc/core";
import { useMemo, useSyncExternalStore } from "react";
import "./App.css";
import { generateTrades } from "./data/trades";
import { tradeGridConfig, tradeLayouts } from "./gridConfig";
import {
  getLayoutEvents,
  replacementLayouts,
  subscribeLayoutEvents,
  type LayoutEvent,
} from "./layoutsDb";

/** One line per event: the ids and names, not the whole state. */
function describe(event: LayoutEvent): string {
  const { payload } = event;
  if (payload === null || typeof payload === "string") {
    return `id=${JSON.stringify(payload)}`;
  }
  return `id=${JSON.stringify(payload.id)} name=${JSON.stringify(payload.name)}`;
}

export default function App(): JSX.Element {
  const trades = useMemo(() => generateTrades(500), []);
  const events = useSyncExternalStore(subscribeLayoutEvents, getLayoutEvents);

  return (
    <div className="app">
      <header className="app-header">
        <h1>grid-core demo</h1>
        <p>
          {trades.length} rows, {tradeGridConfig.columns.length} columns, bound
          through the wrapper.
        </p>
        <button
          type="button"
          className="app-button"
          onClick={() => tradeLayouts.setLayouts(replacementLayouts)}
        >
          Replace layouts from server
        </button>
      </header>
      <div className="app-grid">
        <GridCore data={trades} config={tradeGridConfig} />
      </div>
      <section className="app-events" aria-label="Layout events">
        <h2>Layout events received</h2>
        {events.length === 0 ? (
          <p className="app-events-empty">None yet.</p>
        ) : (
          <ol className="app-events-list">
            {events.map((event) => (
              <li key={event.seq} data-kind={event.kind}>
                <strong>{event.kind}</strong> <code>{describe(event)}</code>
                {typeof event.payload === "object" && event.payload !== null && (
                  <details>
                    <summary>payload</summary>
                    <pre>{JSON.stringify(event.payload, null, 2)}</pre>
                  </details>
                )}
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
