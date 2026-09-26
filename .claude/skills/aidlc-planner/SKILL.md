---
name: aidlc-planner
description: AIDLC planning stage. Split approved user stories into ordered, single-sitting developer tasks, each with file paths and a done condition. Used by the aidlc-planner agent.
---

# Planning stage

Read `02-architecture.md` and `.aidlc/config.yaml`. Write `03-plan.md`. End it
with a `## Handoff` block of at most 10 bullets. Write no other file.

Follow [templates/plan.md](templates/plan.md) for the shape of the output.

## Read only what you need

Read in this order, and stop as soon as you have enough:

1. The `## Handoff` block at the end of `02-architecture.md`.
2. The `## User stories`, `## Story acceptance criteria`, and `## Files` tables.
3. The rest of that file, only if a story is still unclear.

Do not read `01-fsd.md`. The architect already traced the requirements into the
stories. Tracing them again costs tokens and buys nothing.

## What a good task looks like

- One sitting. If a task needs more than roughly an hour of focused work, split
  it.
- Touches as few files as possible, and names every file it touches.
- Has a done condition anybody can check, which is not "the code compiles".
- Belongs to exactly one story. If a task serves two stories, it is really two
  tasks, or it is a shared task that must come first.

## Rules

- Task ids are `T-01`, `T-02`, and so on, in build order.
- Order by dependency first, then by risk. Put the task that proves the approach
  first, so a wrong approach shows up on task one instead of task nine.
- Mark each task's dependencies by id. Leave the column empty when there are none.
- Every story must be fully covered by its tasks, and every task must name its
  story. Fill in the coverage table to prove it.
- Add one last task per story that exercises its acceptance criteria, unless the
  earlier tasks already do.
- No task may change a pinned dependency version.
- Plan no refactor the architecture did not ask for.

## Asking the user

You can, but you usually should not. Sequencing and splitting are your job. Ask
only when two orderings would give the user visibly different things working
first. At most 4 questions, each with a `(recommended: ...)` default, then report
`status: needs-input`.

A `## Decisions` section is settled. Never re-ask it.

## Your report back

At most 10 lines: `status`, the task count, the id of the first task, and the
artifact path.
