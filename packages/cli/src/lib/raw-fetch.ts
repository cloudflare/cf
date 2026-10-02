/**
 * Raw-output fetch helper.
 *
 * Bypasses the generated SDK's response decoding so handlers
 * can stream binary or non-JSON-shaped bytes straight to stdout.
 *
 * The SDK's `client.<verb>(...)` methods always call `.text()` or
 * `.json()` on the response and unwrap the API envelope; that
 * destroys binary payloads (KV values, R2 object bytes, signed-URL
 * downloads, etc.) and re-quotes plain-text responses.  Handlers
 * whose response MIME is `application/octet-stream` (or any other
 * non-JSON `application/*` / `text/*` type — see `deriveOutputKind`
 * in the generator) use this helper instead and write the body
 * verbatim.
 *
 * Local-mode aware: when `args.local` is set, the request is routed
 * through `createLocalFetch` (URL rewritten to the local-explorer,
 * Authorization stripped, Host pinned to localhost) — exactly the
 * same wrapper the SDK uses for envelope-decoded calls. Token
 * resolution is skipped in local mode so users without a Cloudflare
 * API token can still exercise local commands.
 *
 * Throws a `CloudflareApiError` on non-2xx responses so the existing
 * `handleError` rendering still applies.
 */
import { CloudflareApiError } from "#sdk";
import { getCloudflareApiBaseUrl } from "@cloudflare/workers-utils";
import { API_TIMEOUT_MS, getAuthToken, isUploadBody } from "./auth.js";
import { getComplianceRegion } from "./context.js";
import { createLocalFetch } from "./local.js";
import { getDefaultHeaders } from "./request-headers.js";

/**
 * Request body for a raw-output call. Mirrors the shapes the generated
 * handlers assemble before a mutating request:
 *
 *   - `FormData`                       — multipart/form-data uploads.
 *     The boundary-bearing `Content-Type` is left for `fetch` to set.
 *   - `Buffer` / `Uint8Array` / `ArrayBuffer` — raw bytes (octet-stream,
 *     javascript, etc.). `Content-Type` defaults to
 *     `application/octet-stream` unless `contentType` overrides it.
 *   - `string`                         — sent verbatim. Used for
 *     already-serialized JSON (with `contentType: 'application/json'`).
 *   - plain object / array             — JSON-stringified, `Content-Type`
 *     defaults to `application/json`.
 */
export type RawFetchBody =
	| FormData
	| Buffer
	| Uint8Array
	| ArrayBuffer
	| string
	| Record<string, unknown>
	| unknown[];

export interface FetchRawOptions {
	/** HTTP verb. Defaults to `GET`. */
	method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
	/** Optional request body (see {@link RawFetchBody}). */
	body?: RawFetchBody | null;
	/**
	 * Explicit `Content-Type` for byte / string bodies. Ignored for
	 * `FormData` (fetch sets the multipart boundary) and overridden by
	 * any `Content-Type` already present in {@link FetchRawOptions.headers}.
	 */
	contentType?: string;
	/** Extra request headers (merged over the defaults). */
	headers?: Record<string, string>;
	/**
	 * When true, route the request through a cf-spawned Miniflare's
	 * local-explorer instead of the production API. Generated handlers
	 * pass `argv.local === true`. Defaults to production routing, which
	 * is what tests / ad-hoc helpers want.
	 */
	local?: boolean;
	/** `--persist-to` value, forwarded to the local session. */
	persistTo?: string;
}

/**
 * Call an arbitrary Cloudflare API path and return the raw response body
 * without decoding/parsing. Supports an optional request body so
 * mutating raw-output endpoints (e.g. AI image generation, which POSTs a
 * JSON prompt and gets back PNG bytes) bypass the SDK envelope on both
 * the request and response sides.
 *
 * @param path Path beginning with `/` (e.g. `/accounts/123/storage/kv/...`).
 *             The base URL is compliance-region-aware (FedRAMP →
 *             `api.fed.cloudflare.com`), overrideable via
 *             `CLOUDFLARE_API_BASE_URL`.
 * @param options HTTP verb, optional body, content-type, extra headers,
 *             and local-explorer routing. See {@link FetchRawOptions}.
 */
export async function fetchRawBytes(
	path: string,
	options: FetchRawOptions = {}
): Promise<Buffer> {
	const { method = "GET", local = false } = options;
	const baseURL = getCloudflareApiBaseUrl({
		compliance_region: await getComplianceRegion(),
	});
	const url = `${baseURL.replace(/\/+$/, "")}${path}`;

	// In local mode the URL gets rewritten and the Authorization header
	// gets stripped by `createLocalFetch`. Resolving an auth token would
	// be wasted work — and worse, it would force every `--local` user to
	// have a real Cloudflare API token configured even though the
	// request never reaches production. Skip token resolution entirely
	// when `local` is set.
	const headers: Record<string, string> = {
		...getDefaultHeaders(),
	};
	// Caller-supplied headers are applied first so a body-derived
	// `Content-Type` (set below via `??=`) never clobbers an explicit one.
	if (options.headers) {
		Object.assign(headers, options.headers);
	}
	let fetchImpl: typeof globalThis.fetch = globalThis.fetch;
	if (local) {
		fetchImpl = createLocalFetch({
			persistTo: options.persistTo,
			apiBaseUrl: baseURL,
		});
		// Authorization is added below for production only — the local
		// fetch wrapper strips it anyway, but skipping the header (and
		// the upstream token lookup) keeps the local path cleanly
		// token-free.
	} else {
		const token = await getAuthToken();
		headers["Authorization"] = `Bearer ${token}`;
	}

	// Normalize the request body to a `fetch`-acceptable `BodyInit` and
	// derive a `Content-Type` when the caller hasn't pinned one. Mirrors
	// how the SDK serializes mutating requests so the wire shape matches.
	let body: BodyInit | undefined;
	const rawBody = options.body;
	if (rawBody !== undefined && rawBody !== null) {
		if (rawBody instanceof FormData) {
			// Let fetch set multipart/form-data + boundary.
			body = rawBody;
		} else if (
			Buffer.isBuffer(rawBody) ||
			rawBody instanceof Uint8Array ||
			rawBody instanceof ArrayBuffer
		) {
			body = rawBody as BodyInit;
			headers["Content-Type"] ??=
				options.contentType ?? "application/octet-stream";
		} else if (typeof rawBody === "string") {
			body = rawBody;
			if (options.contentType) {
				headers["Content-Type"] ??= options.contentType;
			}
		} else {
			body = JSON.stringify(rawBody);
			headers["Content-Type"] ??= options.contentType ?? "application/json";
		}
	}

	const response = await fetchImpl(url, {
		method,
		headers,
		...(body !== undefined ? { body } : {}),
		...(isUploadBody(body)
			? {}
			: { signal: AbortSignal.timeout(API_TIMEOUT_MS) }),
	});
	if (!response.ok) {
		// Try to extract an API-shaped error envelope for consistent
		// rendering by handleError. Falls back to a status-only error
		// for non-JSON error bodies.
		const contentType = response.headers.get("content-type") ?? "";
		let errorData: unknown;
		try {
			errorData = contentType.includes("application/json")
				? await response.json()
				: await response.text();
		} catch {
			errorData = null;
		}
		throw new CloudflareApiError({
			statusCode: response.status,
			body: errorData,
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
	const arrayBuffer = await response.arrayBuffer();
	return Buffer.from(arrayBuffer);
}

/**
 * Write a raw payload to stdout.  Buffer or string both work; strings
 * are written as UTF-8 with no surrounding quotes / no trailing newline
 * (consumers piping to a file get exact bytes).
 */
export function writeRawOutput(value: Buffer | string): void {
	process.stdout.write(value);
}
