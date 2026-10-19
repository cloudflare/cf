---
"cf": minor
---

Add persisted keyring storage options to `cf auth login`

Use `--use-keyring` and `--no-use-keyring` to persist the OAuth credential-storage preference. Apply the preference before reading credentials so users can disable an unavailable keyring backend, and expose the option in help, completions, and tools.
