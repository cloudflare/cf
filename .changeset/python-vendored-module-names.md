---
"cf": patch
---

Fix `cf deploy` for Python Workers with vendored packages

Upload Build Output modules under their manifest paths in `cf deploy`,
`cf workers versions create` and `cf previews deploy` instead of prefixing them
with `./`. Python Workers use module names as file paths without normalising
them, and import vendored packages from the `python_modules/` directory. With
the prefix, the vendored `workers` SDK was not on the import path, so
`from workers import ...` failed with `No module named 'workers'` (10021).
