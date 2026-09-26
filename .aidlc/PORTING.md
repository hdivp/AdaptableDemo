# Running this flow in VS Code Copilot

The flow runs in Claude Code and in VS Code Copilot from the same files. There is
no second copy of anything. This file records what the two products share, what
had to be added, and how to start the flow in each.

## Start the flow

| Product | How to start |
| --- | --- |
| Claude Code | Type `/aidlc <feature name>`. |
| VS Code Copilot | Pick **aidlc** in the Agent dropdown, then type the feature name. |

Both entry points run the same router skill, in the main chat session, so the
human gates work the same way in both.

## What VS Code Copilot reads by itself

Most of this flow needs no port, because VS Code reads Claude's own directories.

| Thing | VS Code behaviour | Work needed |
| --- | --- | --- |
| `.claude/skills/aidlc*/**` | Read natively as project skills, and offered as `/` commands | none |
| `.claude/agents/aidlc-*.md` | Read natively as custom agents, plain `.md` accepted | frontmatter only, see below |
| `CLAUDE.md` | Read only with `chat.useClaudeMdFile` turned on | `.vscode/settings.json` sets it |
| `.aidlc/**` | Plain files, no product knows about them | none |
| Markdown links to `references/` and `templates/` | Followed on demand | none |

Skill bodies, templates, `gates.md`, and `artifacts.md` are byte for byte the
same for both products. That is the whole point of the design, and it is why this
port is small.

## What had to be added

### 1. Merged tool names in the role agents

Tool names differ between the products, and each product silently ignores a name
it does not know. So each `.claude/agents/aidlc-*.md` file lists **both**
vocabularies in one `tools:` line.

| Agent | Claude names | VS Code names |
| --- | --- | --- |
| `aidlc-requirements` | `Read, Write, Edit, Grep, Glob, Skill` | `read, edit, search` |
| `aidlc-planner` | same | `read, edit, search` |
| `aidlc-architect` | plus `Bash`, `mcp__ag-mcp__*` | plus `shell`, `ag-mcp/*` |
| `aidlc-developer` | plus `Bash`, `mcp__ag-mcp__*` | plus `shell`, `ag-mcp/*` |
| `aidlc-tester` | plus `Bash`, `mcp__claude-in-chrome__*` | plus `shell`, `playwright/*` |

MCP servers use `<server name>/*` in the VS Code half of the list.

### Models per stage

Each role agent pins a model, using the Claude Code aliases:

| Agent | Model | Why |
| --- | --- | --- |
| `aidlc-requirements` | `sonnet` | Shapes a brief into a spec. Bounded text work. |
| `aidlc-architect` | `opus` | Fits the feature to the codebase and dodges the v32 traps. |
| `aidlc-planner` | `sonnet` | Splits stories a human already approved. Mechanical. |
| `aidlc-developer` | `opus` | Writes the real code against a pinned API. |
| `aidlc-tester` | `sonnet` | Many tool calls. It observes and reports. |

The rule is: `opus` where a mistake is expensive to undo, `sonnet` where the work
is already decided.

These aliases are Claude Code only. VS Code has no Claude models in its picker
here, only OpenAI ones, and its `model:` field takes display names rather than
aliases. Claude Code's field takes a single string and no array, so one line
cannot serve both. VS Code therefore skips the alias it cannot find.

The VS Code side pins its model once, on the router:

```yaml
model: ['GPT-6 Sol', 'GPT-5.6 Sol', 'GPT-5.5', 'GPT-5.4']
```

VS Code tries the list in order and uses the first one your picker actually
offers, so a name you do not have costs nothing. Edit this one line to match your
picker. Sub-agents run on the main model unless they name one VS Code recognises,
so all five stages inherit this model and the flow stays on one model there.

A per-stage split in VS Code would need five more agent files under
`.github/agents/`. That is deliberately not done: VS Code reads `.claude/agents/`
as well, so a second file with the same `name:` would give two agents one name.

`model: inherit` is not used. It is a Claude-only value, and leaving the key out
already means "use the main model".

`skills:` is kept. It preloads the role skill in Claude Code, and VS Code ignores
the unknown key. So that each agent works even without a skill tool, every agent
body also names the skill's file path, for example:

```
invoke the skill named aidlc-architect now, or read
`.claude/skills/aidlc-architect/SKILL.md`, before anything else
```

### 2. A router agent for VS Code

`.github/agents/aidlc.agent.md`

In VS Code, delegation needs the `agent` tool, which is off by default. Listing
it in `tools:` turns it on without the user ticking a box in Configure Tools. The
`agents:` key then limits delegation to the five role agents.

The body is three lines. It points at `.claude/skills/aidlc/SKILL.md` and adds no
logic of its own. Two copies of the stage order would drift.

Claude Code does not read `.github/agents/`, so this file cannot disturb the
existing `/aidlc` skill. This is also why the five role agents were **not** copied
into `.github/agents/`: VS Code reads both folders, so a copy would give two
agents the same name.

### 3. MCP servers for VS Code

`.vscode/mcp.json` declares two stdio servers:

- `ag-mcp` - the AG Grid documentation server. Required, because `CLAUDE.md`
  forbids answering AG Grid questions from memory.
- `playwright` - the browser the tester drives.

### 4. Browser candidates instead of one browser name

`browser_mcp` in `.aidlc/config.yaml` is now a list of candidates in order:

```yaml
browser_mcp: ["claude-in-chrome", "playwright"]
```

The tester uses the first one connected in the session and ignores the rest. One
config therefore serves both products, and the skill body needed no tool name: it
says "open a tab" and "read the page".

Set `browser_mcp: []` to turn browser checks off. The tester then drops to reading
code and marks what it cannot prove `UNVERIFIED`. That is the designed fallback,
not a failure.

## Rules the skill bodies follow, so they stay product-neutral

None of these appear anywhere in this flow, and they must not be added:

- Dynamic command injection inside a markdown body.
- Claude-only path variables such as the skill directory or project directory
  placeholders.
- Argument placeholders in the body, or an `arguments:` frontmatter key. The
  router reads the feature name from prose instead.
- Frontmatter keys `context`, `background`, `allowed-tools`, `paths`,
  `when_to_use`, `hooks`. In particular never `context: fork` on the router skill:
  it would run the router in a sub-agent, and a sub-agent cannot ask the user a
  question, so every gate would disappear.
- Tool names in prose. The bodies say "delegate to the aidlc-architect agent" and
  "consult the documentation servers named in doc_mcp", never a literal tool name.
  Tools are gated in frontmatter only.
- Nested agent trees. The flow is one flat router that delegates to one role agent
  at a time. That maps onto VS Code sub-agents, which are one level deep unless a
  setting is changed.

Markdown links from a skill to its `references/` and `templates/` files are kept
on purpose. Both products follow those links on demand, which is what keeps the
context small.

## The one thing that must not change

The router runs in the main session, because only the main session can ask the
user a question. Keep that in any further port. If the router becomes a
sub-agent, the human gates disappear and the pipeline runs unattended.
