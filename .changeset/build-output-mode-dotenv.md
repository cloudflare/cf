---
"cf": patch
---

Load `.env` files for the Build Output's mode when `--mode` is omitted

`cf deploy`, `cf workers versions create`, `cf workers triggers deploy`, and `cf previews deploy` now load `.env.<mode>` and `.env.<mode>.local` for the mode recorded in the Build Output when `--mode` is not passed. Previously they read only `.env` and `.env.local`, so deploying a staging build without repeating `--mode staging` could use the account and API token from `.env` instead of `.env.staging`.

Vite records its default `production` mode when a build runs without `--mode`, so these commands now also load `.env.production` for such builds, matching the files the build itself used. An explicit `--mode` must still match the recorded mode.
