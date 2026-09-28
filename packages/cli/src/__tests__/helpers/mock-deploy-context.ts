import { APIError } from "@cloudflare/workers-utils";
import type { DeployHelpersContext } from "@cloudflare/deploy-helpers";

const CF_API_BASE = "https://api.cloudflare.com/client/v4";

interface FormDataFileLike {
	arrayBuffer(): Promise<ArrayBuffer>;
	name?: string;
	type?: string;
}

async function normalizeFetchBody(
	body: globalThis.BodyInit | null | undefined
): Promise<globalThis.BodyInit | null | undefined> {
	if (
		body == null ||
		body instanceof globalThis.FormData ||
		Object.prototype.toString.call(body) !== "[object FormData]"
	) {
		return body;
	}

	// deploy-helpers creates multipart bodies with its `undici` dependency.
	// Node's native fetch does not recognise a FormData instance from that
	// separate realm, so convert it before handing the request to MSW.
	const normalized = new globalThis.FormData();
	const entries = body as unknown as {
		entries(): IterableIterator<[string, string | FormDataFileLike]>;
	};
	for (const [name, value] of entries.entries()) {
		if (typeof value === "string") {
			normalized.append(name, value);
			continue;
		}
		const blob = new globalThis.Blob([await value.arrayBuffer()], {
			type: value.type,
		});
		normalized.append(name, blob, value.name);
	}
	return normalized;
}

/**
 * Build a DeployHelpersContext whose fetch functions use globalThis.fetch
 * (interceptable by MSW) instead of undici. The context parses the CF API
 * envelope and throws APIError on failure, matching the real fetchResultBase
 * behavior closely enough for deploy-helpers' error handling to work.
 */
export function createMockDeployContext(
	authToken: string
): DeployHelpersContext {
	async function cfFetch(
		resource: string,
		init?: unknown,
		queryParams?: URLSearchParams
	): Promise<{ json: Record<string, unknown>; status: number }> {
		const qs = queryParams?.toString();
		const url = `${CF_API_BASE}${resource}${qs ? `?${qs}` : ""}`;
		const fetchInit = init as globalThis.RequestInit | undefined;
		const body = await normalizeFetchBody(fetchInit?.body);
		const res = await globalThis.fetch(url, {
			...fetchInit,
			body,
			headers: {
				Authorization: `Bearer ${authToken}`,
				"User-Agent": "cf-test",
				// Caller-provided headers (e.g. asset upload JWT) override defaults
				...(fetchInit?.headers as Record<string, string>),
			},
		});
		const json = (await res.json()) as Record<string, unknown>;
		return { json, status: res.status };
	}

	function throwApiError(
		resource: string,
		json: Record<string, unknown>,
		status: number
	): never {
		const errors = (json.errors ?? []) as {
			code: number;
			message: string;
		}[];
		const error = new APIError({
			text: `A request to the Cloudflare API (${resource}) failed.`,
			notes: errors.map((e) => ({
				text: `${e.message} [code: ${e.code}]`,
			})),
			status,
			telemetryMessage: false,
		});
		if (errors[0]?.code) {
			error.code = errors[0].code;
		}
		throw error;
	}

	async function fetchResult(
		_complianceConfig: unknown,
		resource: string,
		init?: unknown,
		queryParams?: URLSearchParams
	) {
		const { json, status } = await cfFetch(resource, init, queryParams);
		if (json.success) {
			return json.result;
		}
		throwApiError(resource, json, status);
	}

	async function fetchListResult(
		_complianceConfig: unknown,
		resource: string,
		init?: unknown,
		queryParams?: URLSearchParams
	) {
		const { json, status } = await cfFetch(resource, init, queryParams);
		if (json.success) {
			return (json.result ?? []) as unknown[];
		}
		throwApiError(resource, json, status);
	}

	// The fetch function signatures use undici's RequestInit while we
	// use globalThis.fetch. The types are structurally compatible at
	// runtime; cast the whole context to satisfy the nominal mismatch.
	return {
		fetchResult,
		fetchListResult,
		fetchPagedListResult: fetchListResult,
		fetchKVGetValue: async () => new ArrayBuffer(0),
		logger: {
			loggerLevel: "log" as const,
			debug: () => {},
			log: (...args: unknown[]) => console.log(args.join(" ")),
			info: (...args: unknown[]) => console.log(args.join(" ")),
			warn: (...args: unknown[]) => console.warn(args.join(" ")),
			error: (...args: unknown[]) => console.error(args.join(" ")),
		},
		confirm: async () => true,
		prompt: async () => "",
		select: async (_text, options) => {
			const { choices, defaultOption, fallbackOption } = options;
			const index = fallbackOption ?? defaultOption ?? 0;
			const choice = choices[index] ?? choices[0];
			if (!choice) {
				throw new Error("select() called with no choices");
			}
			return choice.value;
		},
		isNonInteractiveOrCI: () => true,
	} as DeployHelpersContext;
}
