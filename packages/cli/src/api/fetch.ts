// How requests are built, sent and read. These follow the client cf used
// before, which the commands' requests must keep matching byte for byte.

function trimSlashes(s: string): string {
	if (!s) {
		return s;
	}
	const start = s.startsWith("/") ? 1 : 0;
	const end = s.endsWith("/") ? s.length - 1 : s.length;
	return start === 0 && end === s.length ? s : s.slice(start, end);
}

function joinSegments(left: string, right: string): string {
	return left.endsWith("/") ? left + right : `${left}/${right}`;
}

function joinPath(base: string, segments: string[]): string {
	let result = base;
	for (const segment of segments) {
		const clean = trimSlashes(segment);
		if (clean) {
			result = joinSegments(result, clean);
		}
	}
	if (segments.at(-1)?.endsWith("/") && !result.endsWith("/")) {
		result += "/";
	}
	return result;
}

/**
 * Joins path segments to a base URL.
 */
export function join(base: string, ...segments: string[]): string {
	if (!base) {
		return "";
	}
	if (segments.length === 0) {
		return base;
	}
	if (!base.includes("://")) {
		return joinPath(base, segments);
	}
	let url: URL;
	try {
		url = new URL(base);
	} catch {
		return joinPath(base, segments);
	}
	for (const segment of segments) {
		const clean = trimSlashes(segment);
		if (clean) {
			url.pathname = joinSegments(url.pathname, clean);
		}
	}
	if (segments.at(-1)?.endsWith("/") && !url.pathname.endsWith("/")) {
		url.pathname += "/";
	}
	return url.toString();
}

function encodeValue(value: unknown): string {
	return value === undefined || value === null
		? ""
		: // oxlint-disable-next-line typescript/no-base-to-string -- query values are stringified as given
			encodeURIComponent(String(value));
}

function stringify(
	obj: Record<string, unknown>,
	prefix: string,
	comma: boolean
): string[] {
	const parts: string[] = [];
	for (const [key, value] of Object.entries(obj)) {
		const fullKey = prefix ? `${prefix}[${key}]` : key;
		if (value === undefined || value === null) {
			continue;
		}
		if (Array.isArray(value)) {
			if (value.length === 0) {
				continue;
			}
			if (comma) {
				const values = value
					.filter((item) => item !== undefined && item !== null)
					.map(encodeValue);
				if (values.length > 0) {
					parts.push(`${encodeURIComponent(fullKey)}=${values.join(",")}`);
				}
				continue;
			}
			for (const item of value) {
				if (item === undefined || item === null) {
					continue;
				}
				if (typeof item === "object" && !Array.isArray(item)) {
					parts.push(
						...stringify(item as Record<string, unknown>, fullKey, comma)
					);
				} else {
					parts.push(`${encodeURIComponent(fullKey)}=${encodeValue(item)}`);
				}
			}
		} else if (typeof value === "object") {
			if (Object.keys(value).length === 0) {
				continue;
			}
			parts.push(
				...stringify(value as Record<string, unknown>, fullKey, comma)
			);
		} else {
			parts.push(`${encodeURIComponent(fullKey)}=${encodeValue(value)}`);
		}
	}
	return parts;
}

/**
 * Builds a query string from parameters, in order. Arrays repeat their key,
 * or join with commas when the key is in `joined`; nested objects use
 * brackets.
 */
export function queryString(
	params: ReadonlyArray<readonly [string, unknown]>,
	joined: readonly string[] = []
): string {
	const parts = new Map<string, string>();
	for (const [key, value] of params) {
		if (value === undefined || value === null) {
			continue;
		}
		const serialized = stringify({ [key]: value }, "", false).join("&");
		if (serialized.length > 0) {
			parts.set(key, serialized);
		}
	}
	// Joined parameters are serialized a second time, in place.
	for (const [key, value] of params) {
		if (!joined.includes(key) || value === undefined || value === null) {
			continue;
		}
		const serialized = stringify({ [key]: value }, "", true).join("&");
		if (serialized.length > 0) {
			parts.set(key, serialized);
		}
	}
	return [...parts.values()].join("&");
}

/**
 * A body that is not JSON, returned in place of one.
 */
export interface NonJsonBody {
	ok: false;
	error: { reason: "non-json"; statusCode: number; rawBody: string };
}

/**
 * Unwraps Cloudflare's `{ success, errors, messages, result }` envelope:
 * to the result, or to `{ result, result_info }` for a list. An envelope
 * that reports a failure throws.
 */
export function unwrapEnvelope(body: unknown): unknown {
	if (body === null || typeof body !== "object" || Array.isArray(body)) {
		return body;
	}
	if (!("success" in body) || !("result" in body)) {
		return body;
	}
	const get = (key: string): unknown => Reflect.get(body, key);
	if (get("success") === false) {
		const rawErrors = get("errors");
		const errors = Array.isArray(rawErrors) ? rawErrors : [];
		const message =
			errors
				.map((entry: unknown) => {
					if (typeof entry === "string") {
						return entry;
					}
					if (entry && typeof entry === "object" && "message" in entry) {
						const text: unknown = Reflect.get(entry, "message");
						return typeof text === "string" ? text : undefined;
					}
					return undefined;
				})
				.filter(
					(value): value is string =>
						typeof value === "string" && value.length > 0
				)
				.join(", ") || "Cloudflare API request failed";
		const error = new Error(message);
		error.name = "ApiEnvelopeError";
		Object.assign(error, { body });
		throw error;
	}
	const result = get("result");
	return Array.isArray(result)
		? { result, result_info: get("result_info") }
		: result;
}

/**
 * A binary response body, read on demand.
 */
export interface BinaryResponse {
	readonly bodyUsed: boolean;
	stream(): ReadableStream<Uint8Array> | null;
	arrayBuffer(): Promise<ArrayBuffer>;
	blob(): Promise<Blob>;
	bytes?(): Promise<Uint8Array>;
}

function binaryResponse(response: Response): BinaryResponse {
	const binary: BinaryResponse = {
		get bodyUsed() {
			return response.bodyUsed;
		},
		stream: () => response.body,
		arrayBuffer: response.arrayBuffer.bind(response),
		blob: response.blob.bind(response),
	};
	if ("bytes" in response && typeof response.bytes === "function") {
		binary.bytes = response.bytes.bind(response);
	}
	return binary;
}

/**
 * How a response body is read.
 */
export type ResponseType = "binary-response" | "text";

/**
 * Reads a successful response's body: as JSON, unwrapping the envelope,
 * unless `type` says otherwise.
 */
export async function responseBody(
	response: Response,
	type?: ResponseType
): Promise<unknown> {
	if (type === "binary-response") {
		return binaryResponse(response);
	}
	if (type === "text") {
		return await response.text();
	}
	const text = await response.text();
	if (text.length === 0) {
		return undefined;
	}
	let body: unknown;
	try {
		body = JSON.parse(text);
	} catch {
		return {
			ok: false,
			error: { reason: "non-json", statusCode: response.status, rawBody: text },
		} satisfies NonJsonBody;
	}
	return unwrapEnvelope(body);
}

const JSON_ERRORS = new Set([
	"application/hal+json",
	"application/json",
	"application/ld+json",
	"application/problem+json",
	"application/vnd.api+json",
	"text/json",
]);

/**
 * Reads a failed response's body: as JSON when its type says it is.
 */
export async function errorBody(response: Response): Promise<unknown> {
	let contentType = response.headers.get("Content-Type")?.toLowerCase();
	if (
		contentType === undefined ||
		contentType === null ||
		contentType.length === 0
	) {
		return responseBody(response);
	}
	if (contentType.includes(";")) {
		contentType = contentType.split(";")[0]?.trim() ?? "";
	}
	if (
		JSON_ERRORS.has(contentType) ||
		(contentType.startsWith("application/vnd.") &&
			contentType.endsWith("+json"))
	) {
		const text = await response.text();
		return text.length > 0 ? JSON.parse(text) : undefined;
	}
	return await response.text();
}

function anySignal(signals: AbortSignal[]): AbortSignal {
	const controller = new AbortController();
	for (const signal of signals) {
		if (signal.aborted) {
			controller.abort(signal.reason);
			return controller.signal;
		}
		signal.addEventListener("abort", () => controller.abort(signal.reason), {
			signal: controller.signal,
		});
		if (signal.aborted) {
			controller.abort(signal.reason);
			return controller.signal;
		}
	}
	return controller.signal;
}

/**
 * Sends one request, aborting it after `timeoutMs`.
 */
async function sendOnce(
	fetcher: typeof fetch,
	url: string,
	init: RequestInit,
	timeoutMs: number | undefined,
	signal: AbortSignal | undefined
): Promise<Response> {
	const signals: AbortSignal[] = [];
	let timer: ReturnType<typeof setTimeout> | undefined;
	if (timeoutMs !== undefined) {
		const controller = new AbortController();
		timer = setTimeout(() => controller.abort("timeout"), timeoutMs);
		signals.push(controller.signal);
	}
	if (signal !== undefined) {
		signals.push(signal);
	}
	try {
		return await fetcher(url, { ...init, signal: anySignal(signals) });
	} finally {
		if (timer !== undefined) {
			clearTimeout(timer);
		}
	}
}

const RETRYABLE = [408, 429, 502, 503, 504];

function retryDelay(response: Response, attempt: number): number {
	const retryAfter = response.headers.get("Retry-After");
	if (retryAfter) {
		const seconds = parseInt(retryAfter, 10);
		if (!Number.isNaN(seconds) && seconds > 0) {
			return Math.min(seconds * 1000, 60_000);
		}
		const date = new Date(retryAfter);
		if (!Number.isNaN(date.getTime())) {
			const delay = date.getTime() - Date.now();
			if (delay > 0) {
				return Math.min(delay, 60_000);
			}
		}
	}
	const reset = response.headers.get("X-RateLimit-Reset");
	if (reset) {
		const time = parseInt(reset, 10);
		if (!Number.isNaN(time)) {
			const delay = time * 1000 - Date.now();
			if (delay > 0) {
				return Math.min(delay, 60_000) * (1 + Math.random() * 0.2);
			}
		}
	}
	return (
		Math.min(1000 * 2 ** attempt, 60_000) * (1 + (Math.random() - 0.5) * 0.2)
	);
}

/**
 * Sends a request, retrying up to `maxRetries` times while the response has
 * a status worth retrying.
 */
export async function send(
	fetcher: typeof fetch,
	url: string,
	init: RequestInit,
	options: {
		timeoutMs?: number | undefined;
		signal?: AbortSignal | undefined;
		maxRetries?: number | undefined;
	}
): Promise<Response> {
	let response = await sendOnce(
		fetcher,
		url,
		init,
		options.timeoutMs,
		options.signal
	);
	for (let i = 0; i < (options.maxRetries ?? 2); i++) {
		if (!RETRYABLE.includes(response.status)) {
			break;
		}
		await new Promise((resolve) =>
			setTimeout(resolve, retryDelay(response, i))
		);
		response = await sendOnce(
			fetcher,
			url,
			init,
			options.timeoutMs,
			options.signal
		);
	}
	return response;
}
