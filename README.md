# mcp-recall-profiles

18 ready-made compression profiles for [mcp-recall](https://github.com/sakebomb/mcp-recall) — extend context compression to any MCP without writing TypeScript.

Profiles are declarative TOML files that tell mcp-recall how to compress the output of a specific MCP tool. Drop one in and mcp-recall knows exactly which fields matter and which to drop.

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
| `mcp__airtable` | `mcp__airtable__*`, `mcp__airtable_mcp__*` | Airtable records — depth-limited truncation (field names vary per base and table) |
| `mcp__aws` | `mcp__aws__*`, `mcp__aws_cli__*`, `mcp__awscli__*` | AWS CLI/SDK responses — depth-limited JSON truncation |
| `mcp__chargebee` | `mcp__chargebee__*`, `mcp__chargebee_mcp__*` | Chargebee subscription billing — extracts id, status, plan, customer, period, and amount |
| `mcp__confluence` | `mcp__confluence__*`, `mcp__atlassian_confluence__*` | Confluence page and search results — extracts id, title, space, status, version |
| `mcp__datadog` | `mcp__datadog__*`, `mcp__datadog_mcp__*` | Datadog monitors, events, and dashboards — extracts id, name/title, type, status, query, tags |
| `mcp__figma` | `mcp__figma__*` | Figma comments, components and styles — extracts id, message/name, description |
| `mcp__gcp` | `mcp__gcp__*`, `mcp__google_cloud__*`, `mcp__gcloud__*` | GCP resource lists — extracts name, id, status, zone |
| `mcp__gmail` | `mcp__gmail__*`, `mcp__google_gmail__*` | Gmail message lists — extracts id, from, subject, date, snippet |
| `mcp__google_calendar` | `mcp__google_calendar__*`, `mcp__googlecalendar__*` | Google Calendar events — extracts title, start, end, location, attendee count |
| `mcp__grafana` | `mcp__grafana__*`, `mcp__grafana_mcp__*` | Grafana dashboards, alerts, and data sources — extracts uid, title, status, url, tags |
| `mcp__hubspot` | `mcp__hubspot__*`, `mcp__hubspot_crm__*` | HubSpot CRM contacts, deals, and companies — extracts key fields |
| `mcp__jira` | `mcp__jira__*` | Jira issue and search results — extracts key, summary, status, assignee, priority |
| `mcp__notion` | `mcp__notion__*` | Notion pages, databases, and search results — depth-limited truncation |
| `mcp__shopify` | `mcp__shopify__*`, `mcp__shopify_mcp__*` | Shopify orders, products, and customers — extracts id, title/name, status, price, email, fulfillment |
| `mcp__stripe` | `mcp__stripe__*` | Stripe payments — extracts id, object type, status, amount, currency, customer, email |
| `mcp__teams` | `mcp__teams__*`, `mcp__microsoft_teams__*` | Microsoft Teams messages, channels, and chats — extracts id, subject, sender, timestamp |
| `mcp__vercel` | `mcp__vercel__*` | Vercel deployments and projects — extracts name, status, url, created, duration |
| `mcp__xero` | `mcp__xero__*`, `mcp__xero_mcp__*` | Xero accounting — extracts key fields from invoices, contacts, accounts, and bank transactions |
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
