// Ported from wrangler — most tests in this file exercised wrangler's
// INTERNAL zone-resolution helpers (`getHostFromUrl`, `getZoneForRoute`)
// that read a route shape (`{ pattern, zone_id, zone_name }`) lifted out
// of `wrangler.toml`. cf has no equivalent: per AGENTS.md cf does not
// read worker config, and `lib/context.ts` `getZoneId` resolves only
// from CLI flag / env / `.cfrc` / config (no host-string parsing, no
// route override shape). The whole file is therefore wrangler-only.
//
// The shape is preserved (not deleted) per the porting guide; each
// test is converted to `it.skip(...)` with an empty body.

// eslint-disable-next-line no-restricted-imports
import { describe, it, test } from "vitest";

describe("Zones", () => {
	describe("getHostFromUrl", () => {
		// Each row was a (pattern -> expected host) check against
		// wrangler's `getHostFromUrl` URL parser. Skipped wholesale —
		// the helper has no cf equivalent.
		test.skip.each`
			pattern                                             | host
			${"rootdomain.com"}                                 | ${"rootdomain.com"}
			${"*.subdomain.com"}                                | ${"subdomain.com"}
			${"*rootdomain-or-subdomain.com"}                   | ${"rootdomain-or-subdomain.com"}
			${"rootdomain.com/path/name"}                       | ${"rootdomain.com"}
			${"*.subdomain.com/path/name"}                      | ${"subdomain.com"}
			${"*rootdomain-or-subdomain.com/path/name"}         | ${"rootdomain-or-subdomain.com"}
			${"*/path/name"}                                    | ${undefined}
			${"invalid:host"}                                   | ${undefined}
			${"invalid:host/path/name"}                         | ${undefined}
			${"http://rootdomain.com"}                          | ${"rootdomain.com"}
			${"http://*.subdomain.com"}                         | ${"subdomain.com"}
			${"http://*rootdomain-or-subdomain.com"}            | ${"rootdomain-or-subdomain.com"}
			${"http://rootdomain.com/path/name"}                | ${"rootdomain.com"}
			${"http://*.subdomain.com/path/name"}               | ${"subdomain.com"}
			${"http://*rootdomain-or-subdomain.com/path/name"}  | ${"rootdomain-or-subdomain.com"}
			${"http://*/path/name"}                             | ${undefined}
			${"http://invalid:host"}                            | ${undefined}
			${"http://invalid:host/path/name"}                  | ${undefined}
			${"https://rootdomain.com"}                         | ${"rootdomain.com"}
			${"https://*.subdomain.com"}                        | ${"subdomain.com"}
			${"https://*rootdomain-or-subdomain.com"}           | ${"rootdomain-or-subdomain.com"}
			${"https://rootdomain.com/path/name"}               | ${"rootdomain.com"}
			${"https://*.subdomain.com/path/name"}              | ${"subdomain.com"}
			${"https://*rootdomain-or-subdomain.com/path/name"} | ${"rootdomain-or-subdomain.com"}
			${"https://*/path/name"}                            | ${undefined}
			${"https://invalid:host"}                           | ${undefined}
			${"https://invalid:host/path/name"}                 | ${undefined}
		`("$pattern --> $host", () => {});
	});

	describe("getZoneForRoute", () => {
		// `getZoneForRoute` in wrangler accepted a `Route` (a
		// `wrangler.toml`-shaped string-or-object) and resolved it to
		// `{ host, id }`. cf has no equivalent — `getZoneId` in
		// `packages/cli/src/lib/context.ts` is single-input (`--zone`
		// flag / env / `.cfrc`) and never reads worker config.
		it.skip("string route", () => {});
		it.skip("string route (not a zone)", () => {});
		it.skip("zone_id route", () => {});
		it.skip("zone_id route (custom hostname)", () => {});
		it.skip("zone_name route (apex)", () => {});
		it.skip("zone_name route (subdomain)", () => {});
		it.skip("zone_name route (custom hostname)", () => {});
		it.skip("zone_name route (subdomain, subsequent fetches are cached)", () => {});
	});
});
