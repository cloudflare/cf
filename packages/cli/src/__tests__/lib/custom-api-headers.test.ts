import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, it, vi } from "vite-plus/test";
import { createApiFetch } from "../../lib/api-fetch.js";
import {
	createCloudflareClientWithToken,
	createCommandClient,
	requestApi,
} from "../../lib/auth.js";
import { createDeployContext } from "../../lib/deploy-context.js";
import { fetchRawBytes } from "../../lib/raw-fetch.js";
import { log } from "../../lib/ui/log.js";
import { msw, setupMsw } from "../helpers/msw.js";
import listAccounts from "#operations/accounts/list.js";

const base = "https://api.cloudflare.com/client/v4";

describe("custom API headers", () => {
	setupMsw();
	beforeEach(() => {
		vi.stubEnv("CLOUDFLARE_API_HEADERS", '{"X-Custom-Header":"value"}');
		vi.stubEnv("CLOUDFLARE_API_TOKEN", "test-token");
	});
	afterEach(() => vi.unstubAllGlobals());

	it("adds headers to generated SDK calls and passthrough requests", async ({
		expect,
	}) => {
		let requests = 0;
		msw.use(
			http.get(`${base}/accounts`, ({ request }) => {
				requests++;
				expect(request.headers.get("x-custom-header")).toBe("value");
				expect(request.headers.get("authorization")).toBe("Bearer test-token");
				return HttpResponse.json({ success: true, result: [] });
			})
		);
		const client = await createCommandClient({});
		await client.send(listAccounts, {});
		await requestApi(client, "GET", "/accounts");
		expect(requests).toBe(2);
	});

	it("rejects Content-Encoding before sending a request", ({ expect }) => {
		vi.stubEnv("CLOUDFLARE_API_HEADERS", '{"CONTENT-ENCODING":"gzip"}');
		const send = vi.fn<typeof globalThis.fetch>();
		expect(() =>
			createApiFetch(send)(`${base}/upload`, { method: "POST", body: "{}" })
		).toThrow('protected header "CONTENT-ENCODING"');
		expect(send).not.toHaveBeenCalled();
	});

	it("adds headers to raw output requests", async ({ expect }) => {
		msw.use(
			http.get(`${base}/accounts/id/raw`, ({ request }) => {
				expect(request.headers.get("x-custom-header")).toBe("value");
				return new HttpResponse("bytes");
			})
		);
		expect((await fetchRawBytes("/accounts/id/raw")).toString()).toBe("bytes");
	});

	it("adds headers to deploy-helper requests and all pages", async ({
		expect,
	}) => {
		let requests = 0;
		msw.use(
			http.get(`${base}/accounts/id/workers/scripts`, ({ request }) => {
				requests++;
				expect(request.headers.get("x-custom-header")).toBe("value");
				expect(request.headers.get("authorization")).toBe("Bearer test-token");
				return HttpResponse.json({
					success: true,
					result: [requests],
					result_info: { cursor: requests === 1 ? "next" : "" },
				});
			})
		);
		const context = createDeployContext("test-token");
		expect(
			await context.fetchListResult(
				{ compliance_region: "public" },
				"/accounts/id/workers/scripts"
			)
		).toEqual([1, 2]);
		expect(requests).toBe(2);
	});

	it.for([undefined, "true", "false"])(
		"follows WRANGLER_LOG_SANITIZE=%s for deployment diagnostics",
		async (sanitize, { expect }) => {
			vi.stubEnv("DEBUG", "1");
			vi.stubEnv("WRANGLER_LOG_SANITIZE", sanitize);
			vi.stubEnv(
				"CLOUDFLARE_API_HEADERS",
				'{"X-Custom-Header":"configured-secret","X-Auth-Key":"global-key"}'
			);
			const messages = vi.spyOn(log, "message").mockImplementation(() => {});
			msw.use(
				http.get(`${base}/accounts/id/workers/scripts`, ({ request }) => {
					expect(request.headers.get("x-custom-header")).toBe(
						"configured-secret"
					);
					expect(request.headers.get("x-auth-key")).toBe("global-key");
					return HttpResponse.json({ success: true, result: [] });
				})
			);
			const context = createDeployContext("test-token");
			await context.fetchResult(
				{ compliance_region: "public" },
				"/accounts/id/workers/scripts"
			);
			await context.fetchResult(
				{ compliance_region: "public" },
				"/accounts/id/workers/scripts",
				{ headers: { "X-CUSTOM-HEADER": "request-secret" } }
			);
			const output = messages.mock.calls.map(([message]) => message).join("\n");
			if (sanitize === "false") {
				expect(output).toContain('"x-custom-header": "configured-secret"');
			} else {
				expect(output).toContain("omitted; set WRANGLER_LOG_SANITIZE=false");
				expect(output).not.toContain("configured-secret");
				expect(output).not.toContain("request-secret");
			}
			expect(output).not.toContain("Bearer test-token");
			expect(output).not.toContain('"x-auth-key"');
			expect(output).not.toContain("global-key");
		}
	);

	it("overrides authentication on SDK, passthrough, raw, and deployment requests", async ({
		expect,
	}) => {
		const custom = {
			Authorization: "Custom configured-token",
			"X-Auth-Key": "configured-key",
			"X-Auth-Email": "user@example.com",
			"Proxy-Authorization": "Basic configured-proxy-token",
		};
		vi.stubEnv("CLOUDFLARE_API_HEADERS", JSON.stringify(custom));
		let requests = 0;
		msw.use(
			http.get(/\/client\/v4\/accounts(?:\/|$)/, ({ request }) => {
				requests++;
				for (const [name, value] of Object.entries(custom)) {
					expect(request.headers.get(name)).toBe(value);
				}
				return HttpResponse.json({ success: true, result: [] });
			})
		);
		const client = await createCommandClient({});
		await client.send(listAccounts, {});
		await requestApi(client, "GET", "/accounts");
		await fetchRawBytes("/accounts/id/raw");
		await createDeployContext("test-token").fetchResult(
			{ compliance_region: "public" },
			"/accounts/id/workers/scripts"
		);
		expect(requests).toBe(4);
	});

	it("keeps local transports free of custom headers", async ({ expect }) => {
		const send = vi
			.fn<typeof fetch>()
			.mockImplementation(async (input, init) => {
				const request = new Request(input, init);
				expect(request.headers.has("x-custom-header")).toBe(false);
				return Response.json({ success: true, result: [] });
			});
		const client = createCloudflareClientWithToken({
			apiToken: "local",
			customApiHeaders: false,
			fetch: send,
		});
		await client.send(listAccounts, {});
		expect(send).toHaveBeenCalledOnce();
	});

	it("overrides request headers while preserving native multipart uploads", async ({
		expect,
	}) => {
		const body = new FormData();
		body.set("metadata", "{}");
		const send = vi
			.fn<typeof fetch>()
			.mockImplementation(async (input, init) => {
				const request = new Request(input, init);
				expect(request.headers.get("x-custom-header")).toBe("value");
				expect(request.headers.get("content-type")).toMatch(
					/^multipart\/form-data; boundary=/
				);
				expect(await request.text()).toContain('name="metadata"\r\n\r\n{}');
				return new Response("ok");
			});
		await createApiFetch(send)(`${base}/upload`, {
			method: "POST",
			body,
			headers: { "X-CUSTOM-HEADER": "override" },
		});
	});
});
