---
"cf": minor
---

Expand dotenv variable references in `--secrets-file` input

Dotenv secrets files passed to `cf deploy` and `cf workers versions create` now expand `$VAR` and `${VAR}` using process values and earlier file values. Process values override matching file keys, including explicitly empty values. Only keys declared in the secrets file are uploaded.

This changes existing dotenv secrets: unset references become empty strings, so `PASSWORD=pa$word` becomes `pa` when `word` is unset. Escape literal dollar signs with a backslash (`PASSWORD=pa\$word`), or use JSON to preserve values exactly. Only use trusted dotenv secrets files, since references can read and upload any process environment value. JSON secrets files and API bulk-secret commands retain their existing behavior.
