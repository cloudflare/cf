---
"cf": patch
---

Prepare generated commands to preserve audio API responses

Recognize `audio/*` responses as binary data in the command generator and its
operation descriptors, including schemas without `format: binary`. Future commands
generated for audio endpoints will write the exact bytes to stdout so they can be
redirected to a file. No commands generated from the currently pinned OpenAPI
specification declare audio responses, so this change does not alter the behavior
of any currently shipped command.
