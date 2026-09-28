import { describe, it } from "vitest";

// Tests wrangler's `tunnel/cloudflared` module, specifically the
// `redactCloudflaredArgsForLogging` helper that scrubs `--token` values
// out of cloudflared subprocess argv before they get logged. cf doesn't
// spawn `cloudflared` — Cloudflare Tunnel CRUD is exposed as
// `cf zero-trust tunnels cloudflared {create,list,get,delete,...}`
// (forge-generated against the API), not as a subprocess wrapper. The
// `wrangler tunnel run` use-case (running an existing tunnel locally
// via the cloudflared binary) has no cf equivalent and is tracked as
// out of scope per the AGENTS.md positioning. Out of scope for the
// wrangler-tests corpus.

describe("cloudflared arg redaction", () => {
	it.skip("redacts --token and other sensitive values", () => {});

	it.skip("redacts --token=... style", () => {});
});
