---
"cf": patch
---

Print `cf complete <shell>` scripts faster

The init script does not depend on cf's command catalogue, so skip loading
it. `eval "$(cf complete zsh)"` in a shell rc now costs roughly a third of
what it did.
