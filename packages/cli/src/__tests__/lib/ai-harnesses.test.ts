import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { runInTempDir } from "@cloudflare/workers-utils/test-helpers";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import {
	createHarnessToken,
	resolveHarnessSettings,
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

describe("createHarnessToken", () => {
	it("creates a one-hour account-scoped AI Gateway token", async () => {
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
		).resolves.toEqual({ id: "child-token-id", value: "child-token-value" });

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
		expect(Date.parse(body.expires_on) - Date.now()).toBeGreaterThan(
			59 * 60 * 1000
		);
		expect(Date.parse(body.expires_on) - Date.now()).toBeLessThanOrEqual(
			60 * 60 * 1000
		);
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
