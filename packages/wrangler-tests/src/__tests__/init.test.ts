import { describe, it } from "vitest";

// SKIP: `wrangler init` delegates to C3 (`create-cloudflare`) and scaffolds
// wrangler-shaped projects with `wrangler.toml` / `wrangler.jsonc`. `cf init`
// has different semantics: it writes a `cloudflare.config.ts` hello-world
// Worker into an empty directory or hands a non-empty one to autoconfig, with
// no C3 delegation or dashboard download. The entire test file
// (download-from-dashboard, --from-dash, C3 delegation, metrics-config side
// effects) is wrangler-only. Out of scope per AGENTS.md "cf does NOT read
// project worker config".
describe("init", () => {
	it.skip("wrangler-only: `wrangler init` + `--from-dash` + C3 delegation");
});
