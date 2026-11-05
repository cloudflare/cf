---
"cf": minor
---

Replace the Preview name positional argument with `--preview-name`

This is a breaking change during the 1.0 beta: use `cf previews deploy --preview-name feature` instead of `cf previews deploy feature`. Omitting the flag still defaults to the current CI or Git branch; when no branch is available, the error now shows the flag syntax.
