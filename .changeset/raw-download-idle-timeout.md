---
"cf": patch
---

Let large downloads finish

Commands that download raw bytes, such as `cf r2 objects get`, no longer
abort after the 60-second API deadline while data is still arriving. The
deadline now bounds the wait for the response and any stretch in which no
data arrives, so a stalled connection still fails.
