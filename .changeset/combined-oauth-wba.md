---
"cf": minor
---

Support explicit Web Bot Auth composition for experimental managed OAuth bindings

Consume matching SDK previews that validate and preserve `oauth.http_message_signatures: "web_bot_auth"` in both managed exchange modes. Deployment and type generation acquire no credentials, and the existing JavaScript fetch method signatures remain unchanged.
