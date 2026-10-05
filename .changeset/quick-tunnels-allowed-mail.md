---
"cf": minor
---

Add email protection to `cf tunnels quick-start`

Use `--allowed-mail` to require email authentication for a temporary tunnel.
The option accepts exact email addresses, comma-separated lists, and wildcard
domains, and may be repeated. For example:

```sh
cf tunnels quick-start http://localhost:3000 --allowed-mail "alice@example.com,*@example.org"
```

Protected tunnels require `cloudflared` 2026.9.2 or later. cf checks the selected
binary before launching and reports an upgrade error for older or unrecognised
versions. Recipient values are excluded from cf debug logs and telemetry.
