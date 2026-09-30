import {
	CloudflareApiClient,
	CloudflareApiEnvironment,
	CloudflareApiError,
} from "#sdk";
import { getAuthFromEnv } from "@cloudflare/workers-auth";
import { getCloudflareApiBaseUrl } from "@cloudflare/workers-utils";
import { API_TIMEOUT_MS, getApiTimeoutMs } from "./api-timeout.js";
import { getComplianceRegion, resolveAccountIdSilent } from "./context.js";
import { getValidToken as getOAuthToken } from "./oauth/index.js";
import { getDefaultHeaders } from "./request-headers.js";
import type { BaseClientOptions } from "#sdk";

// Re-export context helpers used by generated commands and hand-written paths.
export { getAccountId, getWorkerName, getZoneId } from "./context.js";
export { getComplianceRegion, resolveAccountIdSilent };
// Re-export OAuth functions for auth commands
export {
	fetchAuthorizedAccounts,
	getActiveProfile,
	getConfigPath,
	getProfileStore,
	getValidToken,
	isOAuthLoggedIn,
	login,
	logout,
	readAuthCredentials,
	setProfile,
} from "./oauth/index.js";

export { API_TIMEOUT_MS } from "./api-timeout.js";
const DEFAULT_BASE_URL = CloudflareApiEnvironment.Default;

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface PassthroughOptions {
	body?: unknown;
	query?: Record<string, unknown>;
	headers?: Record<string, string>;
	signal?: AbortSignal;
	timeout?: number;
	/** Return non-JSON response bodies as exact bytes instead of UTF-8 text. */
	preserveNonJsonBytes?: boolean;
}

export type Cloudflare = CloudflareApiClient;

interface CloudflareClientOptions {
	apiToken: string;
	baseURL?: string;
	timeout?: number;
	fetch?: typeof globalThis.fetch;
	defaultHeaders?: Record<string, string>;
}

interface CloudflareAPIResponse<T> {
	result?: T;
	success?: boolean;
	errors?: Array<{ code?: number; message?: string }>;
	messages?: Array<{ code?: number; message?: string }>;
}

function isRawBody(body: unknown): body is BodyInit {
	return (
		body instanceof FormData ||
		body instanceof Blob ||
		body instanceof ArrayBuffer ||
		ArrayBuffer.isView(body) ||
		body instanceof ReadableStream ||
		body instanceof URLSearchParams
	);
}

function hasContentType(headers: Record<string, string>): boolean {
	return Object.keys(headers).some(
		(key) => key.toLowerCase() === "content-type"
	);
}

async function parseErrorResponse(response: Response): Promise<unknown> {
	const contentType = response.headers.get("content-type") ?? "";
	try {
		return contentType.includes("application/json")
			? await response.json()
			: await response.text();
	} catch {
		return null;
	}
}

function appendQueryValue(
	params: URLSearchParams,
	key: string,
	value: unknown
): void {
	if (value === undefined || value === null || value === "") {
		return;
	}
	if (Array.isArray(value)) {
		for (const item of value) {
			appendQueryValue(params, key, item);
		}
		return;
	}
	params.append(key, String(value as string | number | boolean));
}

export function queryParamsToString(
	queryParams: Record<string, unknown>
): string {
	const params = new URLSearchParams();
	for (const [key, value] of Object.entries(queryParams)) {
		appendQueryValue(params, key, value);
	}
	return params.toString();
}

function passthroughUrl(
	path: string,
	baseURL: string,
	query?: Record<string, unknown>
): string {
	const base = new URL(baseURL.endsWith("/") ? baseURL : `${baseURL}/`);
	const url = new URL(path.startsWith("/") ? path.slice(1) : path, base);
	if (url.origin !== base.origin) {
		throw new Error(
			`Refusing to send an authenticated request to ${url.origin} (expected ${base.origin})`
		);
	}
	const search = queryParamsToString(query ?? {});
	if (search) {
		url.search = search;
	}
	return url.toString();
}

const clientBaseUrls = new WeakMap<CloudflareApiClient, string>();
const clientTimeouts = new WeakMap<CloudflareApiClient, number>();

export async function requestApi<T>(
	client: CloudflareApiClient,
	method: HttpMethod,
	path: string,
	options: PassthroughOptions = {}
): Promise<T> {
	const baseURL = clientBaseUrls.get(client) ?? DEFAULT_BASE_URL;
	const url = passthroughUrl(path, baseURL, options.query);
	const headers: Record<string, string> = { ...options.headers };
	let body: BodyInit | undefined;
	if (options.body !== undefined) {
		if (
			isRawBody(options.body) ||
			(typeof options.body === "string" && hasContentType(headers))
		) {
			body = options.body;
		} else {
			headers["Content-Type"] ??= "application/json";
			body = JSON.stringify(options.body);
		}
	}

	let response: Response;
	const timeout =
		options.timeout ??
		getApiTimeoutMs(body, clientTimeouts.get(client) ?? API_TIMEOUT_MS);
	try {
		response = await client.fetch(
			url,
			{ method, headers, body, signal: options.signal },
			{
				timeoutInSeconds: timeout / 1000,
				abortSignal: options.signal,
			}
		);
	} catch (error) {
		if (options.signal?.aborted) {
			throw new Error("Request aborted");
		}
		if (
			error === "timeout" ||
			(error instanceof Error && error.name === "AbortError")
		) {
			throw new Error(`Request timed out after ${timeout}ms`);
		}
		if (error instanceof Error) {
			// Network failures have no HTTP status, so keep them as plain errors.
			throw new Error(`Request failed: ${error.message}`);
		}
		throw error;
	}
	if (!response.ok) {
		throw new CloudflareApiError({
			statusCode: response.status,
			body: await parseErrorResponse(response),
			rawResponse: {
				status: response.status,
				statusText: response.statusText,
				url: response.url || url,
				headers: response.headers,
				redirected: response.redirected,
				type: response.type,
			},
		});
	}
	if (response.status === 204) {
		return null as T;
	}
	const contentType = response.headers.get("content-type") ?? "";
	if (
		!contentType.includes("application/json") &&
		options.preserveNonJsonBytes
	) {
		return Buffer.from(await response.arrayBuffer()) as T;
	}
	const text = await response.text();
	if (text === "") {
		return null as T;
	}
	if (!contentType.includes("application/json")) {
		return text as T;
	}
	const data = JSON.parse(text) as CloudflareAPIResponse<unknown>;
	if (data.success === false) {
		const message =
			data.errors
				?.map((entry) => entry.message)
				.filter(Boolean)
				.join(", ") || "unknown error";
		throw new CloudflareApiError({
			message: `API error: ${message}`,
			statusCode: response.status,
			body: data,
		});
	}
	return ("result" in data ? data.result : data) as T;
}

export function createCloudflareClientWithToken(
	options: CloudflareClientOptions
): Cloudflare {
	const baseURL = options.baseURL ?? DEFAULT_BASE_URL;
	const clientOptions: BaseClientOptions = {
		baseUrl: baseURL,
		auth: async () => ({
			headers: { Authorization: `Bearer ${options.apiToken}` },
		}),
		headers: options.defaultHeaders,
		timeoutInSeconds: (options.timeout ?? API_TIMEOUT_MS) / 1000,
		maxRetries: 0,
		fetch: options.fetch ?? globalThis.fetch,
	};

	const client = new CloudflareApiClient(clientOptions);
	clientBaseUrls.set(client, baseURL);
	clientTimeouts.set(client, options.timeout ?? API_TIMEOUT_MS);
	return client;
}

/**
 * Get the authentication token for the Cloudflare API.
 *
 * Resolution order:
 * 1. `CLOUDFLARE_API_TOKEN` environment variable (cf does not support the
 *    global API key + email pair, so `allowGlobalAuthKey` is `false`).
 * 2. cf's stored OAuth token (refreshed if expired).
 *
 * @throws Error if no authentication token is found.
 */
export async function getAuthToken(): Promise<string> {
	// Environment credential (scoped API token only).
	const envAuth = getAuthFromEnv({ allowGlobalAuthKey: false });
	if (envAuth && "apiToken" in envAuth) {
		return envAuth.apiToken;
	}

	// cf's own OAuth token (refreshes if needed).
	const cfToken = await getOAuthToken();
	if (cfToken) {
		return cfToken;
	}

	throw new Error(
		`No authentication token found.

Please set one of the following:
  1. Set the CLOUDFLARE_API_TOKEN environment variable
  2. Run 'cf auth login' to authenticate via OAuth

For API tokens, visit: https://dash.cloudflare.com/profile/api-tokens`
	);
}

/**
 * Resolve an account for schema-backed help without prompting or exceeding
 * its deadline. workers-auth's account enumeration can start an OAuth login
 * and follows every page; this path instead obtains an existing valid token
 * and makes one bounded request to each account source.
 */
export async function resolveAccountIdForHelp(
	deadline: number
): Promise<string | undefined> {
	const stored = await resolveAccountIdSilent();
	if (stored) {
		return stored;
	}

	try {
		const token = await getAuthToken();
		const baseURL = getCloudflareApiBaseUrl({
			compliance_region: await getComplianceRegion(),
		});
		const timeout = deadline - Date.now();
		if (timeout <= 0) {
			return undefined;
		}
		const client = createCloudflareClientWithToken({
			apiToken: token,
			baseURL,
			defaultHeaders: getDefaultHeaders(),
		});
		const requestOptions = {
			timeoutInSeconds: timeout / 1000,
			maxRetries: 0,
		};
		const [accountsResult, membershipsResult] = await Promise.allSettled([
			client.accounts.list({ per_page: 50 }, requestOptions),
			client.user.memberships.list({ per_page: 50 }, requestOptions),
		]);
		if (accountsResult.status === "rejected") {
			return undefined;
		}

		const accountsResponse = accountsResult.value;
		if (
			(accountsResponse.result_info?.total_count ??
				accountsResponse.result.length) > accountsResponse.result.length
		) {
			return undefined;
		}
		let accounts = accountsResponse.result;
		if (membershipsResult.status === "fulfilled") {
			const memberships = membershipsResult.value.result ?? [];
			if (
				(membershipsResult.value.result_info?.total_count ??
					memberships.length) > memberships.length
			) {
				return undefined;
			}
			const membershipIds = new Set(
				memberships
					.map((membership) => membership.account?.id)
					.filter((id): id is string => id !== undefined)
			);
			accounts = accounts.filter((account) => membershipIds.has(account.id));
		}

		return accounts.length === 1 ? accounts[0]?.id : undefined;
	} catch {
		return undefined;
	}
}

/**
 * Subset of yargs argv that command-client construction reads.
 *
 * Defined as a structural type with an index signature so any
 * `ArgumentsCamelCase<X>` is assignable. Without the index signature,
 * TypeScript's "no properties in common" check fires for per-command
 * Args interfaces that don't happen to declare `local` /
 * `persistTo` (because they're global yargs options, not
 * per-command). Yargs merges global options into argv at runtime
 * regardless; the index signature reflects that.
 */
export interface CommandClientArgs {
	/** When true, route through the local-explorer instead of the API. */
	local?: boolean;
	/** `--persist-to` value, if the user supplied one. */
	persistTo?: string;
	/** Allow any other yargs argv field through unread. */
	[key: string]: unknown;
}

/**
 * Placeholder API token passed to the SDK in local mode.
 *
 * The client stamps `apiToken` into the `Authorization: Bearer …`
 * header on every outbound request. In local mode that header is
 * stripped by `rewriteHeaders` (see `lib/local.ts`) before the request
 * leaves the process, so the stamped value never reaches a server. We
 * use a clearly-synthetic literal here so:
 *
 *   - Anyone debugging a request snapshot can see at a glance that
 *     no real credential was attached.
 *   - Users without a Cloudflare API token configured can still run
 *     `--local` commands — `getAuthToken()` is bypassed entirely.
 *
 * Format note: tokens are typically 40 chars of `[A-Za-z0-9_-]`. This
 * placeholder is intentionally outside that shape so a leak (i.e. a
 * production call that somehow gets here unscrubbed) is obvious in
 * logs rather than mistaken for a real credential.
 */
const LOCAL_MODE_PLACEHOLDER_TOKEN = "cf-local-mode-no-auth";

/**
 * Build the SDK client every generated command uses. Centralising it
 * here lets us:
 *
 *   - Swap in a `--local` fetch wrapper without touching every
 *     generated file.
 *   - Pin the timeout / default headers in one place.
 *   - Make future SDK options (retry policy, etc.) a single-site
 *     change.
 *
 * Base URL is compliance-region-aware (FedRAMP → `api.fed.cloudflare.com`),
 * overrideable via `CLOUDFLARE_API_BASE_URL`.
 *
 * In local mode, swaps the SDK's `fetch` for a wrapper from
 * `lib/local.ts` that rewrites every outbound URL to point at the
 * Miniflare local-explorer surface, drops the auth header, and adds
 * the local-explorer-specific headers. `getAuthToken()` is skipped
 * entirely — `--local` is documented as a way to develop against
 * Miniflare without touching production, so forcing every local-mode
 * user to have a real Cloudflare API token configured defeats the
 * point. A clearly-synthetic placeholder is passed instead; the local
 * fetch wrapper strips it before any bytes leave the process.
 */
export async function createCommandClient(
	args: CommandClientArgs
): Promise<Cloudflare> {
	const baseURL = getCloudflareApiBaseUrl({
		compliance_region: await getComplianceRegion(),
	});

	if (args.local) {
		// Lazy import keeps the local-mode dependency tree (Headers,
		// Request, fetch wrapper) out of the hot path for the much-
		// more-common production case.
		const { createLocalFetch } = await import("./local.js");
		return createCloudflareClientWithToken({
			apiToken: LOCAL_MODE_PLACEHOLDER_TOKEN,
			baseURL,
			defaultHeaders: getDefaultHeaders(),
			fetch: createLocalFetch({
				persistTo: args.persistTo,
				apiBaseUrl: baseURL,
			}),
		});
	}

	return createCloudflareClientWithToken({
		apiToken: await getAuthToken(),
		baseURL,
		defaultHeaders: getDefaultHeaders(),
	});
}
