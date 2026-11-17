---
"cf": patch
---

Finish project command shutdown after the launcher exits

Keep cf alive during graceful signal shutdown until the command's POSIX process
group exits or the five-second grace period expires, then force remaining
descendants to stop. Preserve repeated-interrupt escalation so interrupted dev
servers release their ports even when their launcher exits first.
