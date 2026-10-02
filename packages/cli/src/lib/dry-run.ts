/**
 * Dry-Run Output Formatter
 *
 * Formats dry-run output for ALL generated CLI commands — mutating
 * (POST/PUT/PATCH/DELETE) AND read (GET/HEAD). Shows the URL, HTTP
 * method, and resolved path parameters; mutating commands additionally
 * include the assembled request body (`body` / `bodyKind`). Read
 * commands set `bodyKind: 'none'` and omit `body`.
 */
import { formatOutput } from "./output.js";

/**
 * Structured dry-run output data.
 * All fields are populated by the generated command handler.
 */
export interface DryRunOutput {
	/** Full CLI command path, e.g. "cf dns records create" */
	command: string;
	/** HTTP method, e.g. "POST" */
	method: string;
	/** Full API URL with resolved path parameters */
	url: string;
	/** Resolved path parameters */
	pathParams: Record<string, string>;
	/**
	 * Query-string parameters (the `?foo=bar` portion of the URL).
	 *
	 * Populated for every command — both reads (where the query is
	 * usually the only payload) and writes (where mutating ops can
	 * still carry filters / pagination flags alongside the body, e.g.
	 * `cf kv keys update --expiration-ttl 60`). Omitted when no
	 * query params are set so the dry-run JSON stays compact.
	 *
	 * Distinct from `body`: on the wire, `query` becomes
	 * `URLSearchParams` appended to the URL, never serialised as the
	 * request body. Earlier versions of the generator conflated the
	 * two, which made dry-run output misleading for mutating ops with
	 * query params.
	 */
	query?: Record<string, unknown>;
	/**
	 * How the request body will be encoded on the wire.
	 *
	 * - `json` (default): the `body` map is JSON-serialised as a single
	 *   `application/json` payload.
	 * - `multipart`: each entry of `body` becomes a separate
	 *   `multipart/form-data` field. `@file` references are read at
	 *   send time; the dry-run shows the path verbatim.
	 * - `octet-stream`: `body` is sent as raw bytes
	 *   (`application/octet-stream` or another non-JSON content type).
	 * - `none`: no request body (GET / HEAD / DELETE without body).
	 */
	bodyKind?: "json" | "multipart" | "octet-stream" | "none";
	/** Request body (for POST/PUT/PATCH/DELETE; omitted for reads). */
	body?: unknown;
}

type DryRunInput = DryRunOutput & {
	sensitiveBodyPaths?: readonly (readonly string[])[];
};

export function redactDryRunBody(
	body: unknown,
	paths: readonly (readonly string[])[]
): unknown {
	const redact = (
		value: unknown,
		remainingPaths: readonly (readonly string[])[]
	): unknown => {
		if (Array.isArray(value)) {
			return value.map((item) => redact(item, remainingPaths));
		}
		if (value === null || typeof value !== "object") {
			return value;
		}

		return Object.fromEntries(
			Object.entries(value).map(([key, child]) => {
				const matching = remainingPaths.filter((path) => path[0] === key);
				if (matching.length === 0 || child === undefined) {
					return [key, child];
				}
				if (matching.some((path) => path.length === 1)) {
					return [key, "<redacted>"];
				}
				return [
					key,
					redact(
						child,
						matching.map((path) => path.slice(1))
					),
				];
			})
		);
	};

	return redact(
		body,
		paths.filter((path) => path.length > 0)
	);
}

/**
 * Format and print dry-run output as JSON (with syntax highlighting on TTYs).
 */
export function formatDryRun({
	sensitiveBodyPaths,
	...output
}: DryRunInput): void {
	if (!sensitiveBodyPaths?.length) {
		formatOutput(output);
		return;
	}
	formatOutput({
		...output,
		body: redactDryRunBody(output.body, sensitiveBodyPaths),
	});
}
