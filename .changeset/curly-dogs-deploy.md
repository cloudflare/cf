---
"cf": minor
---

Deploy any prebuilt static asset directory directly with `cf deploy [directory]` and the equivalent Preview deployment and version creation commands.

The directory form creates assets-only Build Output, reuses optional assets-only Worker configuration, and skips project build delegation. Projects containing a configured Worker entrypoint or Container continue to omit the directory and use the delegated build path.
