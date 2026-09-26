# Project memory

`.aidlc/decisions.md` holds durable, cross-feature conventions - the kind of
thing the architect or quickplan stage would otherwise re-discover, or the user
would otherwise re-answer, on every new feature. It is project-wide, not
per-feature, so it lives directly under `.aidlc/`, next to the feature folders,
not inside one of them.

## Who writes it

The router only, matching the rule that the router is the only writer of
`00-state.yaml`. Role agents never touch this file directly. A role agent that
finds a durable convention records it in its own artifact instead, under
`## Reusable decisions`, and the router copies it out.

## Where it comes from

`02-architecture.md` and the quickplan version of `03-plan.md` may carry a
`## Reusable decisions` section - separate from the feature-specific
`## Design decisions` / `## Decisions` sections. It holds only conventions that
would still be true on a different feature: a coding pattern, a rule the
codebase enforces, a library quirk, a decision the user made that clearly
generalises. It does not hold anything specific to the feature that produced
it.

## When the router updates it

At the router's own "Finishing" step, when a stage becomes `done`:

1. Read the `## Reusable decisions` section of that feature's
   `02-architecture.md` or `03-plan.md`, if present.
2. For each line, skip it if `.aidlc/decisions.md` already has a line that
   means the same thing.
3. Otherwise append it as `- <date> <slug>: <the line>`.

Do this once, at `done`, not on every gate. A feature that stops before `done`
never writes to project memory.

## Who reads it

The architect and quickplan stages, at the very start of their work, alongside
`conventions_file`. Every line in it is settled - treated exactly like an
existing `## Decisions` section. Never re-derived, never re-asked.

## Keeping it small

Target size: 150 lines, excluding the header paragraph. This file is read on
every architect and quickplan run, so its cost is paid every time - keep it
worth paying.

When appending a new entry would push the file past 150 lines, the router does
a merge pass first, before appending:

- Combine entries that state the same convention in different words into one
  line. Keep the earliest date. List every contributing slug, comma-separated.
- Drop any entry a later entry has reversed; keep only the newer one.
- If the file is still over 150 lines after merging, drop the oldest remaining
  entries until it is at 120 lines.

A merge pass is a router edit like any other. It is still the only writer.
