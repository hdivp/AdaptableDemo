# Gates

A gate is the point where the router stops and the user decides. There is a gate
after every stage.

## The three outcomes

Offer exactly these, in this order:

1. **approve** - advance to the next stage in the order.
2. **revise** - run the same stage again. Append the user's notes to the artifact
   under `## Decisions`. Keep `stage` unchanged. Do not increment any retry
   counter. A revise is not a failure.
3. **stop** - set `gate: stopped`, leave every artifact on disk, and end. Tell
   the user that starting the flow again with the same feature name resumes it.

Ask the gate as one short question with these choices. Name the artifact path so
the user can open it. Do not paste the artifact into the chat.

## Question rounds

When a role agent reports `status: needs-input`:

- Put its questions to the user. At most 4 at a time, each with the recommended
  default the agent supplied.
- Write the answers into the artifact under `## Decisions`.
- Increment `question_rounds` and run the same agent again.
- At `question_rounds: 2`, stop asking. Tell the agent to proceed on its own
  recommended defaults, and tell the user which defaults were taken.

Reset `question_rounds` to 0 whenever the stage changes.

## Test bounce

The tester puts failing task ids in a `failing_tasks` field, as a plain
comma-separated list.

On a failing test report:

- Set `stage: developer`, increment `retries_developer`, and run the developer
  agent again with only those failing task ids in its prompt.
- Then run the tester again.
- At `retries_developer: 2`, stop. Show the failing task ids and the tester's
  reasons, and ask the user what to do.

## Trust rules

- The developer agent reports only counts. Re-read `04-progress.md` for the
  truth.
- Never mark a stage complete because an agent said it was. Check that the output
  artifact exists and ends with a handoff block.
- If an artifact is missing or truncated, treat the stage as failed and re-run it
  rather than repairing the file yourself.
