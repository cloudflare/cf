---
"cf": minor
---

Add `cf feedback` for sending bugs, friction and feature requests to the cf team

Sign in with `cf auth login` or set `CLOUDFLARE_API_TOKEN` to use the command. A note on its own is enough. Structured detail goes in repeatable `--field key=value` flags, and agents can pipe a JSON report with the same fields plus an `agent` object through `--input-json -`. Every field is optional. Sending feedback includes diagnostic context such as the CLI version, OS, and detected agent and model by default, including when `DO_NOT_TRACK=1`. Use `--no-context` to omit this context from the report. Feedback request headers include the cf version, execution mode, and detected agent harness, if available. `cf feedback --help` shows a notice when `DO_NOT_TRACK` is enabled. `--dry-run` prints the submission without sending it.

After sending feedback, agents should tell the user at the next natural break and share the submission ID.

```sh
cf feedback "the deploy output does not say which account it used"
cf feedback --field type=bug --field product=workers --field expected="a deploy" --field actual="error 10000"
```
