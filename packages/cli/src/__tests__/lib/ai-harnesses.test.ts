import { readFileSync, statSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { runInTempDir } from "@cloudflare/workers-utils/test-helpers";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import {
	assertGatewayId,
	createHarnessToken,
	resolveHarnessSettings,
	resolveHarnessToken,
} from "../../lib/ai-harnesses.js";

describe("resolveHarnessSettings", () => {
	runInTempDir();

	// Resolved per test: runInTempDir() changes the cwd after module load, so a
	// module-scoped path would write into the package directory instead.
	let configPath: string;

	beforeEach(() => {
		configPath = join(process.cwd(), "agents.json");
		vi.stubEnv("CF_AGENTS_CONFIG_PATH", configPath);
	});

	it("uses shipped defaults", () => {
		expect(resolveHarnessSettings("opencode")).toEqual({
			model: "openai/gpt-5.5",
			gateway: undefined,
			endpoint: undefined,
		});
	});

	it("loads a Codex model from the shared user config", async () => {
		await writeFile(
			configPath,
			JSON.stringify({
				version: 1,
				harnesses: { codex: { model: "openai/gpt-5.5" } },
			})
		);

		expect(resolveHarnessSettings("codex")).toEqual({
			gateway: undefined,
			endpoint: undefined,
			model: "openai/gpt-5.5",
		});
	});

	it("loads a Pi model from the shared user config", async () => {
		await writeFile(
			configPath,
			JSON.stringify({
				version: 1,
				harnesses: { pi: { model: "anthropic/claude-sonnet-5" } },
			})
		);

		expect(resolveHarnessSettings("pi")).toEqual({
			gateway: undefined,
			endpoint: undefined,
			model: "anthropic/claude-sonnet-5",
		});
	});

	it("loads a user gateway and harness model", async () => {
		await writeFile(
			configPath,
			JSON.stringify({
				version: 1,
				gateway: "coding-agents",
				harnesses: { opencode: { model: "anthropic/claude-sonnet-5" } },
			})
		);

		expect(resolveHarnessSettings("opencode")).toEqual({
			gateway: "coding-agents",
			endpoint: undefined,
			model: "anthropic/claude-sonnet-5",
		});
	});

	it("rejects a gateway and endpoint together", async () => {
		expect(() =>
			resolveHarnessSettings("opencode", {
				gateway: "default",
				endpoint: "https://ai.example.com",
			})
		).toThrow("--gateway and --endpoint cannot be used together");
	});

	it("rejects a configured gateway and endpoint together", async () => {
		await writeFile(
			configPath,
			JSON.stringify({
				gateway: "default",
				endpoint: "https://ai.example.com",
			})
		);

		expect(() => resolveHarnessSettings("opencode")).toThrow(
			"--gateway and --endpoint cannot be used together"
		);
	});

	it("lets flags override user settings", async () => {
		await writeFile(
			configPath,
			JSON.stringify({
				gateway: "coding-agents",
				harnesses: { opencode: { model: "openai/gpt-5.5" } },
			})
		);

		expect(
			resolveHarnessSettings("opencode", {
				gateway: "other-gateway",
				model: "openai/gpt-4.1-mini",
			})
		).toEqual({
			gateway: "other-gateway",
			endpoint: undefined,
			model: "openai/gpt-4.1-mini",
		});
	});

	it("rejects credentials in the user config", async () => {
		await writeFile(configPath, JSON.stringify({ token: "secret" }));

		expect(() => resolveHarnessSettings("opencode")).toThrow(
			"must not contain credentials"
		);
	});

	it("rejects nested credentials in harness settings", async () => {
		await writeFile(
			configPath,
			JSON.stringify({ harnesses: { opencode: { apiKey: "secret" } } })
		);

		expect(() => resolveHarnessSettings("opencode")).toThrow(
			"must not contain credentials"
		);
	});

	it("rejects unknown harness settings", async () => {
		await writeFile(
			configPath,
			JSON.stringify({ harnesses: { opencode: { temperature: 0 } } })
		);

		expect(() => resolveHarnessSettings("opencode")).toThrow(
			"unknown setting opencode.temperature"
		);
	});

	it("rejects unknown harnesses", async () => {
		await writeFile(
			configPath,
			JSON.stringify({ harnesses: { unknown: { model: "openai/gpt-5.5" } } })
		);

		expect(() => resolveHarnessSettings("opencode")).toThrow(
			"unknown harness unknown"
		);
	});
});

describe("assertGatewayId", () => {
	it("accepts gateway IDs", () => {
		expect(() => assertGatewayId("default")).not.toThrow();
	});

	it("directs custom-domain URLs to --endpoint", () => {
		expect(() => assertGatewayId("https://ai.example.com")).toThrow(
			"Use --endpoint https://ai.example.com"
		);
	});
});

describe("createHarnessToken", () => {
	it("creates a one-year account-scoped AI Gateway token", async () => {
		const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
			new Response(
				JSON.stringify({
					success: true,
					result: { id: "child-token-id", value: "child-token-value" },
				}),
				{ status: 200 }
			)
		);
		vi.stubGlobal("fetch", fetchMock);

		await expect(
			createHarnessToken(
				"parent-token",
				"account-id",
				"https://api.cloudflare.com/client/v4"
			)
		).resolves.toMatchObject({
			id: "child-token-id",
			value: "child-token-value",
		});

		const [call] = fetchMock.mock.calls;
		if (!call) {
			throw new Error("expected a token creation request");
		}
		const [url, request] = call;
		expect(url).toBe("https://api.cloudflare.com/client/v4/user/tokens");
		expect(request).toMatchObject({
			method: "POST",
			headers: {
				Authorization: "Bearer parent-token",
				"Content-Type": "application/json",
			},
		});
		const rawBody = request?.body;
		if (typeof rawBody !== "string") {
			throw new Error("expected a JSON string request body");
		}
		const body = JSON.parse(rawBody);
		expect(body.name).toBe("cf AI harness session");
		expect(body.policies).toEqual([
			{
				effect: "allow",
				resources: { "com.cloudflare.api.account.account-id": "*" },
				permission_groups: [
					{ id: "644535f4ed854494a59cb289d634b257", name: "AI Gateway Run" },
					{ id: "a92d2450e05d4e7bb7d0a64968f83d11", name: "Workers AI Read" },
				],
			},
		]);
		// The API rejects fractional seconds in expires_on.
		expect(body.expires_on).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
		const year = 365 * 24 * 60 * 60 * 1000;
		expect(Date.parse(body.expires_on) - Date.now()).toBeGreaterThan(
			year - 60_000
		);
		expect(Date.parse(body.expires_on) - Date.now()).toBeLessThanOrEqual(year);
	});

	it("surfaces token creation failures", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn<typeof fetch>().mockResolvedValue(
				new Response(
					JSON.stringify({
						success: false,
						errors: [{ message: "not allowed" }],
					}),
					{ status: 403 }
				)
			)
		);

		await expect(
			createHarnessToken(
				"parent-token",
				"account-id",
				"https://api.cloudflare.com/client/v4"
			)
		).rejects.toThrow(
			"Unable to create a scoped AI harness token: not allowed"
		);
	});
});

describe("resolveHarnessToken", () => {
	runInTempDir();

	let cachePath: string;

	beforeEach(() => {
		cachePath = join(process.cwd(), "agents-tokens.json");
		vi.stubEnv("CF_AGENTS_TOKEN_CACHE_PATH", cachePath);
	});

	function mintResponse(id: string, value: string): typeof fetch {
		return vi.fn<typeof fetch>().mockResolvedValue(
			new Response(JSON.stringify({ success: true, result: { id, value } }), {
				status: 200,
			})
		) as unknown as typeof fetch;
	}

	it("mints once and reuses the cached token for later launches", async () => {
		const fetchMock = mintResponse("token-id", "token-value");
		vi.stubGlobal("fetch", fetchMock);

		const first = await resolveHarnessToken(
			"parent-token",
			"account-id",
			"https://api.cloudflare.com/client/v4"
		);
		const second = await resolveHarnessToken(
			"parent-token",
			"account-id",
			"https://api.cloudflare.com/client/v4"
		);

		expect(second).toEqual(first);
		// The mint endpoint is quota-limited, so a second launch must not call it.
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});

	it("writes the cache so only the owner can read the credential", async () => {
		vi.stubGlobal("fetch", mintResponse("token-id", "token-value"));

		await resolveHarnessToken(
			"parent-token",
			"account-id",
			"https://api.cloudflare.com/client/v4"
		);

		expect(statSync(cachePath).mode & 0o777).toBe(0o600);
	});

	it("keeps separate tokens per account", async () => {
		vi.stubGlobal("fetch", mintResponse("first-id", "first-value"));
		await resolveHarnessToken(
			"parent-token",
			"account-one",
			"https://api.cloudflare.com/client/v4"
		);

		vi.stubGlobal("fetch", mintResponse("second-id", "second-value"));
		await resolveHarnessToken(
			"parent-token",
			"account-two",
			"https://api.cloudflare.com/client/v4"
		);

		const cache = JSON.parse(readFileSync(cachePath, "utf8"));
		expect(cache["account-one"].value).toBe("first-value");
		expect(cache["account-two"].value).toBe("second-value");
	});

	it("re-mints when the cached token is close to expiry", async () => {
		const nearlyExpired = new Date(Date.now() + 60_000).toISOString();
		await writeFile(
			cachePath,
			JSON.stringify({
				"account-id": {
					id: "stale-id",
					value: "stale-value",
					expiresOn: nearlyExpired,
				},
			})
		);
		const fetchMock = mintResponse("fresh-id", "fresh-value");
		vi.stubGlobal("fetch", fetchMock);

		const token = await resolveHarnessToken(
			"parent-token",
			"account-id",
			"https://api.cloudflare.com/client/v4"
		);

		expect(token.value).toBe("fresh-value");
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});

	it("re-mints when the cache file is corrupt", async () => {
		await writeFile(cachePath, "not json");
		const fetchMock = mintResponse("fresh-id", "fresh-value");
		vi.stubGlobal("fetch", fetchMock);

		await expect(
			resolveHarnessToken(
				"parent-token",
				"account-id",
				"https://api.cloudflare.com/client/v4"
			)
		).resolves.toMatchObject({ value: "fresh-value" });
	});
});
