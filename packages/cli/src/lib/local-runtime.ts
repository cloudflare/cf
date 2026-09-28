/** Miniflare lifecycle for `--local`. Loaded only through `local.ts`. */
import { randomUUID } from "node:crypto";
import { mkdtempSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { getCfConfigPath } from "@cloudflare/workers-auth/cf";
import { Miniflare } from "miniflare";
import { NO_LOCAL_EQUIVALENT } from "./local.js";
import { getCloudflareRegistryPath } from "./registry.js";

const COMPATIBILITY_DATE = "2026-08-15";
const LOCAL_EXPLORER_URL = "http://localhost/cdn-cgi/local/explorer/api";
const PRODUCTION_API_BASE = "https://api.cloudflare.com/client/v4";
const ACCOUNT_PATH_RE = /^\/accounts\/[^/]+/;

// Miniflare requires one Worker, but requests go directly to the explorer.
const INERT_WORKER =
	"export default { fetch() { return new Response(null, { status: 404 }); } };";

function resolvePersistRoot(persistTo?: string): string {
	const root =
		persistTo !== undefined && persistTo !== ""
			? join(resolve(process.cwd(), persistTo), "v3")
			: join(getCfConfigPath(), "state", "v3");
	try {
		if (!statSync(root).isDirectory()) {
			throw new Error(`Local persistence path must be a directory: ${root}`);
		}
	} catch (error) {
		const code = (error as NodeJS.ErrnoException).code;
		if (code === "ENOENT") {
			// Miniflare creates a persistence tree on first use.
			return root;
		}
		if (code === "ENOTDIR") {
			throw new Error(`Local persistence path must be a directory: ${root}`);
		}
		throw error;
	}
	return root;
}

interface LocalSession {
	mf: Miniflare;
	isolatedPersistRoot: string;
}

let session: LocalSession | undefined;

function startSession(persistRoot: string): LocalSession {
	const registryPath = getCloudflareRegistryPath();
	const isolatedPersistRoot = mkdtempSync(
		join(tmpdir(), `cf-local-isolated-${process.pid}-`)
	);
	try {
		const mf = new Miniflare({
			unsafeLocalExplorer: true,
			// The inert worker and explorer do not consume real Request.cf data.
			// Keep local commands offline and avoid writing a project-level cache.
			cf: false,
			resourcePersistencePath: persistRoot,
			unsafeEnableSharedStorage: true,
			isolatedResourcePersistencePath: isolatedPersistRoot,
			unsafeDevRegistryPath: registryPath,
			workers: [
				{
					config: {
						name: `cf-local-${randomUUID()}`,
						compatibilityDate: COMPATIBILITY_DATE,
						manifest: {
							mainModule: "cf-local.mjs",
							modules: {
								"cf-local.mjs": {
									type: "esm",
									contents: INERT_WORKER,
								},
							},
						},
					},
				},
			],
			// No port: use an ephemeral loopback port.
		} as ConstructorParameters<typeof Miniflare>[0]);

		return { mf, isolatedPersistRoot };
	} catch (error) {
		rmSync(isolatedPersistRoot, { recursive: true, force: true });
		throw error;
	}
}

// Return error envelopes because the SDK discards messages from thrown fetch
// errors. See test_bugs/sdk-swallows-fetch-errors.md.
export async function dispatchLocal(
	request: Request,
	persistTo?: string,
	apiBaseUrl?: string
): Promise<Response> {
	const requestUrl = new URL(request.url);
	const basePath = new URL(apiBaseUrl ?? PRODUCTION_API_BASE).pathname.replace(
		/\/+$/,
		""
	);
	const path = requestUrl.pathname.slice(basePath.length);
	const stripped = path.replace(ACCOUNT_PATH_RE, "") || "/";
	const url = `${LOCAL_EXPLORER_URL}${stripped}${requestUrl.search}`;
	const headers = new Headers(request.headers);
	headers.delete("Authorization");
	headers.set("Host", "localhost");

	let active: LocalSession;
	try {
		active = session ??= startSession(resolvePersistRoot(persistTo));
	} catch (error) {
		return errorEnvelope(
			500,
			`Could not start the local runtime: ${describe(error)}`
		);
	}

	let response: Response;
	try {
		// Miniflare uses its own undici types, so pass a plain init.
		const init: Record<string, unknown> = {
			method: request.method,
			headers: [...headers],
			redirect: "manual",
			signal: request.signal,
		};
		if (request.body !== null) {
			init.body = request.body;
			init.duplex = "half";
		}
		response = (await active.mf.dispatchFetch(
			url,
			init as Parameters<Miniflare["dispatchFetch"]>[1]
		)) as unknown as Response;
	} catch (error) {
		return errorEnvelope(
			500,
			`The local runtime failed to answer: ${describe(error)}`
		);
	}

	if (
		response.status === 404 &&
		response.headers.get("content-type")?.includes("json") !== true
	) {
		// Explorer resource errors are JSON; Hono's unmatched route is not.
		await response.body?.cancel();
		const route = new URL(url).pathname.replace(/^.*\/explorer\/api/, "");
		return errorEnvelope(
			404,
			`${NO_LOCAL_EQUIVALENT} The local explorer API does not ` +
				`implement ${request.method} ${route}.`
		);
	}
	return response;
}

function errorEnvelope(status: number, message: string): Response {
	return new Response(
		JSON.stringify({
			success: false,
			errors: [{ message }],
			messages: [],
			result: null,
		}),
		{ status, headers: { "content-type": "application/json" } }
	);
}

function describe(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}

// Disposal is required: workerd and the loopback server keep Node alive.
export async function disposeLocalSession(): Promise<void> {
	const active = session;
	session = undefined;
	if (active === undefined) {
		return;
	}
	try {
		const { mf, isolatedPersistRoot } = active;
		await mf
			.dispose()
			.finally(() =>
				rmSync(isolatedPersistRoot, { recursive: true, force: true })
			);
	} catch {
		// Never mask the command's outcome with cleanup failure.
	}
}
