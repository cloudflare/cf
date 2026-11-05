---
"cf": patch
---

Describe plain-text `--body` correctly in command metadata

For commands that send `--body` as `text/plain`, command metadata used by
`cf tools` now gives the same description as `--help` instead of asking for
raw JSON. This includes media types with parameters such as
`text/plain;charset=UTF-8`. When no description is provided, both metadata
and `--help` use plain-text wording.
