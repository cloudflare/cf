export function isUploadBody(body: unknown): boolean {
	return (
		body instanceof FormData ||
		body instanceof Blob ||
		body instanceof ArrayBuffer ||
		ArrayBuffer.isView(body) ||
		body instanceof ReadableStream
	);
}
