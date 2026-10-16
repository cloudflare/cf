---
"cf": minor
---

Upload every binary multipart field from a file

Generated multipart commands now add a path flag for each `format: binary`
form field besides the payload that `--file` fills. For example,
`cf pages deployments create` accepts `--worker-js`, `--routes-json`,
`--redirects`, `--worker-bundle`, and
`--functions-filepath-routing-config-json`, so a Pages Direct Upload can
include an advanced-mode `_worker.js`. Before this change, `--file` only
reached `_headers` and the other files could not be sent.
