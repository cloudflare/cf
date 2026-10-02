import assert from "node:assert";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { fetchRawBytes } from "../../lib/raw-fetch.js";

describe("fetchRawBytes", () => {
	let originalFetch: typeof globalThis.fetch;
	let originalApiToken: string | undefined;

	beforeEach(() => {
		originalFetch = globalThis.fetch;
		originalApiToken = process.env.CLOUDFLARE_API_TOKEN;
	});

	afterEach(() => {
		globalThis.fetch = originalFetch;
		if (originalApiToken === undefined) {
			delete process.env.CLOUDFLARE_API_TOKEN;
		} else {
			process.env.CLOUDFLARE_API_TOKEN = originalApiToken;
		}
	});

	describe("production mode (local unset)", () => {
		it("includes the Authorization header on outbound requests", async () => {
			process.env.CLOUDFLARE_API_TOKEN = "prod-token";
			const seen: Request[] = [];
			globalThis.fetch = (async (input, init) => {
				const req =
					input instanceof Request
						? input
						: new Request(
								typeof input === "string" ? input : input.toString(),
								init
							);
				seen.push(req);
				return new Response("bytes", { status: 200 });
			}) as typeof globalThis.fetch;

			await fetchRawBytes(
				"/accounts/abc/storage/kv/namespaces/NS/values/HELLO"
			);

			expect(seen).toHaveLength(1);
			const req = seen[0];
			assert(req);
			expect(req.url).toBe(
				"https://api.cloudflare.com/client/v4/accounts/abc/storage/kv/namespaces/NS/values/HELLO"
			);
			expect(req.headers.get("Authorization")).toBe("Bearer prod-token");
		});

		it("normalizes a trailing slash in CLOUDFLARE_API_BASE_URL", async () => {
			process.env.CLOUDFLARE_API_TOKEN = "prod-token";
			const previousBase = process.env.CLOUDFLARE_API_BASE_URL;
			process.env.CLOUDFLARE_API_BASE_URL = "https://api.example.test/v4/";

			const seen: Request[] = [];
			globalThis.fetch = (async (input, init) => {
				const req =
					input instanceof Request
						? input
						: new Request(
								typeof input === "string" ? input : input.toString(),
								init
							);
				seen.push(req);
				return new Response("", { status: 200 });
			}) as typeof globalThis.fetch;

			try {
				await fetchRawBytes("/accounts/abc/anything");
				expect(seen[0]?.url).toBe(
					"https://api.example.test/v4/accounts/abc/anything"
				);
			} finally {
				if (previousBase === undefined) {
					delete process.env.CLOUDFLARE_API_BASE_URL;
				} else {
					process.env.CLOUDFLARE_API_BASE_URL = previousBase;
				}
			}
		});

		it("applies the standard API timeout", async () => {
			process.env.CLOUDFLARE_API_TOKEN = "prod-token";
			let signal: AbortSignal | undefined;
			globalThis.fetch = (async (_input, init) => {
				signal = init?.signal ?? undefined;
				return new Response("", { status: 200 });
			}) as typeof globalThis.fetch;

			await fetchRawBytes("/accounts/abc/anything");

			expect(signal).toBeInstanceOf(AbortSignal);
			expect(signal?.aborted).toBe(false);
		});

		it("omits the request deadline for binary uploads", async () => {
			process.env.CLOUDFLARE_API_TOKEN = "prod-token";
			let signal: AbortSignal | null | undefined;
			globalThis.fetch = (async (_input, init) => {
				signal = init?.signal;
				return new Response(null, { status: 204 });
			}) as typeof globalThis.fetch;

			await fetchRawBytes("/accounts/abc/anything", {
				method: "PUT",
				body: Buffer.from("data"),
			});
			expect(signal).toBeUndefined();
		});
	});

	describe("error handling", () => {
		it("throws APIError on non-2xx responses", async () => {
			process.env.CLOUDFLARE_API_TOKEN = "prod-token";
			globalThis.fetch = (async () =>
				new Response(JSON.stringify({ errors: [{ message: "nope" }] }), {
					status: 404,
					headers: { "content-type": "application/json" },
				})) as typeof globalThis.fetch;

			await expect(fetchRawBytes("/accounts/abc/missing")).rejects.toThrow(
				/Status code: 404/
			);
		});
	});

	/**
	 * Body handling — mutating raw-output endpoints (AI image generation,
	 * etc.) POST a request body and stream binary bytes back. The body
	 * shape varies (assembled JSON object, pre-serialized JSON string,
	 * raw bytes, FormData) and `fetchRawBytes` needs to set the right
	 * `Content-Type` for each without leaking it into bodyless requests.
	 */
	describe("request body", () => {
		beforeEach(() => {
			process.env.CLOUDFLARE_API_TOKEN = "prod-token";
		});

		it("JSON-stringifies plain objects and sets application/json", async () => {
			let captured: Request | undefined;
			globalThis.fetch = (async (input, init) => {
				captured =
					input instanceof Request
						? input
						: new Request(
								typeof input === "string" ? input : input.toString(),
								init
							);
				return new Response("png-bytes", { status: 200 });
			}) as typeof globalThis.fetch;

			await fetchRawBytes("/accounts/abc/ai/run/@cf/foo", {
				method: "POST",
				body: { prompt: "a cat" },
			});

			expect(captured?.method).toBe("POST");
			expect(captured?.headers.get("Content-Type")).toBe("application/json");
			expect(await captured?.text()).toBe('{"prompt":"a cat"}');
		});

		it("sends pre-serialized JSON strings verbatim with explicit contentType", async () => {
			let captured: Request | undefined;
			globalThis.fetch = (async (input, init) => {
				captured =
					input instanceof Request
						? input
						: new Request(
								typeof input === "string" ? input : input.toString(),
								init
							);
				return new Response("", { status: 200 });
			}) as typeof globalThis.fetch;

			await fetchRawBytes("/accounts/abc/ai/run/@cf/foo", {
				method: "POST",
				body: '{"prompt":"a dog"}',
				contentType: "application/json",
			});

			expect(captured?.headers.get("Content-Type")).toBe("application/json");
			expect(await captured?.text()).toBe('{"prompt":"a dog"}');
		});

		it("forwards Buffer bodies with octet-stream default", async () => {
			let captured: Request | undefined;
			globalThis.fetch = (async (input, init) => {
				captured =
					input instanceof Request
						? input
						: new Request(
								typeof input === "string" ? input : input.toString(),
								init
							);
				return new Response("", { status: 200 });
			}) as typeof globalThis.fetch;

			const payload = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
			await fetchRawBytes("/accounts/abc/anything", {
				method: "PUT",
				body: payload,
			});

			expect(captured?.method).toBe("PUT");
			expect(captured?.headers.get("Content-Type")).toBe(
				"application/octet-stream"
			);
			assert(captured);
			const got = Buffer.from(await captured.arrayBuffer());
			expect(got.equals(payload)).toBe(true);
		});

		it("lets caller override Content-Type via headers", async () => {
			let captured: Request | undefined;
			globalThis.fetch = (async (input, init) => {
				captured =
					input instanceof Request
						? input
						: new Request(
								typeof input === "string" ? input : input.toString(),
								init
							);
				return new Response("", { status: 200 });
			}) as typeof globalThis.fetch;

			await fetchRawBytes("/accounts/abc/anything", {
				method: "POST",
				body: { foo: "bar" },
				headers: { "Content-Type": "application/vnd.custom+json" },
			});

			// Explicit header wins over the body-derived default.
			expect(captured?.headers.get("Content-Type")).toBe(
				"application/vnd.custom+json"
			);
		});

		it("does not set Content-Type for bodyless requests", async () => {
			let captured: Request | undefined;
			globalThis.fetch = (async (input, init) => {
				captured =
					input instanceof Request
						? input
						: new Request(
								typeof input === "string" ? input : input.toString(),
								init
							);
				return new Response("", { status: 200 });
			}) as typeof globalThis.fetch;

			await fetchRawBytes("/accounts/abc/anything");

			expect(captured?.headers.get("Content-Type")).toBeNull();
		});
	});
});
