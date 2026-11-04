---
"cf": patch
---

Describe plain-text `--body` correctly in command metadata

For commands that send `--body` as `text/plain`, command metadata used by
`cf tools` now gives the same description as `--help` instead of asking for
raw JSON.
