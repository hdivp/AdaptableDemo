---
name: aidlc-architect
description: AIDLC architecture stage. Fit a feature to the existing codebase and split it into user stories with acceptance criteria. Used by the aidlc-architect agent.
---

# Architecture stage

Read `01-fsd.md` and `.aidlc/config.yaml`. Read the `conventions_file` named in
the config. Write `02-architecture.md`. End it with a `## Handoff` block of at
most 10 bullets. Write no other file.

Follow [templates/architecture.md](templates/architecture.md) for the shape of
the output.

## Learn the codebase before you design

Do these in order, and stop as soon as you know enough.

1. Read the `conventions_file`. It usually already names the extension seam you
   are meant to use, the pinned version of every library, and the things you must
   not change. Obey it over your own instincts.
2. Look at the existing code under `source_roots` for the pattern this feature
   should copy. Name the real file you are copying.
3. For every third-party library involved, consult the documentation servers named
   in `doc_mcp`, following `doc_mcp_setup` first. Do this before you write any
   library-specific design. Library APIs change between major versions, and a
   remembered API shape is usually from a newer version than the one pinned here.

Never invent a new mechanism when the repository already has a seam for this kind
of feature. Extending the existing seam is the right answer almost every time.

## Rules

- Name the files to add and the files to change, with real paths. No new
  top-level folder unless the conventions file allows it.
- Do not change a pinned dependency version. Do not add a dependency without
  raising it as an open question first.
- Record each real decision as one row in `## Design decisions`: the choice, the reason, and the option you
  rejected.
- Every story gets an id `US-01`, `US-02`, and so on, and must trace back to at
  least one `FR-xx`. A requirement with no story is a bug in your output.
- A story is a slice the user can see working, not a layer. "Save a layout" is a
  story. "Add the state type" is not.
- Give every story its own acceptance criteria, copied or narrowed from the FSD.
  The tester works from these and from nothing else.
- Do not write code. Type shapes and signatures are fine. Implementations are not.

## Asking the user

You cannot talk to the user. The router does that for you.

If a design choice is genuinely the user's to make, add an `## Open questions`
section with at most 4 questions, each with a `(recommended: ...)` default, then
report `status: needs-input`.

Trade-offs the user can feel are worth asking: visible behaviour, where data is
stored, a new dependency. Anything internal is not.

A `## Decisions` section is settled. Never re-ask it.

## Your report back

At most 10 lines: `status`, the story count, the count of files to add and to
change, the open question count, and the artifact path.
