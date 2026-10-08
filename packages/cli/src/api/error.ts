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
	declare readonly cause?: unknown;

	constructor(init: ApiErrorInit) {
		super(buildMessage(init));
		Object.setPrototypeOf(this, new.target.prototype);
		this.name = "ApiError";
		this.statusCode = init.statusCode;
		this.body = init.body;
		this.rawResponse = init.rawResponse;
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
