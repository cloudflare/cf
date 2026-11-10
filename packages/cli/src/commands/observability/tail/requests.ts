import { ApiError, ApiTimeoutError, type Client, type Operation } from "#api";
import heartbeat from "#operations/o11y/telemetry/heartbeat.js";
import prepare from "#operations/o11y/telemetry/live-tail.js";

export interface TailRequest {
	scriptId?: string;
	filters?: Record<string, unknown>[];
	filterCombination?: string;
}

function connectionUrl(result: unknown, baseUrl: string): string {
	try {
		if (
			!result ||
			typeof result !== "object" ||
			!("wsUrl" in result) ||
			typeof result.wsUrl !== "string"
		) {
			throw new Error();
		}
		const url = new URL(result.wsUrl);
		const base = new URL(baseUrl);
		const loopback = (hostname: string) =>
			["localhost", "127.0.0.1", "[::1]"].includes(hostname);
		const localFixture =
			base.protocol === "http:" &&
			loopback(base.hostname) &&
			loopback(url.hostname);
		if (
			(url.protocol !== "wss:" && !(url.protocol === "ws:" && localFixture)) ||
			url.username ||
			url.password ||
			url.hash
		) {
			throw new Error();
		}
		return url.toString();
	} catch {
		// The URL is a bearer credential, including when validation fails.
		throw new Error(
			"Could not establish a live tail connection. Please try restarting cf observability tail."
		);
	}
}

function redactConnectionResult(error: unknown): unknown {
	if (
		!(error instanceof ApiError) ||
		!error.body ||
		typeof error.body !== "object" ||
		!("result" in error.body)
	) {
		return error;
	}
	// ApiError includes the response body in its message; preparation can return a signed URL.
	const { result: _result, ...body } = error.body;
	return new ApiError({
		statusCode: error.statusCode,
		rawResponse: error.rawResponse,
		body,
	});
}

export function tailRequests(
	client: Client,
	accountId: string,
	body: TailRequest,
	timeoutMs: number
) {
	const send = async (
		operation: Operation,
		requestBody: TailRequest,
		signal: AbortSignal
	) => {
		const deadline = new AbortController();
		const timer = setTimeout(() => deadline.abort(), timeoutMs);
		try {
			// Cover body consumption as well as the client's fetch deadline.
			return await client.send(
				operation,
				{ account_id: accountId, body: requestBody },
				{
					abortSignal: AbortSignal.any([signal, deadline.signal]),
					timeoutInSeconds: timeoutMs / 1000,
					maxRetries: 0,
				}
			);
		} catch (error) {
			if (deadline.signal.aborted && !signal.aborted) {
				throw new ApiTimeoutError(
					`Timeout exceeded when calling ${operation.method} ${operation.path({ account_id: accountId })}.`
				);
			}
			throw error;
		} finally {
			clearTimeout(timer);
		}
	};
	return {
		prepare: async (signal: AbortSignal) => {
			try {
				return connectionUrl(await send(prepare, body, signal), client.baseUrl);
			} catch (error) {
				throw redactConnectionResult(error);
			}
		},
		heartbeat: (signal: AbortSignal) =>
			send(
				heartbeat,
				body.scriptId === undefined ? {} : { scriptId: body.scriptId },
				signal
			),
	};
}
