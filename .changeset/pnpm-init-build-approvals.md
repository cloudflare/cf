---
"cf": patch
---

Allow required dependency build scripts in pnpm Worker projects

`cf init` now writes `pnpm-workspace.yaml` when pnpm is selected, approving the
`esbuild` and `workerd` build scripts before dependency installation. This also
applies with `--no-install` so a later `pnpm install` succeeds on pnpm 11 and
newer.
