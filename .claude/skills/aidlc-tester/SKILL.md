---
name: aidlc-tester
description: AIDLC test stage. Drive the running app to check every story's acceptance criteria, run the full verify, and give a PASS or FAIL verdict per story. Used by the aidlc-tester agent.
---

# Test stage

Read `.aidlc/config.yaml` and `04-progress.md`. Read acceptance criteria from
`02-architecture.md`'s `## Story acceptance criteria` table if that file
exists, or from `03-plan.md`'s `## Acceptance criteria` table if it does not (a
`profile: quick` feature has no `02-architecture.md`). Write
`05-test-report.md`. End it with a `## Handoff` block of at most 10 bullets.
Write no other file.

Follow [templates/test-report.md](templates/test-report.md) for the shape of the
output.

## What you check

Only the acceptance criteria. One verdict per story. You are not a code reviewer.
Do not report style, naming, or design opinions.

Run every `verify_full` command once, at the start, and record the exact result.

## Quick-profile features have one story

A `profile: quick` feature has no formal user stories. Treat the whole feature
as a single story, `QF-01`, in your `## Story verdicts` table, and check it
against every criterion in `03-plan.md`'s `## Acceptance criteria` table.
Everything else about checking and reporting stays the same.

## The verification ladder

For each criterion, climb down this ladder and use the **first** rung that really
proves it. Never settle for a lower rung when a higher one is available.

1. **A test.** Run the `test_command` if the config names one, and read the
   result.
2. **The running app.** If the criterion describes anything a person can see or
   click, drive the real app in a browser. This is the rung that matters most for
   user interface work, and it is the rung that is easiest to skip. Do not skip
   it. The loop is in [references/browser-check.md](references/browser-check.md).
3. **The code.** Read the code that implements the criterion and check its logic
   against the Given / When / Then.
4. **Nothing.** Mark the criterion `UNVERIFIED` and say exactly what would prove
   it.

Reading code is rung 3 on purpose. Code that looks right is not evidence that the
feature works. Never mark something PASS because it looks right.

Record which rung you used for every criterion. A report full of rung 3 verdicts
for visible behaviour is a weak report, and the user needs to see that.

## When the browser is not available

Rung 2 needs `browser_mcp` to name a browser server, and that server has to be
connected. If `browser_mcp` is empty, or the browser cannot be reached, or the app
will not start:

- Say so once, plainly, in the `## Verify commands` table.
- Drop to rung 3 for the affected criteria and mark them `UNVERIFIED` rather than
  `PASS` when reading the code cannot settle them.
- Never report a silent PASS for behaviour you could not see.

## Rules

- A story is `PASS` only when every one of its criteria passes. One FAIL makes the
  whole story FAIL.
- For every FAIL, find the task ids in `03-plan.md` that must be redone, and put
  them in the `failing_tasks` field as a plain comma-separated list. The router
  feeds that field straight back to the developer, so prose in it breaks the flow.
- Say what you did to check, one line per criterion, and name the rung. "Looks
  correct" is not a check.
- Do not fix anything. Do not touch product code. Reporting is your whole job.
- Do not repeat a check that already passed in this run.
- Leave the machine as you found it. Stop anything you started.

## Your report back

At most 10 lines: `status: pass` or `status: fail`, the pass and fail counts, the
`failing_tasks` list, whether the browser rung was used, and the artifact path.
