# n8n workflows

## Open orders to Slack — daily 10 PM (Dubai)

`open-orders-daily-slack.json` posts, every day at 22:00 Asia/Dubai, the orders whose confirmed
date has passed but whose status is still not COMPLETED (same rules as the dashboard's
⏰ Open Orders page: cancelled / temp orders and excluded homecares left out). UAE orders only —
Qatar is not included. The message lists the 40 oldest and links to `dashboard.html#openorders`.

Set-up in n8n (feelvaleo.app.n8n.cloud):
1. Workflows → Import from file → `open-orders-daily-slack.json`.
2. Open **Post to Slack** → pick the Slack credential already used by the ticket / transport
   workflows, and check the channel (default `C0AF2GS4FNF`, the HC tickets channel).
3. Click **Execute workflow** once to test, then switch the workflow **Active**.

`open-orders-code.js` is the Code node's script, kept here so it can be reviewed and tested.
