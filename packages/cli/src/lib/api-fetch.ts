import { addCustomApiHeaders } from "@cloudflare/workers-utils/custom-api-headers";

export function createApiFetch(
	fetchImpl: typeof globalThis.fetch
): typeof globalThis.fetch {
	return (input, init) => {
		if (!process.env.CLOUDFLARE_API_HEADERS) {
			return fetchImpl(input, init);
		}
		const requestInit = { ...init, duplex: "half" as const };
		const request = new Request(input, requestInit);
		addCustomApiHeaders(request.headers);
		return fetchImpl(request);
	};
}
