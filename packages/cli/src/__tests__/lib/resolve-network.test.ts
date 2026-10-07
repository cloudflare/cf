import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vite-plus/test";
import { createCloudflareClientWithToken } from "../../lib/auth.js";
import { resolveZoneId } from "../../lib/resolve.js";
import { server, setupMsw, TEST_BASE_URL } from "../helpers/msw.js";
import type { Cloudflare } from "../../lib/auth.js";

/**
 * Network-level tests for `resolveZoneId` against a *real* SDK client
 * with MSW mocking the wire.
 *
 * `resolve.test.ts` already covers `resolveZoneId`'s branching with a
 * hand-rolled fake client (cache, ID passthrough, name lookup). This
 * file is complementary: it drives the genuine generated SDK
 * `client.zones.list(...)` call path so the SDK-integration seam (URL
 * building, envelope unwrapping, auth header) is exercised end-to-end
 * rather than stubbed.
 *
 * Each test uses a unique account id because `resolveZoneId` keeps a
 * module-level 60s cache keyed by account id and zone name — distinct ids
 * keep the cases isolated within the shared process.
 */
describe("resolveZoneId (network)", () => {
	setupMsw();

	function client(): Cloudflare {
		return createCloudflareClientWithToken({
			apiToken: "test-token",
			baseURL: TEST_BASE_URL,
		});
	}

	function mockZones(zones: Array<{ id: string; name: string }>): void {
		server.use(
			http.get(`${TEST_BASE_URL}/zones`, () =>
				HttpResponse.json({ success: true, result: zones })
			)
		);
	}

	it("resolves a domain name to its zone id over the wire", async () => {
		mockZones([
			{ id: "zone-other", name: "other.com" },
			{ id: "zone-match", name: "example.com" },
		]);

		await expect(
			resolveZoneId(client(), "acct-net-1", "example.com")
		).resolves.toBe("zone-match");
	});

	it("finds a zone beyond the first page by filtering on its name", async () => {
		let requestUrl: URL | undefined;
		let requests = 0;
		server.use(
			http.get(`${TEST_BASE_URL}/zones`, ({ request }) => {
				requests++;
				requestUrl = new URL(request.url);
				const isFiltered =
					requestUrl.searchParams.get("name") === "later.example.com";
				return HttpResponse.json({
					success: true,
					result: isFiltered
						? [{ id: "zone-later", name: "later.example.com" }]
						: [{ id: "zone-first", name: "first.example.com" }],
					result_info: {
						page: 1,
						per_page: 20,
						total_pages: isFiltered ? 1 : 2,
					},
				});
			})
		);

		await expect(
			resolveZoneId(client(), "acct-net-page-2", "LATER.EXAMPLE.COM")
		).resolves.toBe("zone-later");
		expect(requests).toBe(1);
		expect(requestUrl?.searchParams.get("account.id")).toBe("acct-net-page-2");
		expect(requestUrl?.searchParams.get("name")).toBe("later.example.com");
	});

	it("returns an ID input verbatim without making a request", async () => {
		// No handler: onUnhandledRequest:"error" fails the test if the
		// SDK is consulted for an input that already looks like an ID.
		const id = "023e105f4ecef8ad9ca31a8372d0c353";
		await expect(resolveZoneId(client(), "acct-net-2", id)).resolves.toBe(id);
	});

	it("throws when the named zone is absent from the account", async () => {
		mockZones([{ id: "zone-1", name: "other.com" }]);

		await expect(
			resolveZoneId(client(), "acct-net-3", "missing.com")
		).rejects.toThrow(/Zone not found: missing\.com/);
	});

	it("sends the bearer token the client was constructed with", async () => {
		let auth: string | null = null;
		server.use(
			http.get(`${TEST_BASE_URL}/zones`, ({ request }) => {
				auth = request.headers.get("authorization");
				return HttpResponse.json({
					success: true,
					result: [{ id: "zone-x", name: "x.com" }],
				});
			})
		);

		await resolveZoneId(client(), "acct-net-4", "x.com");
		expect(auth).toBe("Bearer test-token");
	});
});
