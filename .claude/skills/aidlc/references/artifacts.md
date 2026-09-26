# Artifacts and state

Everything for one feature lives in `.aidlc/<slug>/`.

| File | Written by | Read by |
| --- | --- | --- |
| `00-state.yaml` | the router only | the router |
| `01-fsd.md` | requirements | architect |
| `02-architecture.md` | architect | planner, tester |
| `03-plan.md` | planner (`profile: full`) / quickplan (`profile: quick`) | developer, tester |
| `04-progress.md` | developer, append only | router, tester |
| `05-test-report.md` | tester | router, developer on a bounce |

For a `profile: quick` feature, `01-fsd.md` and `02-architecture.md` do not
exist. The quickplan stage writes `03-plan.md` directly from a brief the router
seeded into it, and that file carries its own `## Acceptance criteria` section
since there is no `02-architecture.md` to hold one.

One writer per file, per feature. A role agent writes only its own output
artifact. Which agent that is can depend on the feature's `profile` -
`03-plan.md` is written by the planner in a `full` feature and by quickplan in a
`quick` feature, never both in the same feature. If a role agent dies part way
through, the state file is still true, because only the router ever wrote it.

## The state file

`00-state.yaml` is flat `key: value` only. No nesting. No lists. It is read as
plain text and rewritten whole, so creative formatting breaks it.

```
feature: Saved layouts
slug: saved-layouts
stage: architect
gate: awaiting-approval
profile: full
question_rounds: 0
retries_developer: 0
fsd_source: docs/FSD.md
updated: 2026-09-26
```

Allowed `stage` values: `requirements`, `architect`, `quickplan`, `planner`,
`developer`, `tester`, `done`.

Allowed `gate` values: `running`, `needs-input`, `awaiting-approval`, `stopped`,
`closed`.

Allowed `profile` values: `full`, `quick`. Missing means `full` - features
created before this key existed. For a `profile: quick` feature, `fsd_source` is
`none`.

There is deliberately no `next_agent` key. The stage order lives in the router
skill and nowhere else. Two sources of truth would drift.

## The handoff block

Every artifact ends with this, and nothing comes after it:

```
## Handoff
- <at most 10 bullets>
```

The next stage reads the handoff block first, and reads the rest of the artifact
only if the handoff block is not enough. This is the main reason the flow stays
cheap.

## Open questions and decisions

A role agent that needs a human decision adds this section before the handoff
block:

```
## Open questions
- Q1: <question> (recommended: <default>)
```

The router turns the answers into a `## Decisions` section in the same file:

```
## Decisions
- Q1: <the answer the user chose>
```

A re-run agent treats `## Decisions` as settled and never asks the same question
twice.

## Reusable decisions

The architect and the quickplan stage may add one more section, separate from
`## Decisions` above:

```
## Reusable decisions
- <a convention that would still be true on a different feature>
```

Only put something here if it would still be true on a different feature. A
one-off answer specific to this feature goes in `## Decisions`, not here. The
router copies these lines into the project-wide `.aidlc/decisions.md` at the
Finishing step; see
[references/project-memory.md](references/project-memory.md).
