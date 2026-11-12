---
"cf": minor
---

Show project-relative paths in source-mapped stack traces of deployed Workers

Bundlers write source map `sources` relative to the map file, so maps in a Build Output bundle referred to paths like `../../../../../../src/index.ts`, and deployed stack traces showed them verbatim. `cf deploy`, `cf workers versions create`, and `cf previews deploy` now rewrite `sources` relative to the project root before uploading, so stack traces show `src/index.ts`, and files outside the project keep their `../` prefix. Source maps on disk are unchanged.

Breaking change: Wrangler projects now require Wrangler 4.161.0 or newer, which writes Build Output source maps with `sources` relative to each map, as `cf` now expects. `cf dev`, `cf build`, and the commands that build before uploading reject older versions with an upgrade hint.
