# Project config

`.aidlc/config.yaml` is the only file in this flow that knows anything about this
project. Everything else is generic. To reuse the flow in another repository,
copy `.claude/skills/aidlc*` and `.claude/agents/aidlc-*`, then write a new
config.

Flat `key: value`, plus simple inline lists.

| Key | Meaning |
| --- | --- |
| `conventions_file` | The repository's own rules file. Point at it. Never copy its content here. |
| `fsd_search` | Where to look for an existing FSD, as glob patterns. |
| `verify_fast` | The cheap check the developer runs after every task. |
| `verify_full` | The full check the tester runs once. |
| `doc_mcp` | Names of MCP servers to consult for library documentation. |
| `doc_mcp_setup` | One sentence on how to prime those servers before searching. |
| `source_roots` | Where product code lives. |
| `test_command` | How to run the test suite, or `none`. |
| `app_start` | Command that starts the app, so the tester can drive it. |
| `app_url` | Where the started app answers. |
| `app_ready_seconds` | How long to wait for it before giving up. |
| `browser_mcp` | Names of MCP servers that drive a browser, as candidates in order. The tester uses the first one connected in this session, so one config serves every editor. Empty turns browser checks off. |
| `project_memory` | Path to the project-wide durable-decisions file. Router-only writer. Point at it; create if missing. |

`verify_fast` and `verify_full` are split on purpose. Without the split, the
developer runs a full build after every task, which is slow and wasteful.

`conventions_file` points instead of copying on purpose. A copy drifts, and the
conventions file is already loaded automatically by both Claude Code and GitHub
Copilot, so pointing at it costs nothing.

## If the config is missing

Create it before any stage runs. Infer the values:

- `conventions_file`: `CLAUDE.md` or `AGENTS.md` if either exists, else `none`.
- `verify_fast` and `verify_full`: from the scripts in the package manifest or
  build file. Prefer a type check for fast, and a build for full.
- `doc_mcp`: the MCP servers in this session that serve library documentation. If
  there are none, use `[]`.
- `source_roots`: the directories holding product code.
- `test_command`: the project's test script, or `none`.
- `app_start` and `app_url`: the dev server script and the address it serves. Set
  both to `none` for a project with no runnable app, such as a pure library.
- `app_ready_seconds`: `40` is a safe start.
- `browser_mcp`: the browser-driving MCP servers in this session. Use `[]` if
  there are none.
- `project_memory`: `.aidlc/decisions.md`.

Show the config to the user and let them correct it before the first stage runs.

## If project_memory points at a file that does not exist yet

Create it empty, with just this header, before the first architect or quickplan
stage reads it:

```
# Project decisions

Durable, cross-feature conventions, settled by prior features. Read once at the
start of the architect and quickplan stages. Never re-derive or re-ask
something already listed here.
```

If `project_memory` itself is missing from `config.yaml`, treat it as
`.aidlc/decisions.md` and create that file the same way.

## Why the tester needs an app to drive

Reading code proves almost nothing about a user interface. If `app_start`,
`app_url`, and `browser_mcp` are set, the tester opens the real app and checks
what it can see. If they are not set, it falls back to reading code and marks
what it could not prove as `UNVERIFIED`. Filling these three keys in is the
single biggest thing you can do to make the test stage worth running.
