# mcp-recall-profiles

Community compression profiles for [mcp-recall](https://github.com/sakebomb/mcp-recall).

Profiles are declarative TOML files that tell mcp-recall how to compress the output of a specific MCP tool — no TypeScript required.

## Using profiles

Install all community profiles for your installed MCPs in one command:

```bash
mcp-recall profiles seed
```

Install a specific profile by name:

```bash
mcp-recall profiles install mcp__jira
```

List what's installed:

```bash
mcp-recall profiles list
```

## Available profiles

<!-- manifest-table-start -->
| Profile | Matches | Description |
|---------|---------|-------------|
| `mcp__jira` | `mcp__jira__*` | Jira issue and search results — extracts key, summary, status, assignee, priority |
<!-- manifest-table-end -->

## Contributing a profile

See [CONTRIBUTING.md](CONTRIBUTING.md).

The profile schema is documented in the main repo at [`docs/profile-schema.md`](https://github.com/sakebomb/mcp-recall/blob/main/docs/profile-schema.md).

## How it works

- `manifest.json` is the machine-readable index. `mcp-recall profiles seed` downloads this file first to discover available profiles.
- Profiles are installed to `~/.local/share/mcp-recall/profiles/community/`.
- Local profiles in `~/.config/mcp-recall/profiles/` always take precedence over community profiles.
- Profiles are checked on every hook call (cached in memory, invalidated on file change).
