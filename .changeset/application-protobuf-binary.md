---
"cf": patch
---

Write `application/protobuf` API responses as binary output

Responses declared as `application/protobuf` (the standard protobuf media type) are now treated as binary, like `application/vnd.google.protobuf`, so `cf workers versions profile` keeps writing raw pprof bytes when the API spec adopts the standard type.
