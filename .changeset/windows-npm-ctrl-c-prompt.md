---
"cf": patch
---

Exit cleanly after Ctrl+C when a framework command runs through npm on Windows

`cf dev`, `cf build`, and `cf init` now start `npm` and `npx` commands through
npm's CLI script instead of the `npm.cmd` and `npx.cmd` launchers. Those
launchers keep a batch file running, so pressing Ctrl+C left cf waiting at
cmd's "Terminate batch job (Y/N)?" prompt after the dev server had stopped.
