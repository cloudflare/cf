export const API_TIMEOUT_MS = 30_000;

const UPLOAD_BYTES_PER_SECOND = 1024 * 1024;

/** Allow time to transfer byte bodies before the normal API response deadline. */
export function getApiTimeoutMs(
	body: unknown,
	baseTimeoutMs = API_TIMEOUT_MS
): number {
	let bytes: number;
	if (body instanceof FormData) {
		bytes = 0;
		for (const value of body.values()) {
			bytes +=
				typeof value === "string" ? Buffer.byteLength(value) : value.size;
		}
	} else if (
		body instanceof Blob ||
		body instanceof ArrayBuffer ||
		ArrayBuffer.isView(body)
	) {
		bytes = body instanceof Blob ? body.size : body.byteLength;
	} else {
		return baseTimeoutMs;
	}

	return baseTimeoutMs + Math.ceil(bytes / UPLOAD_BYTES_PER_SECOND) * 1000;
}
