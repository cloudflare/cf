import { describe, expect, it, vi } from "vitest";
import {
	isCloudflareId,
	isId,
	isUUID,
	isValidDomainName,
	resolveZoneId,
} from "../../lib/resolve.js";
import type { Cloudflare } from "../../lib/auth.js";

/**
 * Unit tests for `lib/resolve.ts` — the friendly-name → ID resolution
 * helpers shared by generated commands that accept either a zone ID or
 * a domain name.
 *
 * Two halves:
 *  - The pure predicates (`isUUID` / `isCloudflareId` / `isId` /
 *    `isValidDomainName`) gate whether a positional is treated as an
 *    opaque ID (passed through verbatim) or a name (looked up via the
 *    API). Getting these wrong means either a needless API round-trip
 *    for an ID, or a malformed name reaching the wire.
 *  - `resolveZoneId` ties them together against a fake SDK client.
 *    Its 60s in-memory cache is module-level, so each test uses a
 *    distinct accountId to stay isolated; one test asserts the cache
 *    explicitly by resolving multiple names under the same accountId.
 */

describe("isUUID", () => {
	it("accepts a canonical v4 UUID (case-insensitive)", () => {
		expect(isUUID("f47ac10b-58cc-4372-a567-0e02b2c3d479")).toBe(true);
		expect(isUUID("F47AC10B-58CC-4372-A567-0E02B2C3D479")).toBe(true);
	});

	it("rejects non-v4 version nibbles", () => {
		// Third group must start with `4`.
		expect(isUUID("f47ac10b-58cc-1372-a567-0e02b2c3d479")).toBe(false);
	});

	it("rejects malformed or non-UUID strings", () => {
		expect(isUUID("not-a-uuid")).toBe(false);
		expect(isUUID("f47ac10b58cc4372a5670e02b2c3d479")).toBe(false); // no dashes
		expect(isUUID("")).toBe(false);
	});
});

describe("isCloudflareId", () => {
	it("accepts a 32-char hex string", () => {
		expect(isCloudflareId("023e105f4ecef8ad9ca31a8372d0c353")).toBe(true);
		expect(isCloudflareId("023E105F4ECEF8AD9CA31A8372D0C353")).toBe(true);
	});

	it("rejects wrong-length or non-hex strings", () => {
		expect(isCloudflareId("023e105f4ecef8ad9ca31a8372d0c35")).toBe(false); // 31
		expect(isCloudflareId("023e105f4ecef8ad9ca31a8372d0c3531")).toBe(false); // 33
		expect(isCloudflareId("023e105f4ecef8ad9ca31a8372d0c35z")).toBe(false); // non-hex
	});
});

describe("isId", () => {
	it("is true for either a UUID or a Cloudflare ID", () => {
		expect(isId("f47ac10b-58cc-4372-a567-0e02b2c3d479")).toBe(true);
		expect(isId("023e105f4ecef8ad9ca31a8372d0c353")).toBe(true);
	});

	it("is false for a domain name", () => {
		expect(isId("example.com")).toBe(false);
	});
});

describe("isValidDomainName", () => {
	it("accepts ordinary domains", () => {
		expect(isValidDomainName("example.com")).toBe(true);
		expect(isValidDomainName("sub.example.co.uk")).toBe(true);
		expect(isValidDomainName("a-b.example.com")).toBe(true);
	});

	it("requires at least one dot", () => {
		expect(isValidDomainName("localhost")).toBe(false);
	});

	it("rejects empty and over-long inputs", () => {
		expect(isValidDomainName("")).toBe(false);
		// 254 chars total (over the 253 cap).
		const tooLong = `${"a".repeat(250)}.com`;
		expect(isValidDomainName(tooLong)).toBe(false);
	});

	it("rejects labels that don't start/end alphanumeric", () => {
		expect(isValidDomainName("-bad.example.com")).toBe(false);
		expect(isValidDomainName("bad-.example.com")).toBe(false);
		expect(isValidDomainName("example..com")).toBe(false); // empty label
	});

	it("rejects labels with illegal characters", () => {
		expect(isValidDomainName("exa_mple.com")).toBe(false);
		expect(isValidDomainName("exa mple.com")).toBe(false);
	});

	it("rejects a label longer than 63 chars", () => {
		expect(isValidDomainName(`${"a".repeat(64)}.com`)).toBe(false);
	});
});

/**
 * Build a fake SDK client whose `zones.list` filters the supplied zones by name
 * and records how many times it was called (to assert caching).
 */
function fakeClient(zones: Array<{ id: string; name: string }>): {
	client: Cloudflare;
	calls: () => number;
} {
	let calls = 0;
	const client = {
		zones: {
			list: async (request: { name: string }) => {
				calls++;
				return {
					result: zones.filter((zone) => zone.name === request.name),
				};
			},
		},
	} as unknown as Cloudflare;
	return { client, calls: () => calls };
}

describe("resolveZoneId", () => {
	it("returns an ID input verbatim without hitting the API", async () => {
		const { client, calls } = fakeClient([]);
		const id = "023e105f4ecef8ad9ca31a8372d0c353";
		await expect(
			resolveZoneId(client, "acct-id-passthrough", id)
		).resolves.toBe(id);
		expect(calls()).toBe(0);
	});

	it("throws before any API call when the name is not a valid domain", async () => {
		const { client, calls } = fakeClient([]);
		await expect(
			resolveZoneId(client, "acct-bad-name", "not a domain")
		).rejects.toThrow(/Invalid zone identifier/);
		expect(calls()).toBe(0);
	});

	it("looks up a zone by name and returns its ID", async () => {
		const { client } = fakeClient([
			{ id: "zone-other", name: "other.com" },
			{ id: "zone-match", name: "example.com" },
		]);
		await expect(
			resolveZoneId(client, "acct-lookup", "example.com")
		).resolves.toBe("zone-match");
	});

	it("matches case-insensitively against the zone list", async () => {
		const { client } = fakeClient([{ id: "zone-1", name: "example.com" }]);
		await expect(
			resolveZoneId(client, "acct-case", "EXAMPLE.COM")
		).resolves.toBe("zone-1");
	});

	it("throws when the named zone is absent from the account", async () => {
		const { client } = fakeClient([{ id: "zone-1", name: "other.com" }]);
		await expect(
			resolveZoneId(client, "acct-missing", "example.com")
		).rejects.toThrow(/Zone not found: example\.com/);
	});

	it("caches each normalized zone name separately in the same account", async () => {
		const { client, calls } = fakeClient([
			{ id: "zone-a", name: "a.example.com" },
			{ id: "zone-b", name: "b.example.com" },
		]);
		// Unique accountId so this test owns its cache entry.
		const acct = `acct-cache-${Math.random().toString(36).slice(2)}`;
		await expect(resolveZoneId(client, acct, "a.example.com")).resolves.toBe(
			"zone-a"
		);
		await expect(resolveZoneId(client, acct, "b.example.com")).resolves.toBe(
			"zone-b"
		);
		await expect(resolveZoneId(client, acct, "A.EXAMPLE.COM")).resolves.toBe(
			"zone-a"
		);
		expect(calls()).toBe(2);
	});

	it("does not consult the cache for ID inputs", async () => {
		const spy = vi.fn();
		const client = {
			zones: { list: spy },
		} as unknown as Cloudflare;
		await resolveZoneId(
			client,
			"acct-id",
			"f47ac10b-58cc-4372-a567-0e02b2c3d479"
		);
		expect(spy).not.toHaveBeenCalled();
	});
});
