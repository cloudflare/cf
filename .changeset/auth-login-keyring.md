---
"cf": patch
---

Add `cf auth login --use-keyring` and `--no-use-keyring` to persist the OAuth credential-storage preference. Apply the preference before reading credentials so users can disable an unavailable keyring backend, and expose the option in help, completions, and tools.
