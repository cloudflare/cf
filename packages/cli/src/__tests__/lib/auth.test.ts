import { CloudflareApiError } from "#sdk/errors";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
	createCloudflareClientWithToken,
	createCommandClient,
	requestApi,
} from "../../lib/auth.js";

describe("createCommandClient", () => {
	let originalApiToken: string | undefined;
	let originalHome: string | undefined;
	let originalXdgConfigHome: string | undefined;

	beforeEach(() => {
		originalApiToken = process.env.CLOUDFLARE_API_TOKEN;
		originalHome = process.env.HOME;
		originalXdgConfigHome = process.env.XDG_CONFIG_HOME;
		// Clear every token source so the production path has nothing to fall
		// back on. The OAuth token reader resolves cf's XDG config directory
		// lazily in `@cloudflare/workers-auth/cf`, so pointing both HOME and
		// XDG_CONFIG_HOME at a definitely-empty path guarantees it misses.
		delete process.env.CLOUDFLARE_API_TOKEN;
		process.env.HOME = "/nonexistent-home-for-tests";
		process.env.XDG_CONFIG_HOME = "/nonexistent-home-for-tests/.config";
	});

	afterEach(() => {
		if (originalApiToken === undefined) {
			delete process.env.CLOUDFLARE_API_TOKEN;
		} else {
			process.env.CLOUDFLARE_API_TOKEN = originalApiToken;
		}
		if (originalHome === undefined) {
			delete process.env.HOME;
		} else {
			process.env.HOME = originalHome;
		}
		if (originalXdgConfigHome === undefined) {
			delete process.env.XDG_CONFIG_HOME;
		} else {
			process.env.XDG_CONFIG_HOME = originalXdgConfigHome;
		}
	});

	describe("production mode", () => {
		it("throws when no auth token is available", async () => {
			await expect(createCommandClient({})).rejects.toThrow(
				/No authentication token found/
			);
		});

		it("succeeds when CLOUDFLARE_API_TOKEN is set", async () => {
			process.env.CLOUDFLARE_API_TOKEN = "test-token";
			const client = await createCommandClient({});
			expect(client).toBeDefined();
		});

		it("throws on a success:false envelope even without API errors", async () => {
			const client = createCloudflareClientWithToken({
				apiToken: "test-token",
				baseURL: "https://api.test/client/v4",
				fetch: async () =>
					new Response(JSON.stringify({ success: false }), {
						headers: { "content-type": "application/json" },
					}),
			});

			const request = requestApi(client, "GET", "/zones");
			await expect(request).rejects.toBeInstanceOf(CloudflareApiError);
			await expect(request).rejects.toThrow("API error: unknown error");
			await expect(request).rejects.toMatchObject({ statusCode: 200 });
		});

		it("throws CloudflareApiError for non-OK responses", async () => {
			const client = createCloudflareClientWithToken({
				apiToken: "test-token",
				baseURL: "https://api.test/client/v4",
				fetch: async () =>
					new Response(
						JSON.stringify({
							success: false,
							errors: [{ code: 10000, message: "bad request" }],
						}),
						{ status: 400, headers: { "content-type": "application/json" } }
					),
			});

			const request = requestApi(client, "GET", "/zones");
			await expect(request).rejects.toBeInstanceOf(CloudflareApiError);
			await expect(request).rejects.toMatchObject({ statusCode: 400 });
		});

		it("turns network failures into plain request errors", async () => {
			const client = createCloudflareClientWithToken({
				apiToken: "test-token",
				baseURL: "https://api.test/client/v4",
				fetch: async () => {
					throw new Error("socket closed");
				},
			});

			await expect(requestApi(client, "GET", "/zones")).rejects.toThrow(
				"Request failed: socket closed"
			);
		});

		it("turns aborts into timeout errors", async () => {
			const client = createCloudflareClientWithToken({
				apiToken: "test-token",
				baseURL: "https://api.test/client/v4",
				fetch: async () => {
					const error = new Error("aborted");
					error.name = "AbortError";
					throw error;
				},
			});

			await expect(
				requestApi(client, "GET", "/zones", { timeout: 1234 })
			).rejects.toThrow("Request timed out after 1234ms");
		});

		it("returns null for 204 responses and empty response bodies", async () => {
			const noContent = createCloudflareClientWithToken({
				apiToken: "test-token",
				baseURL: "https://api.test/client/v4",
				fetch: async () => new Response(null, { status: 204 }),
			});
			await expect(
				requestApi(noContent, "DELETE", "/zones/zone-id")
			).resolves.toBeNull();

			const emptyBody = createCloudflareClientWithToken({
				apiToken: "test-token",
				baseURL: "https://api.test/client/v4",
				fetch: async () => new Response("", { status: 200 }),
			});
			await expect(requestApi(emptyBody, "GET", "/zones")).resolves.toBeNull();
		});

		it("preserves non-JSON response bytes when requested", async () => {
			const bytes = Uint8Array.from([0, 255, 128, 65]);
			const client = createCloudflareClientWithToken({
				apiToken: "test-token",
				baseURL: "https://api.test/client/v4",
				fetch: async () =>
					new Response(bytes, {
						headers: { "content-type": "audio/wav" },
					}),
			});

			await expect(
				requestApi<Buffer>(client, "POST", "/ai/run/model", {
					preserveNonJsonBytes: true,
				})
			).resolves.toEqual(Buffer.from(bytes));
		});

		it("refuses to send authenticated requests to a foreign origin", async () => {
			const client = createCloudflareClientWithToken({
				apiToken: "test-token",
				baseURL: "https://api.test/client/v4",
				fetch: async () => {
					throw new Error("fetch must not run for a foreign-origin path");
				},
			});

			await expect(
				requestApi(client, "GET", "https://evil.example.com/steal")
			).rejects.toThrow(
				"Refusing to send an authenticated request to https://evil.example.com"
			);
		});
	});
});
