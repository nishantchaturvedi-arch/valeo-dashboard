# UAE babysitting lead tracker

Implementation prepared for the existing `dashboard.html`. This branch is not a live deployment. The browser endpoint is intentionally blank until the private backend has been configured and verified. No real leads are bundled with the new code. No Slack messages have been sent.

## What is included

- An admin-only navigation tab, UAE Babysitting Leads, matching the dashboard's current theme.
- A private API which checks a Firebase ID token, revocation, and the single `VALEO_ADMIN_UID` on every read and update.
- A read-only import of the exact source spreadsheet, restricted in code to `'UAE_babysitting'!A:W`. Other tabs are never requested.
- English and Arabic form responses mapped to name, phone, city, language, child's age, live-in/live-out preference, and package.
- Call links, search, status/classification filters, a due-follow-up filter, agent, notes, Dubai-time follow-up dates, and the last 50 updates per lead.
- Source refreshes preserve manual status, notes and follow-up dates. Version checks prevent one window from silently overwriting another window's changes.
- An inactive n8n workflow that polls once per minute. The first successful sync imports existing leads quietly. Later new submissions create queued Slack alerts with an Open lead & update status button.
- Failed Slack deliveries remain queued with backoff. The sync lease prevents overlapping runs. Repeated source rows and routine polling do not generate repeat alerts.

## Access model

The existing dashboard checks its login credentials in public browser code. That session is used only to decide whether to show the new tab. It is **not** accepted as proof of identity by the new API.

The lead tracker requests a separate admin verification using Firebase Authentication. Create or choose the one Firebase account that represents `valeo_admin` and set its UID on the server. Use a new private password, not the password embedded in the current dashboard. This change does not replace the existing dashboard's login or alter partner accounts.

All new lead records must be in a **separate named Firestore database**, `uae-leads`, with the included deny-all client rules. The backend deliberately refuses `(default)`. Do not replace the existing default database's rules with this file. The server uses IAM through the Admin SDK. Client scripts never receive service-account credentials, Slack tokens, or sync secrets.

## Deployment sequence

1. In the existing Firebase project, enable email/password Authentication if needed and identify the admin UID. Configure the GitHub Pages hostname as an authorized domain. Keep password entry in Firebase's own account setup/reset flow.
2. Create the named Firestore database `uae-leads` and apply `lead-tracker-service/firestore.rules` to that database only. Enable the Google Sheets API in the service account's project.
3. Give the backend service account viewer access to the exact source spreadsheet. Set its ID privately as `LEAD_SOURCE_SPREADSHEET_ID` on the backend; do not commit the ID. A separate Sheets service account may be supplied if desired.
4. Deploy `lead-tracker-service` as the root directory of a Node.js Vercel project. Install with `npm ci`; no frontend framework or build command is needed. Use the tested lockfile. Set the variables listed in `.env.example` through the host's environment settings.
5. Select the intended Slack channel and a bot with `chat:write`. Invite the bot to that channel. Set `SLACK_CHANNEL_ID` and `SLACK_BOT_TOKEN` on the backend. Do not use a personal session cookie or place a token in the repository.
6. Generate a random sync secret of at least 32 bytes. Store it as `LEAD_SYNC_SECRET` on the backend and as an n8n Header Auth credential: name `Authorization`, value `Bearer <secret>`.
7. Set only the verified deployed API URL in `assets/uae-leads-config.js`, ending in `/api/uae-leads`. Keep Firebase public config null to reuse the current dashboard project, or set the public web-app config if a separate Authentication project was chosen.
8. Import `automation/uae-babysitting-leads.n8n.json`. Replace its example endpoint and select the Header Auth credential. Run it once manually to establish the quiet baseline. Check the returned source count and the tracker before enabling the schedule.
9. Complete a controlled new-lead test in the real integration, including the chosen Slack channel, the deep link, admin-only read/write access, a saved status, and a reload. Then publish the dashboard changes and activate the workflow. Do not describe this as live before that test passes.

Deploy the backend in the intended Vercel account once its Firebase setup is available.

## Operation and limits

- The intended latency is roughly one polling interval plus processing time; this is polling, not a direct Snapchat webhook. One-minute scheduling produces about 43,200 n8n executions per 30-day month. Confirm the workspace's available execution allowance or adjust the interval before activation.
- The source sheet remains the raw intake source. Status, notes and audit history live in the private tracker database; this version does not write statuses back to the sheet.
- Records are keyed by source spreadsheet/tab, submission timestamp, normalized phone, and platform. Row order, name, campaign, and remarks edits do not change identity. A new submission time from the same phone is a new enquiry. Changing the timestamp or phone of an existing source row creates a new identity because the source has no immutable lead ID.
- Incomplete rows are deferred and retried. Source columns and unexpected errors are surfaced rather than silently importing the wrong tab. Removed source rows remain in the tracker so their notes and history are retained.
- The list loads 100 leads per page. Search, filters and counters clearly apply to loaded records. Load earlier leads to include them. The API serves a deep-linked record directly, even when it is outside the loaded page.
- The dashboard refreshes every 30 seconds while the tab is visible. Refresh pauses while an edit dialog is open. A stale-source notice appears after five minutes without a successful sync.
- A successful Slack response is recorded before dequeuing. A crash or network ambiguity between Slack accepting a message and the database recording the result can still cause a duplicate on retry. A stable `client_msg_id` is supplied; no exactly-once guarantee is claimed.
- Alert batches are capped at 10 per sync and spaced to respect channel rate limits. Larger bursts remain queued. Watch n8n execution failures and the sync warning shown in the tracker.
- `tel:` links hand off to the device's calling app. They do not place calls automatically or make calls through Slack.

## Checks performed

Run `npm test` inside `lead-tracker-service` for the synthetic-data checks. They cover authorization, revocation checking, private sync credentials, bilingual mapping, number normalization, stable identifiers, partial rows, quiet baseline import, retry behavior, preservation of manual edits, stale-write conflicts, and safe Slack message content. Live Firebase, Google Sheets, Slack and Vercel integration require the deployment checks above.

API routes: `GET ?action=list[&cursor=<id>]`, `GET ?action=lead&id=<id>`, and `PATCH ?action=update` require the admin ID token. `POST ?action=sync` requires the separate sync secret. Origin restrictions supplement authorization; they do not replace it.

Reference documentation: [Firebase token verification](https://firebase.google.com/docs/auth/admin/verify-id-tokens), [Firestore databases](https://firebase.google.com/docs/firestore/manage-databases), [Slack chat.postMessage](https://docs.slack.dev/reference/methods/chat.postmessage), and [n8n Schedule Trigger](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.scheduletrigger/).
