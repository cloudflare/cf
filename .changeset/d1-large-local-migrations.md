---
"cf": patch
---

Apply large local D1 migrations as a batch of SQL statements

Use Wrangler's shared SQL splitter so `cf d1 migrations apply --local` can apply migration files larger than SQLite's per-statement SQL length limit when their individual statements fit. Keep each migration and its bookkeeping insert in one atomic batch, preserving rollback on failure.
