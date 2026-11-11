---
"cf": patch
---

Retry API requests after another process refreshes the OAuth token

Refreshing a stored OAuth token revokes the previous one, so a command that
read the token just before another cf process refreshed it failed with an
authentication error. cf now rereads the stored credentials when the API
rejects an OAuth token, refreshing them if they expired during the command,
and retries the request once with the current token.
