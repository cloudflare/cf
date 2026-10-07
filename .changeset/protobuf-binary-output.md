---
"cf": patch
---

Write protobuf API responses as binary output

Recognize `application/vnd.google.protobuf` responses as binary data so generated
commands write the raw bytes to stdout instead of decoding them as JSON. This
allows Worker profiling responses to be redirected to a pprof file.
