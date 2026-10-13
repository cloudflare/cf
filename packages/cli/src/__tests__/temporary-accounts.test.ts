import {
	existsSync,
	mkdirSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { getCfConfigPath } from "@cloudflare/workers-auth/cf";
import { runInTempDir } from "@cloudflare/workers-utils/test-helpers";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { getAccountId, getAuthToken } from "../lib/auth.js";
import { setTemporaryAccountAllowed } from "../lib/oauth/index.js";
import { server, setupMsw, TEST_BASE_URL } from "./helpers/msw.js";
import { runCf } from "./helpers/run-cf.js";

describe("--temporary-account", () => {
	runInTempDir();
	setupMsw();

	const accountId = "temporary-account-id";
	const apiToken = "temporary-account-token";
	const env = {
		CLOUDFLARE_ACCOUNT_ID: undefined,
		CLOUDFLARE_API_TOKEN: undefined,
		CLOUDFLARE_API_BASE_URL: TEST_BASE_URL,
	};

	beforeEach(() => {
		mkdirSync(getCfConfigPath(), { recursive: true });
		writeFileSync(
			join(getCfConfigPath(), "cloudflare-temporary-account.json"),
			JSON.stringify({
				account: {
					id: accountId,
					name: "Temporary Account",
					apiToken,
					expiresAt: "2999-01-01T00:00:00.000Z",
				},
				claim: {
					url: "https://dash.cloudflare.com/claim-preview",
					expiresAt: "2999-01-02T00:00:00.000Z",
				},
			})
		);
	});

	const cachePath = () =>
		join(getCfConfigPath(), "cloudflare-temporary-account.json");

	/** Mock account provisioning, returning each creation request body. */
	function mockProvisioning(): Array<{ eventCode?: string }> {
		rmSync(cachePath());
		const creationRequests: Array<{ eventCode?: string }> = [];
		server.use(
			http.post(`${TEST_BASE_URL}/provisioning/previews/challenge`, () =>
				HttpResponse.json({
					success: true,
					result: {
						challengeToken: "challenge-token",
						seed: Buffer.alloc(32, 1).toString("base64url"),
						k: 2,
						g: 2,
					},
				})
			),
			http.post(
				`${TEST_BASE_URL}/provisioning/previews`,
				async ({ request }) => {
					const body = (await request.json()) as { eventCode?: string };
					creationRequests.push(body);
					return HttpResponse.json({
						success: true,
						result: {
							account: {
								id: accountId,
								name: "Temporary Account",
								apiToken,
								expiresAt: "2999-01-01T00:00:00.000Z",
							},
							claim: {
								url: "https://dash.cloudflare.com/claim-preview",
								expiresAt: "2999-01-02T00:00:00.000Z",
							},
							...(body.eventCode ? { eventCodeAccepted: true } : {}),
						},
					});
				}
			)
		);
		return creationRequests;
	}

	function mockNamespaceList() {
		server.use(
			http.get(
				`${TEST_BASE_URL}/accounts/${accountId}/storage/kv/namespaces`,
				() => HttpResponse.json({ success: true, result: [] })
			)
		);
		vi.spyOn(process.stdout, "write").mockImplementation(() => true);
	}

	function captureStderr() {
		const errorLog = vi.spyOn(console, "error").mockImplementation(() => {});
		return () => errorLog.mock.calls.flat().join("\n");
	}

	it("uses the temporary account ID and token for generated commands", async () => {
		const stderr = captureStderr();
		let authorization: string | null = null;
		server.use(
			http.get(
				`${TEST_BASE_URL}/accounts/${accountId}/storage/kv/namespaces`,
				({ request }) => {
					authorization = request.headers.get("authorization");
					return HttpResponse.json({ success: true, result: [] });
				}
			)
		);
		vi.spyOn(process.stdout, "write").mockImplementation(() => true);

		const result = await runCf(
			["kv", "namespaces", "list", "--temporary-account"],
			{ ...env, CLOUDFLARE_ACCOUNT_ID: "configured-account-id" }
		);

		expect(result.exitCode).toBe(0);
		expect(authorization).toBe(`Bearer ${apiToken}`);
		expect(stderr()).toContain("https://dash.cloudflare.com/claim-preview");
	});

	it("uses the temporary token for raw-response commands", async () => {
		captureStderr();
		let authorization: string | null = null;
		server.use(
			http.get(
				`${TEST_BASE_URL}/accounts/${accountId}/storage/kv/namespaces/ns/values/key`,
				({ request }) => {
					authorization = request.headers.get("authorization");
					return new HttpResponse("value", {
						headers: { "content-type": "application/octet-stream" },
					});
				}
			)
		);
		vi.spyOn(process.stdout, "write").mockImplementation(() => true);

		const result = await runCf(
			[
				"kv",
				"keys",
				"get",
				"key",
				"--namespace-id",
				"ns",
				"--temporary-account",
			],
			env
		);

		expect(result.exitCode).toBe(0);
		expect(authorization).toBe(`Bearer ${apiToken}`);
	});

	it("activates the account when the token is requested first", async () => {
		captureStderr();
		vi.stubEnv("CLOUDFLARE_ACCOUNT_ID", "configured-account-id");
		vi.stubEnv("CLOUDFLARE_API_TOKEN", undefined);
		setTemporaryAccountAllowed(true);
		try {
			await expect(getAuthToken()).resolves.toBe(apiToken);
			await expect(getAccountId()).resolves.toBe(accountId);
		} finally {
			setTemporaryAccountAllowed(false);
		}
	});

	it("keeps runtime-schema help on the temporary account", async () => {
		captureStderr();
		const model = "@cf/test/model";
		let authorization: string | null = null;
		server.use(
			http.get(
				`${TEST_BASE_URL}/accounts/${accountId}/ai/models/schema`,
				({ request }) => {
					authorization = request.headers.get("authorization");
					expect(new URL(request.url).searchParams.get("model")).toBe(model);
					return HttpResponse.json({
						success: true,
						errors: [],
						result: {
							input: {
								type: "object",
								properties: { prompt: { type: "string" } },
							},
							output: { type: "object" },
						},
					});
				}
			)
		);
		const log = vi.spyOn(console, "log").mockImplementation(() => {});

		const result = await runCf(
			["ai", "run", model, "--help", "--temporary-account"],
			{ ...env, CLOUDFLARE_ACCOUNT_ID: "configured-account-id" }
		);

		expect(result.exitCode).toBe(0);
		expect(authorization).toBe(`Bearer ${apiToken}`);
		expect(log.mock.calls.flat().join("\n")).toContain(
			`Input flags for ${model}`
		);
	});

	it("rejects existing credentials using cf's flag name", async () => {
		captureStderr();
		await expect(
			runCf(["kv", "namespaces", "list", "--temporary-account"], {
				...env,
				CLOUDFLARE_API_TOKEN: "existing-token",
			})
		).rejects.toThrow(/remove `--temporary-account`/);
	});

	it("rejects --local", async () => {
		await expect(
			runCf(["kv", "namespaces", "list", "--temporary-account", "--local"])
		).rejects.toThrow(/--temporary-account cannot be used with --local/);
	});

	it("recommends the flag when a command has no credentials", async () => {
		const stderr = captureStderr();
		await expect(
			runCf(["kv", "namespaces", "list"], {
				...env,
				CLOUDFLARE_ACCOUNT_ID: "configured-account-id",
			})
		).rejects.toThrow("No authentication token found");
		expect(stderr()).toContain("rerun this command with --temporary-account");
	});

	it("creates an event account without persisting or printing the code", async () => {
		const stderr = captureStderr();
		const creationRequests = mockProvisioning();
		mockNamespaceList();
		const eventCode = "ABCD-EFGH-JKMN";

		const result = await runCf(
			[
				"kv",
				"namespaces",
				"list",
				"--temporary-account",
				"--event-code",
				` ${eventCode} `,
			],
			env
		);

		expect(result.exitCode).toBe(0);
		expect(creationRequests).toEqual([expect.objectContaining({ eventCode })]);
		expect(readFileSync(cachePath(), "utf8")).not.toContain(eventCode);
		expect(stderr()).not.toContain(eventCode);
		expect(stderr()).toContain("Temporary account ready:");
	});

	it("rejects an event code when a temporary account is already cached", async () => {
		captureStderr();
		const creationRequests = mockProvisioning();
		mockNamespaceList();

		await runCf(["kv", "namespaces", "list", "--temporary-account"], env);
		await expect(
			runCf(
				[
					"kv",
					"namespaces",
					"list",
					"--temporary-account",
					"--event-code",
					"ABCD-EFGH-JKMN",
				],
				env
			)
		).rejects.toThrow(
			"A temporary account is already cached. Rerun without --event-code to reuse it"
		);
		expect(creationRequests).toEqual([
			expect.not.objectContaining({ eventCode: expect.anything() }),
		]);
	});

	it("requires --temporary-account when --event-code is passed", async () => {
		await expect(
			runCf(["kv", "namespaces", "list", "--event-code", "ABCD-EFGH-JKMN"], env)
		).rejects.toThrow("--event-code requires --temporary-account.");
	});

	it("rejects a blank event code", async () => {
		await expect(
			runCf(
				[
					"kv",
					"namespaces",
					"list",
					"--temporary-account",
					"--event-code",
					"  ",
				],
				env
			)
		).rejects.toThrow("--event-code cannot be empty.");
	});

	it("rejects repeated event codes without exposing their values", async () => {
		const stderr = captureStderr();
		const error = await runCf(
			[
				"kv",
				"namespaces",
				"list",
				"--temporary-account",
				"--event-code",
				"SECRET-CODE-ONE",
				"--event-code",
				"SECRET-CODE-TWO",
			],
			env
		).catch((cause: unknown) => cause);

		expect(String(error)).toContain("--event-code expects a single value.");
		expect(String(error)).not.toContain("SECRET-CODE");
		expect(stderr()).not.toContain("SECRET-CODE");
	});

	it("clears a cached account on logout without OAuth credentials", async () => {
		const log = vi.spyOn(console, "log").mockImplementation(() => {});

		await runCf(["auth", "logout"], env);

		expect(existsSync(cachePath())).toBe(false);
		expect(log.mock.calls.flat().join("\n")).toContain(
			"Cleared temporary preview account."
		);
	});

	it("suggests a temporary account from whoami when unauthenticated", async () => {
		const stderr = captureStderr();
		vi.spyOn(process.stdout, "write").mockImplementation(() => true);
		vi.spyOn(console, "log").mockImplementation(() => {});

		await runCf(["auth", "whoami"], env);

		expect(stderr()).toContain("cf deploy --temporary-account");
	});

	it("rejects the Wrangler flag spelling", async () => {
		await expect(
			runCf(["kv", "namespaces", "list", "--temporary"], env)
		).rejects.toThrow(/Unknown argument: temporary/);
	});

	it("does not expose the flag in help", async () => {
		const log = vi.spyOn(console, "log").mockImplementation(() => {});

		await runCf(["kv", "namespaces", "list", "--help"]);

		const help = log.mock.calls.map((call) => String(call[0])).join("\n");
		expect(help).toContain("--profile");
		expect(help).not.toContain("--temporary-account");
	});
});
