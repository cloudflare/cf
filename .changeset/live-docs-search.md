---
"cf": minor
---

Add `cf docs search` for live Cloudflare documentation

Search guides, tutorials, and examples with `cf docs search "schedule a worker"`.
Return ranked JSON results with titles, descriptions, and documentation URLs
without requiring a Cloudflare login. Include the command in agent discovery
and explain how to fetch complete pages as Markdown.
Record documentation search queries in telemetry with the same length limit
and opt-out behavior as CLI command search.
Extend the agent help disclaimer about identifying information to both search
commands.
