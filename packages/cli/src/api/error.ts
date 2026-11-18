/**
 * The raw response a request failed with, without its body.
 */
export interface RawResponse {
	readonly headers: Headers;
	readonly redirected: boolean;
	readonly status: number;
	readonly statusText: string;
	readonly type: ResponseType;
	readonly url: string;
}

/**
 * Returns the raw response of `response`.
 */
export function rawResponse(response: Response): RawResponse {
	return {
		headers: response.headers,
		redirected: response.redirected,
		status: response.status,
		statusText: response.statusText,
		type: response.type,
		url: response.url,
	};
}

/**
 * The raw response of a request that was aborted.
 */
export const abortedResponse: RawResponse = {
	headers: new Headers(),
	redirected: false,
	status: 499,
	statusText: "Client Closed Request",
	type: "error",
	url: "",
};

/**
 * The raw response of a request that failed without one.
 */
export const unknownResponse: RawResponse = {
	headers: new Headers(),
	redirected: false,
	status: 0,
	statusText: "Unknown Error",
	type: "error",
	url: "",
};

/**
 * What an `ApiError` is made from.
 */
export interface ApiErrorInit {
	message?: string;
	statusCode?: number;
	body?: unknown;
	rawResponse?: RawResponse;
	cause?: unknown;
	retryAfter?: number;
}

function buildMessage({ message, statusCode, body }: ApiErrorInit): string {
	const lines: string[] = [];
	if (message !== undefined && message !== null) {
		lines.push(message);
	}
	if (statusCode !== undefined && statusCode !== null) {
		lines.push(`Status code: ${statusCode.toString()}`);
	}
	if (body !== undefined && body !== null) {
		lines.push(`Body: ${JSON.stringify(body, undefined, 2)}`);
	}
	return lines.join("\n");
}

/**
 * A request that failed: with an error status, or without a response.
 */
export class ApiError extends Error {
	readonly statusCode: number | undefined;
	readonly body: unknown;
	readonly rawResponse: RawResponse | undefined;
	readonly #retryAfter: number | undefined;
	declare readonly cause?: unknown;

	constructor(init: ApiErrorInit) {
		super(buildMessage(init));
		Object.setPrototypeOf(this, new.target.prototype);
		this.name = "ApiError";
		this.statusCode = init.statusCode;
		this.body = init.body;
		this.rawResponse = init.rawResponse;
		this.#retryAfter = init.retryAfter;
		if (init.cause !== undefined && init.cause !== null) {
			Object.defineProperty(this, "cause", {
				value: init.cause,
				writable: true,
				configurable: true,
			});
		}
	}

	/**
	 * The ID Cloudflare gave the request, from the `x-request-id` header.
	 */
	get requestId(): string | undefined {
		return this.rawResponse?.headers?.get("x-request-id") ?? undefined;
	}

	/**
	 * How long to wait before retrying, in seconds, from the `retry-after`
	 * or `x-ratelimit-reset` headers if present on the response, or provided
	 * during initialization.
	 */
	get retryAfter(): number | undefined {
		if (this.#retryAfter !== undefined) {
			return this.#retryAfter;
		}
		const headers = this.rawResponse?.headers;
		if (!headers) {
			return undefined;
		}
		const retryAfter = headers.get("retry-after");
		if (retryAfter) {
			const seconds = parseInt(retryAfter, 10);
			if (!Number.isNaN(seconds) && seconds >= 0) {
				return seconds;
			}
			const date = new Date(retryAfter);
			if (!Number.isNaN(date.getTime())) {
				const delay = Math.ceil((date.getTime() - Date.now()) / 1000);
				return delay > 0 ? delay : 0;
			}
		}
		const reset =
			headers.get("x-ratelimit-reset") ?? headers.get("ratelimit-reset");
		if (reset) {
			const time = parseInt(reset, 10);
			if (!Number.isNaN(time)) {
				const delay =
					time > 1_000_000_000 ? Math.ceil(time - Date.now() / 1000) : time;
				return delay > 0 ? delay : 0;
			}
		}
		return undefined;
	}
}

/**
 * A request that did not finish in time.
 */
export class ApiTimeoutError extends ApiError {
	constructor(message: string, options?: { cause?: unknown }) {
		super({ message, cause: options?.cause });
		Object.setPrototypeOf(this, new.target.prototype);
		this.name = "ApiTimeoutError";
	}
}

/**
 * Returns the error for a response with a status an operation declares an
 * error for, such as `BadRequestError` for 400: an `ApiError` whose message
 * starts with that name.
 */
export function statusError(
	name: string,
	statusCode: number,
	body: unknown,
	response: RawResponse
): ApiError {
	const error = new ApiError({
		message: name,
		statusCode,
		body,
		rawResponse: response,
	});
	error.name = name;
	return error;
}
