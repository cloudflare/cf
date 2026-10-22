---
"cf": patch
---

Fix `cf deploy` for Python Workers with vendored packages

Upload Build Output modules under their manifest paths instead of prefixing
them with `./`, matching Wrangler. Python Workers only install vendored packages
whose module names start with `python_modules/`, so the prefix made
`from workers import ...` fail with `No module named 'workers'` (10021).
