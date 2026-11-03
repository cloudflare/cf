---
"cf": patch
---

Correct action labels for commands that require confirmation

Show Updating/Updated for confirmed PUT and PATCH operations and neutral
Processing/Done labels for confirmed POST actions. Keep their operation-specific
warnings and `--force` behavior, and reject missing required `--body` input before
asking for confirmation.
