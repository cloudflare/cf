import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { getGlobalConfigPath } from "@cloudflare/workers-utils";
import { seed } from "@cloudflare/workers-utils/test-helpers";
import { http, HttpResponse } from "msw/http";
import { describe, it } from "vite-plus/test";
import { mockApiToken } from "../helpers/mock-account-id";
import { mockConsoleMethods } from "../helpers/mock-console";
import { mockPrompt } from "../helpers/mock-dialogs";
import { useMockIsTTY } from "../helpers/mock-istty";
import {
	mockTemporaryPreviewAccount,
	mockTemporaryPreviewChallenge,
	TEMPORARY_TERMS_NOTICE,
	TEMPORARY_TERMS_PROMPT,
	temporaryAccountCachePath,
	writeTemporaryAccountCache,
} from "../helpers/mock-temporary-account";
import { createFetchResult, msw } from "../helpers/msw";
import { runInTempDir } from "../helpers/run-in-tmp";
import { runWrangler } from "../helpers/run-wrangler";

// cf deploys Build Output rather than bundling an entrypoint, so these cases
// seed `.cloudflare/output` and run `cf deploy --prebuilt`. cf spells
// Wrangler's `--temporary` flag `--temporary-account`, accepts it (and
// `--event-code`) globally except on `auth whoami`, and writes temporary-account
// notices to stderr so stdout stays reserved for command output.
describe("deploy", () => {
	runInTempDir();
	const std = mockConsoleMethods();
	const { setIsTTY } = useMockIsTTY();

	describe("authentication", () => {
		mockApiToken({ apiToken: null });

		it("creates a temporary preview account in interactive mode when --temporary is passed", async ({
			expect,
		}) => {
			setIsTTY(true);
			mockPrompt({ text: TEMPORARY_TERMS_PROMPT, result: "yes" });
			await seedBuildOutput();
			const deployRequests = mockDeploy();
			const creationRequests = mockTemporaryPreviewAccount();

			await expect(
				runWrangler("deploy --prebuilt --temporary-account")
			).resolves.toBeUndefined();

			expect(creationRequests).toHaveLength(1);
			expect(creationRequests[0]?.contentType).toBe("application/json");
			expectPreviewAccountRequests(expect, deployRequests);
			expect(std.out).not.toContain("Attempting to login via OAuth...");
			expect(std.err).toContain("Temporary account ready:");
		});

		it("requires --temporary when --event-code is passed", async ({
			expect,
		}) => {
			await expect(
				runWrangler("deploy --prebuilt --event-code ABCD-EFGH-JKMN")
			).rejects.toThrow("--event-code requires --temporary-account");
		});

		it("rejects a blank event code", async ({ expect }) => {
			await expect(
				runWrangler('deploy --prebuilt --temporary-account --event-code "   "')
			).rejects.toThrow("--event-code cannot be empty");
		});

		// cf registers --event-code globally with --temporary-account, so
		// `workers versions create` accepts it as well.
		it.skip("does not accept --event-code on versions upload");

		it("rejects repeated event codes without exposing their values", async ({
			expect,
		}) => {
			const firstCode = "SECRET-CODE-ONE";
			const secondCode = "SECRET-CODE-TWO";
			const error = await runWrangler(
				`deploy --prebuilt --temporary-account --event-code ${firstCode} --event-code ${secondCode}`
			).catch((cause: unknown) => cause);

			expect(String(error)).toContain("--event-code expects a single value");
			expect(String(error)).not.toContain(firstCode);
			expect(String(error)).not.toContain(secondCode);
			expect(std.out).not.toContain(firstCode);
			expect(std.err).not.toContain(firstCode);
		});

		it("provisions an event account before deploying", async ({ expect }) => {
			setIsTTY(true);
			mockPrompt({ text: TEMPORARY_TERMS_PROMPT, result: "yes" });
			await seedBuildOutput();
			const deployRequests = mockDeploy();
			const creationRequests = mockTemporaryPreviewAccount();

			await expect(
				runWrangler(
					'deploy --prebuilt --temporary-account --event-code " ABCD-EFGH-JKMN "'
				)
			).resolves.toBeUndefined();

			expect(creationRequests.map(({ body }) => body)).toEqual([
				expect.objectContaining({ eventCode: "ABCD-EFGH-JKMN" }),
			]);
			expectPreviewAccountRequests(expect, deployRequests);
			expect(readFileSync(temporaryAccountCachePath(), "utf8")).not.toContain(
				"ABCD-EFGH-JKMN"
			);
			expect(std.out).not.toContain("ABCD-EFGH-JKMN");
			expect(std.err).not.toContain("ABCD-EFGH-JKMN");
		});

		it("aborts in interactive mode when the terms are not accepted", async ({
			expect,
		}) => {
			setIsTTY(true);
			mockPrompt({ text: TEMPORARY_TERMS_PROMPT, result: "no" });
			await seedBuildOutput();
			const creationRequests = mockTemporaryPreviewAccount();

			await expect(
				runWrangler("deploy --prebuilt --temporary-account")
			).rejects.toThrow(
				/You must accept Cloudflare's Terms of Service .* to use --temporary-account\./
			);

			expect(creationRequests).toHaveLength(0);
		});

		it("throws when the user is already authenticated and requests a temporary account", async ({
			expect,
		}) => {
			setIsTTY(false);
			await seedBuildOutput();
			const creationRequests = mockTemporaryPreviewAccount();

			await expect(
				runWrangler("deploy --prebuilt --temporary-account", {
					CLOUDFLARE_API_TOKEN: "cached-api-token",
				})
			).rejects.toThrow(
				/You're already authenticated with Cloudflare, so `--temporary-account` can't be used\./
			);

			expect(creationRequests).toHaveLength(0);
			expect(std.err).not.toContain("Temporary account ready:");
		});

		// cf-specific: a Build Output account is the deploy target.
		it("rejects a Build Output account with a temporary account", async ({
			expect,
		}) => {
			setIsTTY(false);
			await seedBuildOutput("configured-account-id");
			const creationRequests = mockTemporaryPreviewAccount();

			await expect(
				runWrangler("deploy --prebuilt --temporary-account")
			).rejects.toThrow(
				'Temporary accounts can\'t be used when a specific account ID ("configured-account-id") is set in your config file.'
			);

			expect(creationRequests).toHaveLength(0);
		});

		describe("with temporary preview accounts", () => {
			it("creates a temporary preview account in non-interactive mode after printing terms notice", async ({
				expect,
			}) => {
				setIsTTY(false);
				await seedBuildOutput();
				const deployRequests = mockDeploy();
				const creationRequests = mockTemporaryPreviewAccount();

				await expect(
					runWrangler("deploy --prebuilt --temporary-account")
				).resolves.toBeUndefined();

				expect(creationRequests).toHaveLength(1);
				expect(creationRequests[0]?.contentType).toBe("application/json");
				expect(creationRequests[0]?.body).toEqual({
					termsOfService: "https://www.cloudflare.com/terms/",
					privacyPolicy: "https://www.cloudflare.com/privacypolicy/",
					acceptTermsOfService: "yes",
					challengeToken: "challenge-token",
					solution: { checkpoints: expect.any(String) },
				});
				const { solution } = (creationRequests[0]?.body ?? {}) as {
					solution: { checkpoints: string };
				};
				// k+1 checkpoints of 32 bytes each (the challenge mock uses k=2).
				expect(Buffer.from(solution.checkpoints, "base64").length).toBe(
					(2 + 1) * 32
				);
				expectPreviewAccountRequests(expect, deployRequests);
				expect(std.out).not.toContain("Attempting to login via OAuth...");
				expect(std.err).toContain(TEMPORARY_TERMS_NOTICE);
				expect(std.err).toContain("Temporary account ready:");
				expect(std.err).toContain("Account: Preview Account Alpha (created)");
				expect(std.err).toContain("Claim within:");

				const cachePath = temporaryAccountCachePath();
				expect(existsSync(cachePath)).toBe(true);
				expect(existsSync(join(process.cwd(), ".wrangler"))).toBe(false);
				if (process.platform !== "win32") {
					const { statSync } = await import("node:fs");
					expect(statSync(cachePath).mode & 0o777).toBe(0o600);
				}
				expect(JSON.parse(readFileSync(cachePath, "utf8"))).toMatchObject({
					account: {
						id: "preview-account-id",
						apiToken: "preview-account-token",
					},
					claim: {
						url: "https://dash.cloudflare.com/claim-preview?claimToken=claim-token",
					},
				});
			});

			it("throws when an OAuth token is on disk, even if it is expired and cannot refresh", async ({
				expect,
			}) => {
				setIsTTY(true);
				// A stored OAuth token counts as being authenticated even when
				// expired, so cf refuses rather than provisioning an account
				// alongside it.
				writeOAuthCredentials({
					oauth_token: "expired-token",
					refresh_token: "expired-refresh-token",
					expiration_time: new Date(Date.now() - 1000).toISOString(),
				});
				await seedBuildOutput();
				const creationRequests = mockTemporaryPreviewAccount();

				await expect(
					runWrangler("deploy --prebuilt --temporary-account")
				).rejects.toThrow(
					/You're already authenticated with Cloudflare, so `--temporary-account` can't be used\./
				);

				expect(creationRequests).toHaveLength(0);
				expect(std.err).not.toContain("Temporary account ready:");
			});

			it("provisions the preview account against the staging API and caches it per-environment", async ({
				expect,
			}) => {
				setIsTTY(true);
				mockPrompt({ text: TEMPORARY_TERMS_PROMPT, result: "yes" });
				await seedBuildOutput();
				const deployRequests = mockDeploy();
				const creationRequests = mockTemporaryPreviewAccount();

				await expect(
					runWrangler("deploy --prebuilt --temporary-account", {
						WRANGLER_API_ENVIRONMENT: "staging",
					})
				).resolves.toBeUndefined();

				expect(creationRequests.map(({ url }) => new URL(url).host)).toEqual([
					"api.staging.cloudflare.com",
				]);
				expectPreviewAccountRequests(expect, deployRequests);
				expect(
					deployRequests.every(
						({ url }) => new URL(url).host === "api.staging.cloudflare.com"
					)
				).toBe(true);
				expect(std.err).toContain("Temporary account ready:");
				expect(std.err).toContain("Account: Preview Account Alpha (created)");
				expect(existsSync(temporaryAccountCachePath("staging"))).toBe(true);
				expect(existsSync(temporaryAccountCachePath())).toBe(false);
			});

			it("reuses a cached temporary preview account for later temporary deploys", async ({
				expect,
			}) => {
				setIsTTY(true);
				mockPrompt({ text: TEMPORARY_TERMS_PROMPT, result: "yes" });
				await seedBuildOutput();
				const deployRequests = mockDeploy();
				const creationRequests = mockTemporaryPreviewAccount();

				await expect(
					runWrangler("deploy --prebuilt --temporary-account")
				).resolves.toBeUndefined();
				await expect(
					runWrangler("deploy --prebuilt --temporary-account")
				).resolves.toBeUndefined();

				expect(creationRequests).toHaveLength(1);
				expectPreviewAccountRequests(expect, deployRequests);
				expect(std.err).toContain("Temporary account ready:");
				expect(std.err).toContain("Account: Preview Account Alpha (reused)");
			});

			it("treats a malformed temporary preview account cache as a miss and refetches", async ({
				expect,
			}) => {
				setIsTTY(true);
				mockPrompt({ text: TEMPORARY_TERMS_PROMPT, result: "yes" });
				await seedBuildOutput();
				// The cache passes a top-level shape check but lacks the nested
				// account and claim fields.
				writeTemporaryAccountCache({ account: {}, claim: {} });
				const deployRequests = mockDeploy();
				const creationRequests = mockTemporaryPreviewAccount();

				await expect(
					runWrangler("deploy --prebuilt --temporary-account")
				).resolves.toBeUndefined();

				expect(creationRequests).toHaveLength(1);
				expectPreviewAccountRequests(expect, deployRequests);
				expect(std.err).toContain("Account: Preview Account Alpha (created)");
				expect(
					JSON.parse(readFileSync(temporaryAccountCachePath(), "utf8"))
				).toMatchObject({
					account: { id: "preview-account-id" },
					claim: {
						url: "https://dash.cloudflare.com/claim-preview?claimToken=claim-token",
					},
				});
			});

			it("should fail clearly if the temporary preview account request fails", async ({
				expect,
			}) => {
				setIsTTY(true);
				mockPrompt({ text: TEMPORARY_TERMS_PROMPT, result: "yes" });
				await seedBuildOutput();
				mockTemporaryPreviewChallenge();
				msw.use(
					http.post(
						"*/provisioning/previews",
						() =>
							new HttpResponse(null, {
								status: 500,
								statusText: "Internal Server Error",
							})
					)
				);

				await expect(
					runWrangler("deploy --prebuilt --temporary-account")
				).rejects.toThrow(
					"Failed to create a temporary preview account (500 Internal Server Error)."
				);
			});

			it("fails the deploy when the proof-of-work challenge can't be obtained", async ({
				expect,
			}) => {
				setIsTTY(true);
				mockPrompt({ text: TEMPORARY_TERMS_PROMPT, result: "yes" });
				await seedBuildOutput();
				let previewRequests = 0;
				msw.use(
					http.post(
						"*/provisioning/previews/challenge",
						() =>
							new HttpResponse(null, {
								status: 500,
								statusText: "Internal Server Error",
							})
					),
					http.post("*/provisioning/previews", () => {
						previewRequests++;
						return HttpResponse.json({});
					})
				);

				await expect(
					runWrangler("deploy --prebuilt --temporary-account")
				).rejects.toThrow(
					"Failed to request a proof-of-work challenge (500 Internal Server Error)."
				);
				expect(previewRequests).toBe(0);
			});
		});
	});
});

async function seedBuildOutput(accountId?: string): Promise<void> {
	await seed({
		".cloudflare/output/v0/config.json": JSON.stringify({
			buildContext: { isPreview: false },
			accountId,
		}),
		".cloudflare/output/v0/workers/default/worker.config.json": JSON.stringify({
			name: "test-name",
			compatibilityDate: "2025-01-01",
			manifest: {
				type: "complete",
				mainModule: "index.js",
				modules: { "index.js": { type: "esm" } },
			},
		}),
		".cloudflare/output/v0/workers/default/bundle/index.js":
			"export default { fetch() { return new Response('ok'); } }",
	});
}

function writeOAuthCredentials(credentials: Record<string, string>): void {
	const authFile = join(
		getGlobalConfigPath({
			appName: "cloudflare",
			leadingDot: false,
			useLegacyHomeDir: false,
		}),
		"config",
		"default.json"
	);
	mkdirSync(dirname(authFile), { recursive: true });
	writeFileSync(authFile, JSON.stringify(credentials));
}

interface DeployRequest {
	accountId: string;
	authorization: string | null;
	url: string;
}

function expectPreviewAccountRequests(
	expect: (value: unknown) => {
		toBeGreaterThan(value: number): void;
		toEqual(value: unknown): void;
	},
	requests: DeployRequest[]
): void {
	expect(requests.length).toBeGreaterThan(0);
	expect(new Set(requests.map(({ accountId }) => accountId))).toEqual(
		new Set(["preview-account-id"])
	);
	expect(new Set(requests.map(({ authorization }) => authorization))).toEqual(
		new Set(["Bearer preview-account-token"])
	);
}

/**
 * Mock the account-scoped requests cf makes to deploy a new Worker.
 *
 * @returns Each request's account, authorization, and URL as it arrives.
 */
function mockDeploy(): DeployRequest[] {
	const requests: DeployRequest[] = [];
	const record = (request: Request, accountId: unknown) => {
		requests.push({
			accountId: String(accountId),
			authorization: request.headers.get("Authorization"),
			url: request.url,
		});
	};
	msw.use(
		http.get(
			"*/accounts/:accountId/workers/services/:scriptName",
			({ request, params }) => {
				record(request, params.accountId);
				return HttpResponse.json(
					createFetchResult(null, false, [
						{ code: 10007, message: "workers.api.error.not_found" },
					]),
					{ status: 404 }
				);
			}
		),
		http.put(
			"*/accounts/:accountId/workers/scripts/:scriptName",
			({ request, params }) => {
				record(request, params.accountId);
				return HttpResponse.json(
					createFetchResult({
						id: "test-script-id",
						etag: "test-etag",
						deployment_id: "test-version-id",
						default_environment: {
							script: { last_deployed_from: "wrangler", tag: "test-tag" },
						},
					})
				);
			}
		),
		http.get(
			"*/accounts/:accountId/workers/subdomain",
			({ request, params }) => {
				record(request, params.accountId);
				return HttpResponse.json(
					createFetchResult({ subdomain: "test-sub-domain" })
				);
			}
		),
		http.get(
			"*/accounts/:accountId/workers/workers/:scriptName",
			({ request, params }) => {
				record(request, params.accountId);
				return HttpResponse.json(
					createFetchResult({
						subdomain: { enabled: false, previews_enabled: false },
					})
				);
			}
		),
		http.post(
			"*/accounts/:accountId/workers/scripts/:scriptName/subdomain",
			({ request, params }) => {
				record(request, params.accountId);
				return HttpResponse.json(
					createFetchResult({ enabled: true, previews_enabled: true })
				);
			}
		),
		http.put(
			"*/accounts/:accountId/workers/scripts/:scriptName/schedules",
			({ request, params }) => {
				record(request, params.accountId);
				return HttpResponse.json(createFetchResult({ schedules: [] }));
			}
		),
		http.get(
			"*/accounts/:accountId/workers/scripts/:scriptName/deployments",
			({ request, params }) => {
				record(request, params.accountId);
				return HttpResponse.json(createFetchResult({ deployments: [] }));
			}
		)
	);
	return requests;
}
