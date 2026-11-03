---
"cf": patch
---

Require input for mandatory plain-text request bodies

Reject commands that omit a required plain-text body before authentication or API requests. Accept either `--body` or `--file`, preserve explicitly supplied empty raw bodies, and mention both input options in upload validation errors.
