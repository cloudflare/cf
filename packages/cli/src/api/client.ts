import {
	ApiError,
	ApiTimeoutError,
	abortedResponse,
	rawResponse,
	statusError,
	unknownResponse,
} from "./error.js";
import {
	errorBody,
	join,
	queryString,
	type ResponseType,
	responseBody,
	send,
} from "./fetch.js";

/**
 * Header values; `null` and `undefined` leave a header out.
 */
export type HeaderValues = Record<string, string | null | undefined>;

/**
 * The options of a client.
 */
export interface ClientOptions {
	/**
	 * The URL the paths of the API are relative to.
	 */
	baseUrl: string;
	/**
	 * Returns the headers that authenticate a request.
	 */
	auth?: () => Promise<{ headers: HeaderValues }>;
	/**
	 * Headers sent with every request.
	 */
	headers?: HeaderValues | undefined;
	/**
	 * How long to wait for a response, in seconds; 60 by default.
	 */
	timeoutInSeconds?: number;
	/**
	 * How many times to retry a request that failed with a status worth
	 * retrying; 2 by default.
	 */
	maxRetries?: number;
	/**
	 * The fetch function to send requests with; the global one by default.
	 */
	fetch?: typeof fetch;
}

/**
 * The options of a request, which override those of the client.
 */
export interface RequestOptions {
	timeoutInSeconds?: number | undefined;
	maxRetries?: number | undefined;
	abortSignal?: AbortSignal | undefined;
	headers?: HeaderValues | undefined;
}

/**
 * An operation of the API: where it sends the fields of a request.
 *
 * A request is one object. `path` returns the request's path, with the
 * fields it takes substituted and encoded; the fields in `query` are the
 * query parameters, and `headers` are the header parameters. With a `json`
 * body, the body is the `body` field; with a `form` one, the fields other
 * than parameters are sent as `multipart/form-data`.
 */
export interface Operation {
	method: string;
	/**
	 * Returns the path of a request, relative to the client's base URL, with
	 * the path parameters substituted and encoded, as the `path` tag does:
	 * ``(request) => path`/zones/${request.zone_id}` ``.
	 */
	path: (request: Record<string, unknown>) => string;
	/**
	 * The request fields `path` takes, which a `form` body leaves out. Only
	 * set for operations with a `form` body.
	 */
	pathParams?: readonly string[];
	/**
	 * The query parameters, in the order they are sent.
	 */
	query?: readonly string[];
	/**
	 * The query parameters whose arrays are joined with commas.
	 */
	joined?: readonly string[];
	headers?: readonly string[];
	body?: "json" | "form";
	/**
	 * The media type of a `json` body; JSON by default.
	 */
	contentType?: string;
	/**
	 * Fields of a `json` body with one allowed value, which are always sent
	 * with it.
	 */
	constants?: Record<string, unknown>;
	/**
	 * How the response is read: not at all, as bytes, or as text. JSON by
	 * default.
	 */
	response?: false | ResponseType;
	/**
	 * The errors for the statuses the operation declares, by status.
	 */
	errors?: Readonly<Record<string, string>>;
}

type Fields = Record<string, unknown>;

function mergeHeaders(
	...all: (Record<string, unknown> | null | undefined)[]
): Record<string, unknown> {
	const result: Record<string, unknown> = {};
	for (const headers of all) {
		if (headers === null || headers === undefined) {
			continue;
		}
		for (const [key, value] of Object.entries(headers)) {
			const lower = key.toLowerCase();
			if (value !== null && value !== undefined) {
				result[lower] = value;
			} else if (lower in result) {
				delete result[lower];
			}
		}
	}
	return result;
}

/**
 * Sends the requests of the generated commands.
 */
export class Client {
	readonly #options: ClientOptions;

	constructor(options: ClientOptions) {
		this.#options = options;
	}

	/**
	 * The URL the paths of the API are relative to.
	 */
	get baseUrl(): string {
		return this.#options.baseUrl;
	}

	async #authHeaders(): Promise<HeaderValues> {
		return (await this.#options.auth?.())?.headers ?? {};
	}

	/**
	 * Sends `request` for `operation`, and returns the response body.
	 */
	async send(
		operation: Operation,
		request: Fields = {},
		options?: RequestOptions
	): Promise<unknown> {
		const used = new Set<string>(operation.pathParams);
		const path = operation.path(request);
		const relative = path.replace(/^\//, "");
		const query: [string, unknown][] = [];
		for (const name of operation.query ?? []) {
			used.add(name);
			query.push([name, request[name]]);
		}
		const parameterHeaders: Record<string, unknown> = {};
		for (const name of operation.headers ?? []) {
			used.add(name);
			parameterHeaders[name] = request[name];
		}
		let body: unknown;
		let form: FormData | undefined;
		if (operation.body === "json") {
			body = request["body"];
			const object =
				typeof body === "object" && body !== null && !Array.isArray(body);
			if (operation.constants !== undefined && (body === undefined || object)) {
				body = { ...(body as Fields | undefined), ...operation.constants };
			}
		} else if (operation.body === "form") {
			form = new FormData();
			for (const [key, value] of Object.entries(request)) {
				if (!used.has(key) && value !== null && value !== undefined) {
					form.append(
						key,
						typeof value === "object"
							? JSON.stringify(value)
							: // oxlint-disable-next-line typescript/no-base-to-string -- value is not an object here
								String(value)
					);
				}
			}
		}

		const url = join(this.#options.baseUrl, relative);
		const search = queryString(query, operation.joined);
		const headers = new Headers();
		headers.set("Accept", operation.response === "text" ? "text/plain" : "*/*");
		if (body !== undefined && operation.body !== "form") {
			headers.set("Content-Type", operation.contentType ?? "application/json");
		}
		const merged = mergeHeaders(
			await this.#authHeaders(),
			this.#options.headers,
			Object.fromEntries(
				Object.entries(parameterHeaders).filter(
					([, value]) => value !== null && value !== undefined
				)
			),
			options?.headers
		);
		for (const [key, value] of Object.entries(merged)) {
			headers.set(
				key,
				typeof value === "string" ? value : `${value as string}`
			);
		}
		const init: RequestInit & { duplex?: "half" } = {
			method: operation.method,
			headers,
		};
		if (form !== undefined) {
			init.body = form;
			init.duplex = "half";
		} else if (body !== undefined) {
			init.body = JSON.stringify(body);
		}
		const timeoutSeconds =
			options?.timeoutInSeconds ?? this.#options.timeoutInSeconds ?? 60;
		const signal = options?.abortSignal;
		let data: unknown;
		try {
			const response = await send(
				this.#options.fetch ?? fetch,
				search ? `${url}?${search}` : url,
				init,
				{
					timeoutMs: timeoutSeconds * 1000,
					signal,
					maxRetries: options?.maxRetries ?? this.#options.maxRetries,
				}
			);
			const raw = rawResponse(response);
			if (response.status < 200 || response.status >= 400) {
				const errorData = await errorBody(response);
				const name = operation.errors?.[String(response.status)];
				throw name === undefined
					? new ApiError({
							statusCode: response.status,
							body: errorData,
							rawResponse: raw,
						})
					: statusError(name, response.status, errorData, raw);
			}
			data = await responseBody(
				response,
				operation.response === false ? undefined : operation.response
			);
		} catch (error) {
			if (error instanceof ApiError) {
				throw error;
			}
			if (signal?.aborted) {
				throw new ApiError({
					message: "The user aborted a request",
					rawResponse: abortedResponse,
					cause: error,
				});
			}
			if (error instanceof Error && error.name === "AbortError") {
				throw new ApiTimeoutError(
					`Timeout exceeded when calling ${operation.method} ${path}.`,
					{
						cause: error,
					}
				);
			}
			throw new ApiError({
				message: error instanceof Error ? error.message : JSON.stringify(error),
				rawResponse: unknownResponse,
				cause: error,
			});
		}
		if (operation.response === false) {
			return undefined;
		}
		return data;
	}

	/**
	 * Sends a request the way `fetch` does, with the client's base URL,
	 * headers, authentication, timeout and retries.
	 */
	async fetch(
		input: string | URL,
		init?: RequestInit,
		options?: RequestOptions
	): Promise<Response> {
		const url = input instanceof URL ? input.toString() : input;
		const full =
			url.startsWith("http://") || url.startsWith("https://")
				? url
				: join(this.#options.baseUrl, url);
		const headers: Record<string, string> = {};
		for (const [key, value] of Object.entries(this.#options.headers ?? {})) {
			if (value !== null && value !== undefined) {
				headers[key.toLowerCase()] = `${value}`;
			}
		}
		for (const [key, value] of Object.entries(await this.#authHeaders())) {
			headers[key.toLowerCase()] = value as string;
		}
		if (init?.headers !== undefined && init.headers !== null) {
			const own =
				init.headers instanceof Headers
					? Object.fromEntries(init.headers.entries())
					: Array.isArray(init.headers)
						? Object.fromEntries(init.headers)
						: init.headers;
			for (const [key, value] of Object.entries(own)) {
				if (value !== null && value !== undefined) {
					headers[key.toLowerCase()] = value;
				}
			}
		}
		for (const [key, value] of Object.entries(options?.headers ?? {})) {
			headers[key.toLowerCase()] = value as string;
		}
		const timeoutSeconds =
			options?.timeoutInSeconds ?? this.#options.timeoutInSeconds;
		const requestInit: RequestInit = { method: init?.method ?? "GET", headers };
		if (init?.body !== undefined && init.body !== null) {
			requestInit.body = init.body;
		}
		return send(this.#options.fetch ?? fetch, full, requestInit, {
			timeoutMs:
				timeoutSeconds === undefined ? undefined : timeoutSeconds * 1000,
			signal: options?.abortSignal ?? init?.signal ?? undefined,
			maxRetries: options?.maxRetries ?? this.#options.maxRetries,
		});
	}
}
