---
"cf": patch
---

Upload binary multipart arrays as file parts

Fix `cf ai to-markdown --file path` to upload under the API's `files` field.
Accept multiple files with `--files @first.html @second.pdf` or repeated
`--files` flags, preserving each file's bytes and filename.
