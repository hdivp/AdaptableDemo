# Test report: <feature name>

failing_tasks: <comma-separated task ids, or empty>

## Verify commands
| Command | Result |
| --- | --- |
| <command> | pass or fail, plus the first error line |

## Story verdicts
| Story | Verdict | Failing criteria |
| --- | --- | --- |
| US-01 | PASS | |
| US-02 | FAIL | AC-03 |

## Criteria detail
| Id | Story | Verdict | How it was checked |
| --- | --- | --- | --- |
| AC-01 | US-01 | PASS | <what you ran or read> |
| AC-03 | US-02 | FAIL | <what happened instead> |

## Unverified
| Id | Why it could not be checked | What would prove it |
| --- | --- | --- |

## Handoff
- <at most 10 bullets: the verdict, the failing task ids, the reason for each
  failure, and anything the user must decide>
