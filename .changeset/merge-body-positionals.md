---
"cf": patch
---

Preserve body positionals when using `--body`

Allow JSON request bodies to supply required body positional fields. Merge
explicit positional values into the body and reject conflicting values before
sending a request or showing a dry run.
