---
"cf": patch
---

Accept `@file` values for generated string enum body flags

Resolve file tokens before checking an enum's allowed choices, so a file containing a valid value works like a literal flag. Continue rejecting file contents outside the enum and preserve the existing choices in help.
