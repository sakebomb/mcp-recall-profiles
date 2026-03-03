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
| `mcp__aws` | `mcp__aws__*`, `mcp__aws_cli__*`, `mcp__awscli__*` | AWS CLI/SDK responses — depth-limited JSON truncation |
| `mcp__confluence` | `mcp__confluence__*`, `mcp__atlassian_confluence__*` | Confluence page and search results — extracts id, title, space, status, version |
| `mcp__figma` | `mcp__figma__*` | Figma comments, components and styles — extracts id, message/name, description |
| `mcp__gcp` | `mcp__gcp__*`, `mcp__google_cloud__*`, `mcp__gcloud__*` | GCP resource lists — extracts name, id, status, zone |
| `mcp__gmail` | `mcp__gmail__*`, `mcp__google_gmail__*` | Gmail message lists — extracts id, from, subject, date, snippet |
| `mcp__google_calendar` | `mcp__google_calendar__*`, `mcp__googlecalendar__*` | Google Calendar events — extracts title, start, end, location, attendee count |
| `mcp__hubspot` | `mcp__hubspot__*`, `mcp__hubspot_crm__*` | HubSpot CRM contacts, deals, and companies — extracts key fields |
| `mcp__jira` | `mcp__jira__*` | Jira issue and search results — extracts key, summary, status, assignee, priority |
| `mcp__vercel` | `mcp__vercel__*` | Vercel deployments and projects — extracts name, status, url, created, duration |
<!-- manifest-table-end -->

## Contributing a profile

The fastest path: use `mcp-recall profiles retrain` to generate suggestions from your stored session data, then submit via `profiles feed`. No TypeScript needed.

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full workflow and checklist.

Schema reference: [`docs/profile-schema.md`](https://github.com/sakebomb/mcp-recall/blob/main/docs/profile-schema.md) · Retrain guide: [`docs/retrain.md`](https://github.com/sakebomb/mcp-recall/blob/main/docs/retrain.md)

## How it works

- `manifest.json` is the machine-readable index. `mcp-recall profiles seed` downloads this file first to discover available profiles.
- Profiles are installed to `~/.local/share/mcp-recall/profiles/community/`.
- Local profiles in `~/.config/mcp-recall/profiles/` always take precedence over community profiles.
- Profiles are checked on every hook call (cached in memory, invalidated on file change).
