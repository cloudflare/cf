---
"cf": minor
---

Add `cf feedback` for sending bugs, friction and feature requests to the cf team

A note on its own is enough. Structured detail goes in repeatable `--field key=value` flags, and agents can pipe a JSON report with the same fields plus an `agent` object through `--input-json -`. Every field is optional. CLI context (version, OS and the detected agent harness) is attached when telemetry is on; `--context` attaches it when telemetry is off, and `--no-context` or `DO_NOT_TRACK=1` never attaches it. `--dry-run` prints the submission without sending it.

```sh
cf feedback "the deploy output does not say which account it used"
cf feedback --field type=bug --field product=workers --field expected="a deploy" --field actual="error 10000"
```
