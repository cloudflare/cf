import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import {
	normalizeAndValidateConfig,
	type Config,
} from "@cloudflare/workers-utils";
import {
	isConnectionBinding,
	type ConnectionPermissions,
} from "@cloudflare/workers-utils/oidc";
import {
	runInTempDir,
	seed,
	mockConsoleMethods,
} from "@cloudflare/workers-utils/test-helpers";
import { http, HttpResponse } from "msw/http";
import { describe, it, vi } from "vite-plus/test";
import {
	provisionIdentityConnectors,
	privateConnectorClient,
} from "../../commands/workers/connections/provision.js";
import { createMockDeployContext } from "../helpers/mock-deploy-context.js";
import { msw, setupMsw } from "../helpers/msw.js";
import { runCf } from "../helpers/run-cf.js";
import {
	ACCOUNT_ID,
	buildOutputRootConfig,
	workerConfig,
	seedBuildDelegate,
	readBuildDelegateEnvironment,
	mockDefaultHandlers,
	mockWorkerUpload,
} from "./deploy/helpers.js";

vi.mock("../../lib/deploy-context.js", () => ({
	createDeployContext: (token: string) => createMockDeployContext(token),
}));

const permissions: ConnectionPermissions = {
	scope: ["read"],
	resources: [{ origin: "https://api.example.com", methods: ["GET"] }],
	return_urls: ["http://127.0.0.1:8787/callback"],
};
const oauth = {
	grant: "authorization_code" as const,
	authorization_server: "https://auth.example.com",
	resource: "https://api.example.com",
	authorization_endpoint: "https://auth.example.com/authorize",
	token_endpoint: "https://auth.example.com/token",
	client_registration: {
		mode: "existing" as const,
		authentication: "none" as const,
		client_id: "public",
	},
	permission_ceiling: permissions,
};
const configuredBinding = {
	type: "identity",
	selection: "app",
	connection_management: true,
	...permissions,
	oauth,
};

describe("normal cf identity commands", () => {
	runInTempDir();
	setupMsw();
	mockConsoleMethods();
	async function project() {
		await seedBuildDelegate();
		await seed({
			".cloudflare/output/v0/config.json": buildOutputRootConfig(),
			".cloudflare/output/v0/workers/default/worker.config.json": workerConfig({
				env: { ISSUES: configuredBinding },
			}),
			".cloudflare/output/v0/workers/default/bundle/index.js":
				"export default {fetch(){return new Response('ok')}}",
			".env": `CLOUDFLARE_ACCOUNT_ID=${ACCOUNT_ID}\n`,
		});
	}
	it("apply dry-run builds before account dotenv hydration and never contacts the private service", async ({
		expect,
	}) => {
		await project();
		vi.stubEnv("CLOUDFLARE_ACCOUNT_ID", undefined);
		vi.stubEnv("CLOUDFLARE_API_TOKEN", undefined);
		vi.stubEnv("CLOUDFLARE_IDENTITY_PRIVATE_ENDPOINT", undefined);
		vi.stubEnv("CLOUDFLARE_IDENTITY_PRIVATE_TOKEN", undefined);
		expect(
			await runCf(["workers", "connections", "apply", "--dry-run"])
		).toEqual({ exitCode: 0 });
		expect(readBuildDelegateEnvironment()).toBe("");
		await expect(readFile("cloudflare.identity.json")).rejects.toMatchObject({
			code: "ENOENT",
		});
	});
	it("app setup dry-run has no account, private-service or browser side effects", async ({
		expect,
	}) => {
		await project();
		vi.stubEnv("CLOUDFLARE_ACCOUNT_ID", undefined);
		vi.stubEnv("CLOUDFLARE_API_TOKEN", undefined);
		vi.stubEnv("CLOUDFLARE_IDENTITY_PRIVATE_ENDPOINT", undefined);
		vi.stubEnv("CLOUDFLARE_IDENTITY_PRIVATE_TOKEN", undefined);
		expect(
			await runCf([
				"workers",
				"connections",
				"setup",
				"ISSUES",
				"--dry-run",
				"--no-browser",
			])
		).toEqual({ exitCode: 0 });
		expect(readBuildDelegateEnvironment()).toBe("");
		await expect(readFile("cloudflare.identity.json")).rejects.toMatchObject({
			code: "ENOENT",
		});
	});
	it("noninteractive setup resumes the same operation and reads safe status under its account", async ({
		expect,
	}) => {
		await project();
		mockDefaultHandlers();
		const id = randomUUID(),
			operationId = randomUUID(),
			connectionId = randomUUID();
		await seed({
			".cloudflare/output/v0/workers/default/worker.config.json": workerConfig({
				env: {
					ISSUES: {
						type: "identity",
						selection: "app",
						connection_management: true,
						...permissions,
						connector_id: id,
						connector_revision: 1,
					},
				},
			}),
		});
		vi.stubEnv("CLOUDFLARE_ACCOUNT_ID", ACCOUNT_ID);
		vi.stubEnv("CLOUDFLARE_API_TOKEN", "account-api-token");
		vi.stubEnv(
			"CLOUDFLARE_IDENTITY_PRIVATE_ENDPOINT",
			"https://identity-pilot.example.com"
		);
		vi.stubEnv("CLOUDFLARE_IDENTITY_PRIVATE_TOKEN", "private-token".repeat(4));
		const url =
			"https://identity-pilot.example.com/cdn-cgi/local/identity/setup/" +
			"a".repeat(64);
		let starts = 0,
			polls = 0;
		msw.use(
			http.get(
				`https://identity-pilot.example.com/internal/connectors/${ACCOUNT_ID}/${id}`,
				() =>
					HttpResponse.json({
						id,
						revision: 1,
						definition: {
							scopes: permissions.scope,
							resources: permissions.resources,
							returnUrls: permissions.return_urls,
							inspectionResources: [],
						},
					})
			),
			http.post(
				`https://identity-pilot.example.com/internal/connectors/${ACCOUNT_ID}/app-setup`,
				async ({ request }) => {
					expect(request.headers.get("authorization")).toBe(
						`Bearer ${"private-token".repeat(4)}`
					);
					expect(await request.json()).toMatchObject({
						operationId,
						setup: {
							connectorId: id,
							revision: 1,
							permissions: { scopes: ["read"] },
						},
					});
					starts++;
					return HttpResponse.json({
						operationId,
						url,
						expiresAt: Date.now() + 600000,
					});
				}
			),
			http.get(
				`https://identity-pilot.example.com/internal/connectors/${ACCOUNT_ID}/app-setup/${operationId}`,
				() => {
					polls++;
					return HttpResponse.json({
						operationId,
						state: "complete",
						connectorId: id,
						connectionId,
						expiresAt: Date.now() + 600000,
						access_token: "must-be-discarded",
					});
				}
			)
		);
		for (let i = 0; i < 2; i++) {
			expect(
				await runCf([
					"workers",
					"connections",
					"setup",
					"ISSUES",
					"--prebuilt",
					"--no-browser",
					"--no-wait",
					"--operation",
					operationId,
				])
			).toEqual({ exitCode: 0 });
		}
		expect(
			await runCf([
				"workers",
				"connections",
				"status",
				operationId,
				"--account-id",
				ACCOUNT_ID,
			])
		).toEqual({ exitCode: 0 });
		expect(starts).toBe(2);
		expect(polls).toBe(1);
		expect(vi.mocked(console.log).mock.calls.flat().join(" ")).not.toContain(
			"must-be-discarded"
		);
	});

	it("normal deploy provisions once, uploads a resolved attachment and keeps it for another runner", async ({
		expect,
	}) => {
		await project();
		mockDefaultHandlers();
		const upload = mockWorkerUpload(),
			id = randomUUID();
		vi.stubEnv("CLOUDFLARE_ACCOUNT_ID", ACCOUNT_ID);
		vi.stubEnv("CLOUDFLARE_API_TOKEN", "test-api-token");
		vi.stubEnv(
			"CLOUDFLARE_IDENTITY_PRIVATE_ENDPOINT",
			"https://identity-pilot.example.com"
		);
		vi.stubEnv("CLOUDFLARE_IDENTITY_PRIVATE_TOKEN", "private-token".repeat(4));
		const record = {
			id,
			revision: 1,
			definition: {
				scopes: permissions.scope,
				resources: permissions.resources,
				inspectionResources: [],
				returnUrls: permissions.return_urls,
			},
		};
		let creates = 0;
		msw.use(
			http.get(
				"https://identity-pilot.example.com/internal/connectors/:account/operations/:operation",
				() => new HttpResponse(null, { status: 404 })
			),
			http.post(
				"https://identity-pilot.example.com/internal/connectors/:account",
				({ params, request }) => {
					expect(params.account).toBe(ACCOUNT_ID);
					expect(request.headers.get("authorization")).toBe(
						`Bearer ${"private-token".repeat(4)}`
					);
					creates++;
					return HttpResponse.json(record);
				}
			),
			http.put(
				`https://identity-pilot.example.com/internal/connectors/:account/${id}`,
				() => HttpResponse.json(record)
			),
			http.get(
				`https://identity-pilot.example.com/internal/connectors/:account/${id}`,
				() => HttpResponse.json(record)
			)
		);
		expect(await runCf(["deploy", "--prebuilt"])).toEqual({ exitCode: 0 });
		expect(upload.metadata?.bindings).toContainEqual({
			name: "ISSUES",
			type: "identity",
			selection: "app",
			connection_management: true,
			...permissions,
			connector_id: id,
			connector_revision: 1,
		});
		expect(
			await runCf(["workers", "connections", "apply", "--prebuilt"])
		).toEqual({ exitCode: 0 });
		expect(creates).toBe(1);
		const retained = await readFile("cloudflare.identity.json", "utf8");
		expect(retained).toContain(id);
		expect(retained).not.toContain("client_id");
	});
});
function config(inline = true, id?: string): Config {
	const binding = {
		binding: "ISSUES",
		...permissions,
		...(id ? { connector_id: id, connector_revision: 1 } : {}),
		...(inline ? { oauth } : {}),
	};
	if (!isConnectionBinding(binding)) {
		throw new Error("Invalid fixture");
	}
	return normalizeAndValidateConfig(
		{
			identities: [binding],
		},
		"wrangler.jsonc",
		"cloudflare.config.ts",
		{}
	).config;
}
describe("private identity connector deployment adapter", () => {
	runInTempDir();
	setupMsw();
	it("recovers lost creates and keeps the returned ID across a later failed deployment", async ({
		expect,
	}) => {
		const id = randomUUID();
		let retained: { operationId: string } | undefined;
		const client = {
			get: vi.fn(async () => ({ id, revision: 1, permissions })),
			operation: vi.fn(async (operationId: string) =>
				retained?.operationId === operationId
					? { id, revision: 1, permissions }
					: undefined
			),
			create: vi.fn(async (operationId: string) => {
				retained = { operationId };
				throw new Error("Lost response");
			}),
			reconcile: vi.fn(async () => ({ id, revision: 2, permissions })),
		};
		const options = { accountId: "account-a", realm: "test", client };
		await expect(
			provisionIdentityConnectors(config(), options)
		).rejects.toThrow("Lost response");
		const recovered = await provisionIdentityConnectors(config(), options);
		expect(recovered.identities[0]).toMatchObject({
			connector_id: id,
			connector_revision: 1,
		});
		expect(recovered.identities[0]).not.toHaveProperty("oauth");
		// The adapter returns before upload, so a failed upload leaves this state intact.
		const anotherRunner = await provisionIdentityConnectors(config(), options);
		expect(anotherRunner.identities[0]).toMatchObject({
			connector_id: id,
			connector_revision: 2,
		});
		expect(client.create).toHaveBeenCalledTimes(1);
		expect(await readFile("cloudflare.identity.json", "utf8")).not.toContain(
			"client_id"
		);
		await expect(
			provisionIdentityConnectors(config(), {
				...options,
				accountId: "account-b",
			})
		).rejects.toThrow("another account");
	});
	it("dry-run requires no credentials and writes no retained state", async ({
		expect,
	}) => {
		vi.stubEnv("CLOUDFLARE_IDENTITY_PRIVATE_ENDPOINT", undefined);
		vi.stubEnv("CLOUDFLARE_IDENTITY_PRIVATE_TOKEN", undefined);
		const result = await provisionIdentityConnectors(config(), {
			realm: "test",
			dryRun: true,
		});
		expect(result.identities[0]).toHaveProperty("oauth");
		await expect(readFile("cloudflare.identity.json")).rejects.toMatchObject({
			code: "ENOENT",
		});
	});
	it("scopes private requests to the chosen account and never sends the account API token", async ({
		expect,
	}) => {
		const id = randomUUID();
		vi.stubEnv(
			"CLOUDFLARE_IDENTITY_PRIVATE_ENDPOINT",
			"https://identity-pilot.example.com"
		);
		vi.stubEnv("CLOUDFLARE_IDENTITY_PRIVATE_TOKEN", "private-token".repeat(4));
		vi.stubEnv("CLOUDFLARE_API_TOKEN", "must-not-leave-account-api");
		msw.use(
			http.get(
				`https://identity-pilot.example.com/internal/connectors/account-a/${id}`,
				({ request }) => {
					expect(new URL(request.url).searchParams.get("revision")).toBe("3");
					expect(request.headers.get("authorization")).toBe(
						`Bearer ${"private-token".repeat(4)}`
					);
					return HttpResponse.json({
						id,
						revision: 3,
						definition: {
							scopes: permissions.scope,
							resources: permissions.resources,
							returnUrls: permissions.return_urls,
							inspectionResources: [],
						},
					});
				}
			)
		);
		expect(await privateConnectorClient("account-a").get(id, 3)).toMatchObject({
			id,
			revision: 3,
			permissions,
		});
		vi.stubEnv(
			"CLOUDFLARE_IDENTITY_PRIVATE_ENDPOINT",
			"http://remote.example.com"
		);
		expect(() => privateConnectorClient("account-a")).toThrow(
			"Invalid private"
		);
	});
	it("does not create unknown ID-only attachments or reconcile with --no-provision", async ({
		expect,
	}) => {
		const client = {
			get: vi.fn(async () => {
				throw new Error("Unknown connector");
			}),
			operation: vi.fn(),
			create: vi.fn(),
			reconcile: vi.fn(),
		};
		await expect(
			provisionIdentityConnectors(config(false, randomUUID()), {
				accountId: "a",
				realm: "test",
				client,
			})
		).rejects.toThrow("Unknown connector");
		await expect(
			provisionIdentityConnectors(config(), {
				accountId: "a",
				realm: "test",
				client,
				provision: false,
			})
		).rejects.toThrow("Inline identity setup requires provisioning");
		expect(client.create).not.toHaveBeenCalled();
		expect(client.reconcile).not.toHaveBeenCalled();
	});
});
