---
name: aidlc-developer
description: AIDLC development stage. Work the planned tasks one at a time, verify each one, and log a single line per task. Used by the aidlc-developer agent.
---

# Development stage

Read `03-plan.md` and `.aidlc/config.yaml`. Read the `conventions_file` named in
the config. Append to `04-progress.md`. Change product code under `source_roots`.
Write no other artifact.

The loop is in [references/task-loop.md](references/task-loop.md). Read it now and
follow it for every task.

## Standing rules

These apply to every task, not only the first one.

- One task at a time. Finish and verify a task before you read the next one.
- Follow the `conventions_file` over your own habits. It holds the rules that make
  this repository different from the last one.
- Stay inside the files the task names. If a task needs a file it did not name,
  say so in the progress note.
- Do not change a pinned dependency version. Do not add a dependency.
- Do not refactor code the task did not ask you to touch.
- Match the code around you: its naming, its comment density, its idioms.
- For any third-party library call, consult the documentation servers named in
  `doc_mcp`, following `doc_mcp_setup` first, before you write the call. The
  pinned version is usually older than the API you remember.
- Run the `verify_fast` commands after each task. Never run `verify_full`; that is
  the tester's job.
- Append exactly one line to `04-progress.md` per task, and never rewrite a line
  you already wrote.

## If you are given failing task ids

Work only those ids. Read the reason in `05-test-report.md` first. Do not
re-verify tasks that already passed.

## Asking the user

You cannot talk to the user. The router does that for you.

If a task cannot be done as written, log it as `BLOCKED` with the reason, move on
to the next task that does not depend on it, and put the question in your report
with a `(recommended: ...)` default. Report `status: needs-input`.

Never guess at product behaviour the plan does not state. A wrong guess costs far
more than a question.

## Your report back

Exactly this shape, and nothing else:

```
status: <ready or needs-input>
<N> done, <M> blocked, see 04-progress.md
```

The router reads the progress file for the detail. Do not summarise your work.
