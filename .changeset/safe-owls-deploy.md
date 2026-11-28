---
"cf": patch
---

Skip project files by default when deploying a static directory.

`cf deploy`, `cf previews deploy`, and `cf workers versions create` use the same ignore rules as a scaffolded project when given a directory without an `.assetsignore`. Add your own `.assetsignore`, even an empty one, to replace those defaults. The CLI summarizes skipped paths and lists them when `DEBUG=1` is set.
