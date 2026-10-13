---
"cf": patch
---

Write Preview deployment results for Workers Builds

Append successful `cf previews deploy` results to the output file configured by
`WRANGLER_OUTPUT_FILE_DIRECTORY` or `WRANGLER_OUTPUT_FILE_PATH`, including the
selected Worker name and timestamp. This lets Workers Builds display Preview
and deployment URLs, including when the command uses `--quiet`.
