/**
 * Retry a request once when its bearer token was rejected but a different
 * token is now current.
 *
 * Refreshing cf's OAuth token revokes the previous access token at once. When
 * another cf process refreshes between this process reading the token and the
 * API checking it, or the token expires during a long-running command, the
 * request fails with 401/403 even though valid credentials are stored.
 */
export type TokenRecovery = (rejected: string) => Promise<string | undefined>;

const REJECTED_STATUSES = new Set([401, 403]);

function bearerToken(headers: Headers): string | undefined {
	const match = /^Bearer (.+)$/.exec(headers.get("Authorization") ?? "");
	return match?.[1];
}

// A consumed stream cannot be sent again.
function isReplayable(input: RequestInfo | URL, init?: RequestInit): boolean {
	return !(input instanceof Request) && !(init?.body instanceof ReadableStream);
}

export function withTokenRecovery(
	fetchImpl: typeof globalThis.fetch,
	recover: TokenRecovery,
	onRecovered?: (token: string) => void
): typeof globalThis.fetch {
	return async (input, init) => {
		const response = await fetchImpl(input, init);
		if (!REJECTED_STATUSES.has(response.status) || !isReplayable(input, init)) {
			return response;
		}
		const headers = new Headers(init?.headers);
		const rejected = bearerToken(headers);
		if (rejected === undefined) {
			return response;
		}
		const current = await recover(rejected).catch(() => undefined);
		if (current === undefined || current === rejected) {
			return response;
		}
		await response.body?.cancel();
		onRecovered?.(current);
		headers.set("Authorization", `Bearer ${current}`);
		return fetchImpl(input, { ...init, headers });
	};
}
