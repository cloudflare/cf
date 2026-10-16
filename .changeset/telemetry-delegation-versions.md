---
"cf": minor
---

Record the global `cf` version in telemetry when it delegates to a project-pinned `cf`

When a globally installed `cf` hands a command to the copy a project pins, it
now passes its own version to that copy, which adds it to telemetry as
`globalCliVersion`. `cliVersion` remains the version of the `cf` that runs the
command, and `delegated` still marks delegated runs. Older global installs do
not pass a version, so the property is omitted for them.
