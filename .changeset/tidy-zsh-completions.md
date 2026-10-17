---
"cf": patch
---

Initialize Zsh completions before registering `cf`

Fix `cf complete zsh >> ~/.zshrc` in shells that have not initialized Zsh's completion system. The generated script now runs `compinit` only when `compdef` is unavailable, and preserves the first-line `#compdef cf` directive for autoloaded completion files.
