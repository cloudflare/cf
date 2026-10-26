---
"cf": patch
---

Explain dotenv variable expansion in `--secrets-file` help

Document how dotenv secrets files passed to `cf deploy` and `cf workers versions create` expand `$VAR` and `${VAR}` using process values and earlier file values. Process values override matching file keys, including explicitly empty values. Only keys declared in the secrets file are uploaded.

Explain how to escape literal dollar signs with a backslash (`PASSWORD=pa\$word`), or use JSON to preserve values exactly. Only use trusted dotenv secrets files, since references can read and upload any process environment value. JSON secrets files and API bulk-secret commands retain their existing behavior.
