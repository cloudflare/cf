---
"cf": minor
---

Upload every binary multipart field from a file

Generated multipart commands now add a flag for each `format: binary`
form field besides the payload that `--file` fills. For example,
`cf pages deployments create` accepts `--worker-js`, `--routes-json`,
`--redirects`, `--worker-bundle`, and
`--functions-filepath-routing-config-json`, so a Pages Direct Upload can
include an advanced-mode `_worker.js` with `--worker-js @./_worker.js`.
These flags accept literal content or `@path/to/file`, matching other body
flags while preserving uploaded file bytes and filenames. Both forms upload
as file parts; inline content uses the original form field name as its filename.
Before this change, `--file` only reached `_headers` and the other files
could not be sent.
