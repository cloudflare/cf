---
"cf": minor
---

Move prompts, progress and workflow messages to stderr

Breaking change during the beta: prompts, confirmations and the progress
spinner now render on stderr, so they keep working while stdout is redirected,
as in `cf kv namespaces create > ns.json`, and a confirmation that used to fail
there now waits for an answer. Some confirmations in `cf deploy` and
`cf workers triggers deploy` still ask only when stdout is a terminal, and go
ahead without asking otherwise. Prompts and the spinner need stdin and stderr
to be terminals outside CI, so the spinner no longer swallows piped input, and
Ctrl+C or Esc during the spinner now exits with status 130 instead of 0.
`cf init`, `cf build`, `cf deploy`, `cf workers versions create` and
`cf workers triggers deploy` print their messages on stderr too, together
with the output of the build and install commands cf runs, so scripts that
read those messages from stdout must read stderr instead. `cf previews deploy`
no longer prints upload messages into its JSON output, and `cf dev` still
gives the dev server the whole terminal.

`--quiet` now also hides notices and the `✓` success line, but never warnings,
the commands that fix them, or prompts. A declined delete ends with
`└ Aborted.`, `cf init` prints its next steps below the closed flow so each
copies on its own, the first-run notices use clack info lines, and the
dev-server errors use the error frame with each install command on its own
line.
