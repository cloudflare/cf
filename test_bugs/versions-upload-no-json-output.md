---
slug: versions-upload-no-json-output
title: cf workers versions create has no machine-readable version-ID output
status: Active
fix-location: cf-only
last-verified: 2026-09-16
---

# `cf workers versions create` has no structured stdout mode

## Current status

Active. `packages/cli/src/commands/deploy/shared.ts` defines the shared builder and handler for `cf deploy` and `cf workers versions create`. The builder has no `--json` option. `runUpload()` awaits `versionsUpload(...)` or `deploy(...)` without retaining its result, then prints a human-oriented clack success message alongside deploy-helper logs.

The ID is not available as a stable JSON value on normal stdout. Automation using only the ordinary command stream therefore has to scrape a non-contractual log line (historically `Worker Version ID: <id>`).

There is an important structured side channel: deploy-helpers' `writeOutput()` writes versioned NDJSON, including `worker_name` and `version_id`, when `WRANGLER_OUTPUT_FILE_PATH` or `WRANGLER_OUTPUT_FILE_DIRECTORY` is set. This is machine-readable but is an inherited Wrangler environment-variable protocol, not a discoverable cf flag or the generated-command JSON stdout contract.

This is a hand-written command gap; generated API commands already use JSON stdout by default. It is not covered by the imported Wrangler command tests.

## Resolution direction

Add an explicit structured mode to the shared upload builder and print a stable object containing at least the Worker name and version ID. In that mode, decorative progress/log output must stay off stdout. No helper extension is needed for the ID: `versionsUpload()` already returns an object containing `versionId` and related preview fields, but `runUpload()` currently discards it. The existing NDJSON side channel can remain available for compatibility.

`cf deploy` should be considered at the same time because it uses the same handler and has the same automation requirement, with deployment identifiers in addition to the uploaded version.
