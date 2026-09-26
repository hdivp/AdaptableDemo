# The task loop

For each task, in plan order:

1. Read that task's row in `03-plan.md`. Read only that row.
2. Read the files the row names. Read nothing else unless the change needs it.
3. Make the change.
4. Run the `verify_fast` commands from the config. If a library call is involved
   and it fails, check the library documentation server before you change the call
   again.
5. Fix what you broke. Never leave a failing type check for the next task.
6. Append one line to `04-progress.md`.
7. Move to the next task.

## The progress line

Append only. One line per task. Never edit a line you already wrote.

Create the file with this header the first time:

```
| Task | Status | Files | Verify | Note |
| --- | --- | --- | --- | --- |
```

Then one row per task:

```
| T-01 | DONE | src/a.ts, src/b.ts | typecheck pass | |
| T-02 | BLOCKED | | | needs the sort order decision |
```

Allowed status words: `DONE`, `BLOCKED`, `SKIPPED`.

## Stop conditions

Stop and report early when any of these is true:

- The same verify command fails three times in a row. Log `BLOCKED` and report.
- A task needs a new dependency or a version bump. Both are forbidden here.
- More than half the remaining tasks are blocked by the same missing decision.

Stopping early with a clear reason is cheaper than grinding.
