---
"cf": patch
---

Send API requests through a thin client instead of the generated SDK

Generated and hand-written commands now send their requests through a small
built-in client rather than a generated TypeScript SDK, which shrinks the
package. Commands send the same requests as before, with one exception:
commands that build their JSON body from flags now always send it, as `{}`
when no body flags are passed, instead of sometimes sending no body.
