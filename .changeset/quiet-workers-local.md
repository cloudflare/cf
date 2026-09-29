---
"cf": patch
---

Reject local mode for Worker version uploads and trigger deployments

Fail `cf workers versions create --local` and `cf workers triggers deploy --local` before building or making deployment API requests, including with `--prebuilt` or `--dry-run`. These commands only support remote deployment; their help now explains this restriction instead of advertising local simulation options.
