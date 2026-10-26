import {
	existsSync,
	mkdirSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { join } from "node:path";
import {
	getCfConfigPath,
	writeAuthConfigFile,
} from "@cloudflare/workers-auth/cf";
import { runInTempDir, seed } from "@cloudflare/workers-utils/test-helpers";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import * as agentContext from "../lib/agent-context.js";
import { getAccountId, getAuthToken } from "../lib/auth.js";
import {
	readAuthCredentials,
	requireTemporaryAccount,
	setTemporaryAccountRequested,
} from "../lib/oauth/index.js";
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
		errorLog.mockClear();
		return () => errorLog.mock.calls.flat().join("\n");
	}

	function captureProvisioningRequests() {
		const requests: string[] = [];
		server.use(
			http.post(/\/provisioning\/previews(?:\/challenge)?$/, ({ request }) => {
				requests.push(request.url);
				return HttpResponse.error();
			})
		);
		return requests;
	}

	it("does not activate a cached temporary account without the flag", async () => {
		const provisioningRequests = captureProvisioningRequests();
		captureStderr();
		await expect(runCf(["kv", "namespaces", "list"], env)).rejects.toThrow(
			"No authentication token found"
		);
		expect(existsSync(cachePath())).toBe(true);
		expect(provisioningRequests).toEqual([]);
	});

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

	it("rejects direct temporary-account requests when the mode is disabled", async () => {
		vi.stubEnv("CLOUDFLARE_ACCOUNT_ID", "existing-account-id");
		vi.stubEnv("CLOUDFLARE_API_TOKEN", "existing-token");
		setTemporaryAccountRequested(false);

		await expect(requireTemporaryAccount()).rejects.toThrow(
			"Temporary accounts require --temporary-account."
		);
	});

	it("activates the account when the token is requested first", async () => {
		captureStderr();
		vi.stubEnv("CLOUDFLARE_ACCOUNT_ID", "configured-account-id");
		vi.stubEnv("CLOUDFLARE_API_TOKEN", undefined);
		setTemporaryAccountRequested(true);
		try {
			await expect(getAuthToken()).resolves.toBe(apiToken);
			await expect(getAccountId()).resolves.toBe(accountId);
		} finally {
			setTemporaryAccountRequested(false);
		}
	});

	describe.each([
		{ command: ["ai", "run", "@cf/test/model"] },
		{ command: ["registrar", "registrations", "create", "example.com"] },
	])("schema-backed help for $command", ({ command }) => {
		it.each([true, false])(
			"never activates or provisions an account (cached: %s)",
			async (cached) => {
				const stderr = captureStderr();
				const log = vi.spyOn(console, "log").mockImplementation(() => {});
				log.mockClear();
				if (!cached) {
					rmSync(cachePath());
				}
				const requests = captureProvisioningRequests();

				for (const eventFlags of [[], ["--event-code", "TEST-EVENT-CODE"]]) {
					await expect(
						runCf(
							[...command, "--help", "--temporary-account", ...eventFlags],
							{
								...env,
								CLOUDFLARE_ACCOUNT_ID: "configured-account-id",
							}
						)
					).resolves.toEqual({ exitCode: 0 });
				}

				expect(requests).toEqual([]);
				expect(stderr()).not.toContain("Temporary account ready:");
				expect(log.mock.calls.flat().join("\n")).toContain("cf auth login");
				expect(existsSync(cachePath())).toBe(cached);
			}
		);
	});

	describe.each([
		{ command: ["ai", "run", "@cf/test/model"] },
		{ command: ["registrar", "registrations", "create", "example.com"] },
	])("schema-backed dry runs for $command", ({ command }) => {
		it.each([true, false])(
			"never activates or provisions an account (cached: %s)",
			async (cached) => {
				const stderr = captureStderr();
				if (!cached) {
					rmSync(cachePath());
				}
				const requests = captureProvisioningRequests();

				await expect(
					runCf([...command, "--dry-run", "--temporary-account"], env)
				).rejects.toThrow(
					"This command's dry run cannot be used with --temporary-account. Remove --dry-run to run the command for real."
				);

				expect(requests).toEqual([]);
				expect(stderr()).not.toContain("Temporary account ready:");
				expect(existsSync(cachePath())).toBe(cached);
			}
		);
	});

	it("previews an AI request body without provisioning a temporary account", async () => {
		captureStderr();
		rmSync(cachePath());
		const requests = captureProvisioningRequests();
		const stdout = vi.spyOn(console, "log").mockImplementation(() => {});
		stdout.mockClear();

		await expect(
			runCf(
				[
					"ai",
					"run",
					"@cf/test/model",
					"--dry-run",
					"--temporary-account",
					"--body",
					'{"prompt":"hello"}',
				],
				env
			)
		).resolves.toEqual({ exitCode: 0 });

		expect(stdout.mock.calls.flat().join("\n")).toContain('"prompt": "hello"');
		expect(requests).toEqual([]);
		expect(existsSync(cachePath())).toBe(false);
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
		expect(stderr()).toContain("rerun this command with `--temporary-account`");
	});

	it.each([undefined, "configured-account-id"])(
		"recommends login after a rejected OAuth refresh (account ID: %s)",
		async (configuredAccountId) => {
			const stderr = captureStderr();
			const provisioningRequests = captureProvisioningRequests();
			const credentials = {
				oauth_token: "expired-token",
				refresh_token: "expired-refresh-token",
				expiration_time: "2000-01-01T00:00:00.000Z",
			};
			writeAuthConfigFile(credentials);
			server.use(
				http.post("https://dash.cloudflare.com/oauth2/token", () =>
					HttpResponse.json({ error: "invalid_grant" }, { status: 400 })
				)
			);

			await expect(
				runCf(["kv", "namespaces", "list"], {
					...env,
					CI: "true",
					CLOUDFLARE_ACCOUNT_ID: configuredAccountId,
				})
			).rejects.toThrow("cf auth login");

			expect(stderr()).not.toContain("--temporary-account");
			expect(provisioningRequests).toEqual([]);
			expect(readAuthCredentials()).toMatchObject(credentials);
		}
	);

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
		const stderr = captureStderr();

		await runCf(["auth", "logout"], env);

		expect(existsSync(cachePath())).toBe(false);
		expect(stderr()).toContain("Cleared temporary preview account.");
	});

	it.each([true, false])(
		"suggests a temporary account from whoami only for agents (agent: %s)",
		async (isAgentic) => {
			const stderr = captureStderr();
			vi.spyOn(process.stdout, "write").mockImplementation(() => true);
			vi.spyOn(console, "log").mockImplementation(() => {});
			const context = agentContext.detectAgentContext({});
			const detection = vi
				.spyOn(agentContext, "detectAgentContext")
				.mockReturnValue({
					...context,
					isAgentic,
				});

			try {
				await runCf(["auth", "whoami"], env);

				if (isAgentic) {
					expect(stderr()).toContain(
						'Ask the user: "I can put this online for 60 minutes'
					);
					expect(stderr()).toContain(
						"complete the temporary-account claim before it expires"
					);
					expect(stderr()).toContain(
						"https://developers.cloudflare.com/workers/platform/claim-deployments/"
					);
					expect(stderr()).toContain(
						"If they agree, run `cf deploy --temporary-account`"
					);
				} else {
					expect(stderr()).not.toContain("cf deploy --temporary-account");
				}
			} finally {
				detection.mockRestore();
			}
		}
	);

	it.each([true, false])(
		"rejects temporary-account flags from whoami without provisioning (cached: %s)",
		async (cached) => {
			captureStderr();
			const log = vi.spyOn(console, "log").mockImplementation(() => {});
			log.mockClear();
			if (!cached) {
				rmSync(cachePath());
			}
			const requests = captureProvisioningRequests();

			for (const eventFlags of [[], ["--event-code", "TEST-EVENT-CODE"]]) {
				await expect(
					runCf(["auth", "whoami", "--temporary-account", ...eventFlags], env)
				).rejects.toThrow(
					"--temporary-account and --event-code are not supported by cf auth whoami."
				);
			}
			await expect(
				runCf(["auth", "whoami", "--event-code", "TEST-EVENT-CODE"], env)
			).rejects.toThrow("--event-code requires --temporary-account.");
			expect(requests).toEqual([]);
			expect(log).not.toHaveBeenCalled();
			expect(existsSync(cachePath())).toBe(cached);
		}
	);

	it.each([
		{ command: ["deploy"], isPreview: false },
		{ command: ["workers", "versions", "create"], isPreview: false },
		{ command: ["workers", "triggers", "deploy"], isPreview: false },
		{ command: ["previews", "deploy", "test-preview"], isPreview: true },
	])(
		"uses the build's compliance region before provisioning for $command",
		async ({ command, isPreview }) => {
			captureStderr();
			rmSync(cachePath());
			const requests = captureProvisioningRequests();
			await seed({
				".cloudflare/output/v0/config.json": JSON.stringify({
					buildContext: { isPreview },
					complianceRegion: "fedramp-high",
				}),
				".cloudflare/output/v0/workers/default/worker.config.json":
					JSON.stringify({
						name: "test-name",
						compatibilityDate: "2025-01-01",
						manifest: {
							type: "complete",
							mainModule: "index.js",
							modules: { "index.js": { type: "esm" } },
						},
					}),
				".cloudflare/output/v0/workers/default/bundle/index.js":
					"export default {};",
			});

			await expect(
				runCf([...command, "--prebuilt", "--temporary-account"], env)
			).rejects.toThrow(
				"Temporary accounts aren't available when the compliance region is not set to public."
			);
			expect(requests).toEqual([]);
		}
	);

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
