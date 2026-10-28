---
"cf": patch
---

Preserve audio API responses as binary output

Recognize `audio/*` responses as binary data in the command generator and its
operation descriptors, including schemas without `format: binary`. Generated
commands write the exact audio bytes to stdout so they can be redirected to a file.
