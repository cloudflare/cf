---
"cf": patch
---

Validate array body limits instead of batching requests

Reject JSON array bodies that exceed the API schema's `maxItems`, including inline
input, files, and dry runs. Remove automatic request batching for every HTTP method
so array limits cannot silently change an operation's meaning or lose results.
