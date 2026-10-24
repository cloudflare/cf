---
"cf": patch
---

Use the reviewed Workers OIDC validation and local session checks.

Update the SDK prerelease to reject malformed audiences, ambiguous bindings,
and invalid local session audience policies before issuing tokens.
