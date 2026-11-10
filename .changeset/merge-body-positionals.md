---
"cf": patch
---

Preserve body positionals when using `--body`

Merge positional values into JSON request bodies while keeping required
positionals mandatory. Reject conflicting values before sending a request or
showing a dry run.
