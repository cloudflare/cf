---
"cf": minor
---

Add `cf complete <shell> --install`

Write the shell completion script to cf's config directory so your shell rc
can source the file instead of running `cf complete` on every startup, which
cost roughly 250ms per shell. Pressing TAB keeps installed scripts current
after cf upgrades.

```sh
cf complete zsh --install
# then add the printed line to ~/.zshrc, e.g.
source ~/.config/cloudflare/completions/cf.zsh
```
