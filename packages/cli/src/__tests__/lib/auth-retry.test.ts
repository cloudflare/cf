import { writeAuthConfigFile } from "@cloudflare/workers-auth/cf";
import {
	mockConsoleMethods,
	runInTempDir,
} from "@cloudflare/workers-utils/test-helpers";
import { http, HttpResponse } from "msw/http";
import { describe, expect, it, vi } from "vite-plus/test";
import { withTokenRecovery } from "../../lib/auth-retry.js";
import { fetchRawBytes } from "../../lib/raw-fetch.js";
import { server, setupMsw, TEST_BASE_URL } from "../helpers/msw.js";
import { runCf } from "../helpers/run-cf.js";

const ZONE_ID = "023e105f4ecef8ad9ca31a8372d0c353";
const VALID_UNTIL = "2999-01-01T00:00:00.000Z";

function storeToken(oauth_token: string, expiration_time = VALID_UNTIL) {
	writeAuthConfigFile({
		oauth_token,
		refresh_token: "refresh-token",
		expiration_time,
		scopes: ["zone.read"],
	});
}

const authError = () =>
	HttpResponse.json(
		{
			success: false,
			errors: [{ code: 10000, message: "Authentication error" }],
		},
		{ status: 401 }
	);

/**
 * Accept only `accepted`. When `rotateTo` is set, the first request also
 * stores that token, as another cf process refreshing concurrently would.
 */
function purgeHandler(accepted: string, rotateTo?: string) {
	const seen: Array<string | null> = [];
	server.use(
		http.post(
			`${TEST_BASE_URL}/zones/${ZONE_ID}/purge_cache`,
			({ request }) => {
				const auth = request.headers.get("Authorization");
				seen.push(auth);
				if (rotateTo !== undefined && seen.length === 1) {
					storeToken(rotateTo);
				}
				return auth === `Bearer ${accepted}`
					? HttpResponse.json({ success: true, result: { id: ZONE_ID } })
					: authError();
			}
		)
	);
	return seen;
}

function purge(env: Record<string, string | undefined> = {}) {
	return runCf(
		[
			"cache",
			"purge",
			"-z",
			ZONE_ID,
			"--force",
			"--body",
			'{"hosts":["a.com"]}',
		],
		{
			CLOUDFLARE_API_TOKEN: undefined,
			CLOUDFLARE_API_BASE_URL: TEST_BASE_URL,
			...env,
		}
	);
}

describe("OAuth token recovery", () => {
	runInTempDir();
	setupMsw();
	const std = mockConsoleMethods();

	it("retries with the token another process stored after a refresh", async () => {
		storeToken("token-a");
		const seen = purgeHandler("token-b", "token-b");

		await expect(purge()).resolves.toEqual({ exitCode: 0 });

		expect(seen).toEqual(["Bearer token-a", "Bearer token-b"]);
		expect(JSON.parse(std.out)).toEqual({ id: ZONE_ID });
	});

	it("refreshes and retries when the token expired during the command", async () => {
		storeToken("token-a");
		let refreshes = 0;
		server.use(
			http.post("https://dash.cloudflare.com/oauth2/token", () => {
				refreshes += 1;
				return HttpResponse.json({
					access_token: "token-b",
					refresh_token: "new-refresh-token",
					expires_in: 3600,
					scope: "zone.read",
					token_type: "bearer",
				});
			})
		);
		const seen: Array<string | null> = [];
		server.use(
			http.post(
				`${TEST_BASE_URL}/zones/${ZONE_ID}/purge_cache`,
				({ request }) => {
					const auth = request.headers.get("Authorization");
					seen.push(auth);
					if (seen.length === 1) {
						storeToken("token-a", "2000-01-01T00:00:00.000Z");
					}
					return auth === "Bearer token-b"
						? HttpResponse.json({ success: true, result: { id: ZONE_ID } })
						: authError();
				}
			)
		);

		await expect(purge()).resolves.toEqual({ exitCode: 0 });

		expect(refreshes).toBe(1);
		expect(seen).toEqual(["Bearer token-a", "Bearer token-b"]);
	});

	it("does not retry when the stored token is the one that was rejected", async () => {
		storeToken("token-a");
		const seen = purgeHandler("token-b");

		await expect(purge()).rejects.toThrow();

		expect(seen).toEqual(["Bearer token-a"]);
	});

	it("does not replace a rejected environment token with stored OAuth credentials", async () => {
		storeToken("token-b");
		const seen = purgeHandler("token-b");

		await expect(
			purge({ CLOUDFLARE_API_TOKEN: "env-token" })
		).rejects.toThrow();

		expect(seen).toEqual(["Bearer env-token"]);
	});

	it("retries raw requests with the current stored token", async () => {
		storeToken("token-a");
		const seen: Array<string | null> = [];
		server.use(
			http.get(`${TEST_BASE_URL}/raw`, ({ request }) => {
				const auth = request.headers.get("Authorization");
				seen.push(auth);
				if (seen.length === 1) {
					storeToken("token-b");
				}
				return auth === "Bearer token-b" ? new HttpResponse("ok") : authError();
			})
		);
		vi.stubEnv("CLOUDFLARE_API_TOKEN", undefined);
		vi.stubEnv("CLOUDFLARE_API_BASE_URL", TEST_BASE_URL);

		const bytes = await fetchRawBytes("/raw");

		expect(bytes.toString()).toBe("ok");
		expect(seen).toEqual(["Bearer token-a", "Bearer token-b"]);
	});
});

describe("withTokenRecovery", () => {
	const rejected = () => new Response(null, { status: 401 });

	it("does not replay a streamed body", async () => {
		const fetchImpl = vi.fn(async () => rejected());
		const recover = vi.fn(async () => "token-b");
		const fetch = withTokenRecovery(fetchImpl, recover);

		const response = await fetch("https://example.test", {
			method: "PUT",
			headers: { Authorization: "Bearer token-a" },
			body: new ReadableStream(),
		});

		expect(response.status).toBe(401);
		expect(fetchImpl).toHaveBeenCalledTimes(1);
		expect(recover).not.toHaveBeenCalled();
	});

	it("keeps the rejected response when recovery fails", async () => {
		const fetchImpl = vi.fn(async () => rejected());
		const fetch = withTokenRecovery(fetchImpl, async () => {
			throw new Error("refresh failed");
		});

		const response = await fetch("https://example.test", {
			headers: { Authorization: "Bearer token-a" },
		});

		expect(response.status).toBe(401);
		expect(fetchImpl).toHaveBeenCalledTimes(1);
	});

	it("reports the recovered token and preserves other headers", async () => {
		const fetchImpl = vi
			.fn<typeof globalThis.fetch>()
			.mockResolvedValueOnce(rejected())
			.mockResolvedValueOnce(new Response("ok"));
		const onRecovered = vi.fn();
		const fetch = withTokenRecovery(
			fetchImpl,
			async () => "token-b",
			onRecovered
		);

		const response = await fetch("https://example.test", {
			method: "POST",
			headers: { Authorization: "Bearer token-a", "X-Custom": "1" },
			body: "{}",
		});

		expect(await response.text()).toBe("ok");
		expect(onRecovered).toHaveBeenCalledWith("token-b");
		const retried = new Headers(fetchImpl.mock.calls[1]?.[1]?.headers);
		expect(retried.get("Authorization")).toBe("Bearer token-b");
		expect(retried.get("X-Custom")).toBe("1");
		expect(fetchImpl.mock.calls[1]?.[1]?.body).toBe("{}");
	});
});
