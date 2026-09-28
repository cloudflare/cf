import { chmodSync, existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { http, HttpResponse } from "msw";
import { onTestFinished } from "vitest";
import { createFetchResult, msw } from "../../helpers/msw.js";
import { toString } from "../../helpers/serialize-form-data-entry.js";

interface WorkerConfigOverrides extends Record<string, unknown> {
	mainModule?: string | undefined;
	modules?: Record<string, { type: string }> | undefined;
}

export function workerConfig(overrides: WorkerConfigOverrides = {}) {
	const mainModule =
		"mainModule" in overrides ? overrides.mainModule : "index.js";
	const modules =
		"modules" in overrides
			? overrides.modules
			: { "index.js": { type: "esm" } };
	const { mainModule: _, modules: __, ...rest } = overrides;
	return JSON.stringify({
		name: "test-worker",
		compatibilityDate: "2025-01-01",
		manifest:
			mainModule != null
				? { type: "complete", mainModule, modules }
				: undefined,
		...rest,
	});
}

export function buildOutputRootConfig(overrides: Record<string, unknown> = {}) {
	return JSON.stringify({
		buildContext: { isPreview: false },
		...overrides,
	});
}

export const ACCOUNT_ID = "test-account-id";

export async function seedBuildDelegate(): Promise<void> {
	const { seed } = await import("@cloudflare/workers-utils/test-helpers");
	await seed({
		"package.json": JSON.stringify({
			devDependencies: { wrangler: "^4.136.0" },
		}),
		"node_modules/wrangler/package.json": JSON.stringify({
			name: "wrangler",
			version: "4.136.0",
		}),
		"node_modules/wrangler/bin/cf-wrangler.js":
			'#!/usr/bin/env bash\nprintf "%s\\n" "$@" > cf-build-argv.out\nprintf "%s" "$CLOUDFLARE_ACCOUNT_ID" > cf-build-env.out\nexit 0\n',
	});
	chmodSync(
		resolve(process.cwd(), "node_modules/wrangler/bin/cf-wrangler.js"),
		0o755
	);
}

export async function seedDockerMock(
	options: { failPush?: boolean; remoteImageExists?: boolean } = {}
): Promise<string> {
	const { seed } = await import("@cloudflare/workers-utils/test-helpers");
	const dockerPath = resolve(process.cwd(), "mock-docker");
	await seed({
		"mock-docker": [
			"#!/usr/bin/env bash",
			'printf "%s\\n" "$*" >> docker-commands.out',
			...(options.failPush
				? [
						'if [[ "$1" == "push" ]]; then',
						'  printf "push failed\\n" >&2',
						"  exit 1",
						"fi",
					]
				: []),
			'if [[ "$1" == "login" ]]; then',
			"  cat >/dev/null",
			'elif [[ "$1" == "image" && "$2" == "inspect" ]]; then',
			'  if [[ "$5" == "{{ json .RepoDigests }}" ]]; then',
			'    if [[ "$3" == registry*.cloudflare.com/* ]]; then',
			'      repository="${3%:*}"',
			`      printf '["%s@sha256:${"d".repeat(64)}"]\\n' "$repository"`,
			...(options.remoteImageExists
				? [
						"    else",
						`      printf '["registry.cloudflare.com/${ACCOUNT_ID}/api-container@sha256:${"d".repeat(64)}"]\\n'`,
					]
				: ["    else", "      printf '[]\\n'"]),
			"    fi",
			"  else",
			"    printf '123456 4\\n'",
			"  fi",
			'elif [[ "$1" == "manifest" ]]; then',
			options.remoteImageExists
				? `  printf '{"Descriptor":{"digest":"sha256:${"d".repeat(64)}"}}\\n'`
				: "  printf 'not-json\\n'",
			"fi",
		].join("\n"),
	});
	chmodSync(dockerPath, 0o755);
	return dockerPath;
}

export function readDockerCommands(): string[] {
	const commandLog = resolve(process.cwd(), "docker-commands.out");
	return existsSync(commandLog)
		? readFileSync(commandLog, "utf-8").trim().split("\n")
		: [];
}

export function readBuildDelegateArgv(): string[] {
	return readFileSync(resolve(process.cwd(), "cf-build-argv.out"), "utf-8")
		.trim()
		.split("\n");
}

export function buildDelegateWasCalled(): boolean {
	return existsSync(resolve(process.cwd(), "cf-build-argv.out"));
}

export function readBuildDelegateEnvironment(): string {
	return readFileSync(resolve(process.cwd(), "cf-build-env.out"), "utf-8");
}

export function mockDefaultHandlers() {
	msw.use(
		// Dispatch script existence check
		http.get(
			"*/accounts/:accountId/workers/dispatch/namespaces/:dispatchNamespace/scripts/:scriptName",
			() =>
				HttpResponse.json(
					createFetchResult(null, false, [
						{ code: 10092, message: "workers.api.error.not_found" },
					]),
					{ status: 404 }
				),
			{ once: false }
		),
		// Worker existence check — 10007 = worker not found (new worker)
		http.get(
			"*/accounts/:accountId/workers/services/:scriptName",
			() =>
				HttpResponse.json(
					createFetchResult(null, false, [
						{ code: 10007, message: "workers.api.error.not_found" },
					]),
					{ status: 404 }
				),
			{ once: false }
		),
		// Worker metadata used to read subdomain settings
		http.get(
			"*/accounts/:accountId/workers/workers/:scriptName",
			() =>
				HttpResponse.json(
					createFetchResult({
						subdomain: { enabled: false, previews_enabled: false },
					})
				),
			{ once: false }
		),
		// Subdomain update
		http.post(
			"*/accounts/:accountId/workers/scripts/:scriptName/subdomain",
			() =>
				HttpResponse.json(
					createFetchResult({ enabled: false, previews_enabled: false })
				),
			{ once: false }
		),
		// Schedules
		http.put(
			"*/accounts/:accountId/workers/scripts/:scriptName/schedules",
			() => HttpResponse.json(createFetchResult({ schedules: [] })),
			{ once: false }
		),
		// Account subdomain
		http.get(
			"*/accounts/:accountId/workers/subdomain",
			() =>
				HttpResponse.json(createFetchResult({ subdomain: "test-subdomain" })),
			{ once: false }
		),
		// Deployments (versions API)
		http.get(
			"*/accounts/:accountId/workers/scripts/:scriptName/deployments",
			() => HttpResponse.json(createFetchResult({ deployments: [] })),
			{ once: false }
		),
		http.post(
			"*/accounts/:accountId/workers/scripts/:scriptName/deployments",
			() => HttpResponse.json(createFetchResult({})),
			{ once: false }
		),
		// Versions
		http.post(
			"*/accounts/:accountId/workers/scripts/:scriptName/versions",
			() =>
				HttpResponse.json(
					createFetchResult({
						id: "test-version-id",
						startup_time_ms: 0,
						metadata: { has_preview: false },
						resources: { script: { etag: "test-etag" } },
					})
				),
			{ once: false }
		),
		// Script settings
		http.patch(
			"*/accounts/:accountId/workers/scripts/:scriptName/script-settings",
			() => HttpResponse.json(createFetchResult({})),
			{ once: false }
		),
		// Routes
		http.put(
			"*/accounts/:accountId/workers/scripts/:scriptName/routes",
			() => HttpResponse.json(createFetchResult([])),
			{ once: false }
		),
		// Secrets (checked when config has secret bindings)
		http.get(
			"*/accounts/:accountId/workers/scripts/:scriptName/secrets",
			() => HttpResponse.json(createFetchResult([])),
			{ once: false }
		),
		// Zone lookup (for route → zone resolution)
		http.get(
			"*/zones",
			({ request }) => {
				const url = new URL(request.url);
				const name = url.searchParams.get("name");
				return HttpResponse.json(
					createFetchResult(name ? [{ id: "zone-id-for-" + name, name }] : [])
				);
			},
			{ once: false }
		),
		// Zone-level routes (for route conflict detection)
		http.get(
			"*/zones/:zoneId/workers/routes",
			() => HttpResponse.json(createFetchResult([])),
			{ once: false }
		),
		// Custom domains changeset (empty by default)
		http.post(
			"*/accounts/:accountId/workers/scripts/:scriptName/domains/changeset",
			async ({ request }) => {
				const body = (await request.json()) as Array<{
					hostname: string;
				}>;
				return HttpResponse.json(
					createFetchResult({
						added: body.map((d) => ({
							...d,
							id: "",
							service: "",
							environment: "",
							zone_name: "",
							zone_id: "",
							enabled: true,
							previews_enabled: false,
						})),
						removed: [],
						updated: [],
						conflicting: [],
					})
				);
			},
			{ once: false }
		),
		// Custom domains publish
		http.put(
			"*/accounts/:accountId/workers/scripts/:scriptName/domains/records",
			() => HttpResponse.json(createFetchResult(null)),
			{ once: false }
		)
	);
}

export interface UploadCapture {
	scriptName?: string;
	metadata?: Record<string, unknown>;
	modules?: string[];
}

async function captureFormData(
	request: Request,
	params: Record<string, unknown>,
	captured: UploadCapture
): Promise<void> {
	captured.scriptName = String(params.scriptName);
	const formBody = await request.formData();
	captured.metadata = JSON.parse(await toString(formBody.get("metadata")));
	captured.modules = [];
	for (const [name] of formBody.entries()) {
		if (name !== "metadata") {
			captured.modules.push(name);
		}
	}
}

export function mockWorkerUpload(
	captured: UploadCapture = {},
	opts?: {
		dispatchNamespace?: string;
		onRequest?: (request: Request) => void;
	}
): UploadCapture {
	const uploadPath = opts?.dispatchNamespace
		? "*/accounts/:accountId/workers/dispatch/namespaces/:dispatchNamespace/scripts/:scriptName"
		: "*/accounts/:accountId/workers/scripts/:scriptName";
	msw.use(
		...(opts?.dispatchNamespace
			? [
					http.get(
						uploadPath,
						() =>
							HttpResponse.json(
								createFetchResult(null, false, [
									{ code: 10092, message: "workers.api.error.not_found" },
								]),
								{ status: 404 }
							),
						{ once: true }
					),
				]
			: []),
		// Legacy upload path (new workers)
		http.put(
			uploadPath,
			async ({ request, params }) => {
				opts?.onRequest?.(request);
				await captureFormData(request, params, captured);
				return HttpResponse.json(
					createFetchResult({
						id: "test-script-id",
						etag: "test-etag",
						pipeline_hash: "test-pipeline-hash",
						deployment_id: "test-version-id",
						tag: "test-tag",
						default_environment: {
							script: {
								last_deployed_from: "api",
								tag: "test-tag",
							},
						},
					})
				);
			},
			{ once: true }
		),
		// Versioned upload path (existing workers)
		http.post(
			"*/accounts/:accountId/workers/scripts/:scriptName/versions",
			async ({ request, params }) => {
				opts?.onRequest?.(request);
				await captureFormData(request, params, captured);
				return HttpResponse.json(
					createFetchResult({
						id: "test-version-id",
						startup_time_ms: 0,
						metadata: { has_preview: false },
						resources: { script: { etag: "test-etag" } },
					})
				);
			},
			{ once: true }
		)
	);
	return captured;
}

export interface AssetCapture {
	sessionStarted: boolean;
	manifest?: Record<string, { hash: string; size: number }>;
	uploadedBuckets: FormData[];
	uploadAuthHeaders: (string | null)[];
}

export interface RoutesCapture {
	body?: unknown;
	called: boolean;
}

export function captureRoutes(): RoutesCapture {
	const captured: RoutesCapture = { called: false };
	msw.use(
		http.put(
			"*/accounts/:accountId/workers/scripts/:scriptName/routes",
			async ({ request }) => {
				captured.called = true;
				captured.body = await request.json();
				return HttpResponse.json(createFetchResult([]));
			},
			{ once: true }
		)
	);
	return captured;
}

export interface CustomDomainsCapture {
	changesetBody?: unknown;
	publishBody?: unknown;
	changesetCalled: boolean;
	publishCalled: boolean;
}

export function captureCustomDomains(opts?: {
	originConflicts?: Array<{
		id: string;
		hostname: string;
		service: string;
		environment: string;
		zone_name: string;
		zone_id: string;
	}>;
}): CustomDomainsCapture {
	const captured: CustomDomainsCapture = {
		changesetCalled: false,
		publishCalled: false,
	};
	msw.use(
		http.post(
			"*/accounts/:accountId/workers/scripts/:scriptName/domains/changeset",
			async ({ request }) => {
				captured.changesetCalled = true;
				const body = (await request.json()) as Array<{
					hostname: string;
				}>;
				captured.changesetBody = body;
				return HttpResponse.json(
					createFetchResult({
						added: body.map((d) => ({
							...d,
							id: "",
							service: "",
							environment: "",
							zone_name: "",
							zone_id: "",
							enabled: true,
							previews_enabled: false,
						})),
						removed: [],
						updated:
							opts?.originConflicts?.map((d) => ({
								...d,
								modified: true,
							})) ?? [],
						conflicting: [],
					})
				);
			},
			{ once: true }
		),
		http.put(
			"*/accounts/:accountId/workers/scripts/:scriptName/domains/records",
			async ({ request }) => {
				captured.publishCalled = true;
				captured.publishBody = await request.json();
				return HttpResponse.json(createFetchResult(null));
			},
			{ once: true }
		)
	);
	return captured;
}

export interface SubdomainCapture {
	getCalled: boolean;
	postCalled: boolean;
	postBody?: unknown;
}

export function captureSubdomain(opts?: {
	currentState?: { enabled: boolean; previews_enabled: boolean };
}): SubdomainCapture {
	const captured: SubdomainCapture = {
		getCalled: false,
		postCalled: false,
	};
	const state = opts?.currentState ?? {
		enabled: false,
		previews_enabled: false,
	};
	msw.use(
		http.get(
			"*/accounts/:accountId/workers/workers/:scriptName",
			() => {
				captured.getCalled = true;
				return HttpResponse.json(createFetchResult({ subdomain: state }));
			},
			{ once: true }
		),
		http.post(
			"*/accounts/:accountId/workers/scripts/:scriptName/subdomain",
			async ({ request }) => {
				captured.postCalled = true;
				captured.postBody = await request.json();
				return HttpResponse.json(createFetchResult({ ...state }));
			},
			{ once: true }
		)
	);
	return captured;
}

export interface ScriptSettingsCapture {
	called: boolean;
	body?: unknown;
}

export function captureScriptSettings(): ScriptSettingsCapture {
	const captured: ScriptSettingsCapture = { called: false };
	msw.use(
		http.patch(
			"*/accounts/:accountId/workers/scripts/:scriptName/script-settings",
			async ({ request }) => {
				captured.called = true;
				captured.body = await request.json();
				return HttpResponse.json(
					createFetchResult(await request.clone().json())
				);
			},
			{ once: true }
		)
	);
	return captured;
}

export interface DeploymentCapture {
	called: boolean;
	body?: Record<string, unknown>;
}

/** Records every request MSW intercepts, including ones a handler answers. */
export function recordRequests(): string[] {
	const requests: string[] = [];
	const onRequest = ({ request }: { request: Request }) => {
		requests.push(`${request.method} ${request.url}`);
	};
	msw.events.on("request:start", onRequest);
	onTestFinished(() => {
		msw.events.removeListener("request:start", onRequest);
	});
	return requests;
}

export function captureDeployment(): DeploymentCapture {
	const captured: DeploymentCapture = { called: false };
	msw.use(
		http.post(
			"*/accounts/:accountId/workers/scripts/:scriptName/deployments",
			async ({ request }) => {
				captured.called = true;
				captured.body = (await request.json()) as Record<string, unknown>;
				return HttpResponse.json(createFetchResult({}));
			},
			{ once: true }
		)
	);
	return captured;
}

export function mockExistingWorker(opts?: {
	tags?: string[] | null;
	lastDeployedFrom?: string;
}) {
	msw.use(
		http.get(
			"*/accounts/:accountId/workers/services/:scriptName",
			() =>
				HttpResponse.json(
					createFetchResult({
						id: "test-service-id",
						default_environment: {
							environment: "production",
							script: {
								tag: "existing-tag",
								tags: opts?.tags ?? null,
								last_deployed_from: opts?.lastDeployedFrom ?? "cf_cli",
							},
						},
					})
				),
			{ once: true }
		)
	);
}

export function mockAssetUpload(opts?: { buckets?: string[][] }): AssetCapture {
	const captured: AssetCapture = {
		sessionStarted: false,
		uploadedBuckets: [],
		uploadAuthHeaders: [],
	};
	const buckets = opts?.buckets ?? [];
	const totalBuckets = buckets.length;

	msw.use(
		http.post(
			"*/accounts/:accountId/workers/scripts/:scriptName/assets-upload-session",
			async ({ request }) => {
				captured.sessionStarted = true;
				const body = (await request.json()) as {
					manifest: Record<string, { hash: string; size: number }>;
				};
				captured.manifest = body.manifest;
				return HttpResponse.json(
					createFetchResult({
						jwt: "test-upload-jwt",
						buckets,
					}),
					{ status: 201 }
				);
			},
			{ once: true }
		),
		http.post(
			"*/accounts/:accountId/workers/assets/upload",
			async ({ request }) => {
				captured.uploadAuthHeaders.push(request.headers.get("Authorization"));
				captured.uploadedBuckets.push(await request.formData());
				const isLast = captured.uploadedBuckets.length >= totalBuckets;
				return HttpResponse.json(
					createFetchResult(isLast ? { jwt: "test-completion-jwt" } : {}),
					{ status: isLast ? 201 : 202 }
				);
			}
		)
	);
	return captured;
}
