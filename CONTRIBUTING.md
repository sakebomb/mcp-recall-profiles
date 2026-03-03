# Contributing to mcp-recall-profiles

Profiles are declarative TOML files — no TypeScript needed. If you use an MCP that isn't covered yet, a profile is the fastest way to contribute.

## Prerequisites

- [Bun](https://bun.sh) ≥ 1.1.0
- [mcp-recall](https://github.com/sakebomb/mcp-recall) installed locally (for testing)

## Setup

```bash
git clone https://github.com/sakebomb/mcp-recall-profiles
cd mcp-recall-profiles
bun install
```

## Using `retrain` to generate a starting point

If you've been using the MCP with mcp-recall already, the fastest approach is to let it analyse your stored data:

```bash
mcp-recall profiles retrain <mcp-name>    # see what fields appear frequently
mcp-recall profiles retrain --apply       # write suggestions to your local profile
```

This works with existing profiles (it adds missing fields) or after `mcp-recall learn` generates a template. Review the suggestions, then submit via `mcp-recall profiles feed <path>`.

→ [Full retrain guide](https://github.com/sakebomb/mcp-recall/blob/main/docs/retrain.md)

---

## Writing a profile from scratch

Full schema reference: [`docs/profile-schema.md`](https://github.com/sakebomb/mcp-recall/blob/main/docs/profile-schema.md) in the main repo.

**Quick start:**

1. Create `profiles/<mcp_id>/default.toml` (e.g. `profiles/mcp__notion/default.toml`)
2. Follow this template:

```toml
[profile]
id          = "mcp__notion"          # unique slug matching [a-z0-9_-]+
version     = "1.0.0"
description = "One sentence: what this compresses"
mcp_pattern = "mcp__notion__*"       # glob — only trailing * supported
author      = "your-github-username"
sample_tool = "mcp__notion__search"  # tool you tested against

[strategy]
type       = "json_extract"
items_path = ["results", "pages"]    # ordered paths to try (first array match wins)
fields     = [
  "id",
  "properties.title.title.0.plain_text",
  "properties.Status.status.name",
]
max_items           = 10
max_chars_per_field = 200
fallback_chars      = 500

[strategy.labels]
"id"                                        = "ID"
"properties.title.title.0.plain_text"       = "Title"
"properties.Status.status.name"             = "Status"
```

## Capturing a real fixture

The most reliable way to write a profile is against real output.

```bash
# Start Claude with debug logging
RECALL_DEBUG=1 claude

# Run the MCP tool you're targeting
# The hook will log: [recall:debug] intercepted mcp__notion__search · 18.4KB

# If it falls through to genericHandler, your profile isn't matching yet
```

Paste the logged output into your test or use it to tune your `fields` paths.

## Validating

```bash
bun run validate        # check all profiles pass schema validation
```

Fix any errors before opening a PR. The CI will block on validation failures.

## Submitting a PR

1. Fork, create a branch: `feat/mcp__notion-profile`
2. Add your profile in `profiles/<mcp_id>/default.toml`
3. Run `bun run validate`
4. Open a PR — title format: `feat: <MCP name> profile (mcp__<id>__*)`

**PR checklist:**
- [ ] `bun run validate` passes
- [ ] Profile ID matches `[a-z0-9_-]+`
- [ ] `mcp_pattern` tested against real tool output
- [ ] `description` is one clear sentence
- [ ] `author` set to your GitHub username
- [ ] `sample_tool` set to a real tool name from the MCP

## What belongs here vs a TypeScript handler

| Situation | This repo (TOML) | Main repo (TypeScript) |
|-----------|-----------------|----------------------|
| Structured JSON with named fields | ✓ | |
| Multiple possible response shapes | | ✓ |
| Normalization logic (int → label) | | ✓ |
| Non-JSON output (HTML, DOM, diff) | | ✓ |

If you're unsure, open an issue first.
