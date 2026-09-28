/**
 * Response output-kind classification.
 *
 * Maps an operation's success-response MIME types into one of four
 * categories the generator branches on when emitting the response
 * handling path:
 *
 *   - `json` — go through the SDK envelope, JSON output.
 *   - `binary` — `application/octet-stream` and friends (zip, pdf,
 *     image, multipart). The handler bypasses the SDK and pipes
 *     response bytes straight to stdout via `writeRawOutput`.
 *   - `text` — `text/*` MIMEs. Same bypass as binary but the response
 *     is decoded as UTF-8 unconditionally (binary has a `--text`
 *     toggle).
 *   - `websocket` — only `101 Switching Protocols`; cf can't drive
 *     these yet, but the classifier surfaces them rather than
 *     asserting.
 */
import assert from "node:assert";
import type { resolveOperation } from "@cloudflare/forge";

export type OutputKind = "json" | "binary" | "text" | "websocket";

const BINARY_CONTENT_TYPES = new Set([
	"application/octet-stream",
	"application/zip",
	"application/pdf",
	"application/vnd.tcpdump.pcap",
	"multipart/form-data",
]);

const TEXT_CONTENT_TYPES = new Set([
	"text/plain",
	"text/csv",
	"text/html",
	"text/vtt",
]);

export function deriveOutputKind(
	opInfo: ReturnType<typeof resolveOperation> | null
): OutputKind {
	assert(opInfo?.responses, `No responses found for "${opInfo?.path}"`);

	let successResponse =
		opInfo.responses["200"] ??
		opInfo.responses["201"] ??
		opInfo.responses["202"] ??
		opInfo.responses["204"];

	// TODO: cf can't handle this well today
	if (!successResponse && opInfo.responses["101"]) {
		return "websocket";
	}

	if (opInfo.responses["2XX"]) {
		console.warn(
			`[cf-generator] No "success" responses found for:\n  ${opInfo.method}:${opInfo.path}\n Found: ${Object.keys(opInfo.responses)}`
		);
		successResponse = opInfo.responses["2XX"];
	}

	assert(
		successResponse,
		`No "success" responses found for:\n  ${opInfo.method}:${opInfo.path}\n Found: ${Object.keys(opInfo.responses)}`
	);

	const contentTypes = Object.keys(successResponse.content);

	if (
		contentTypes.some(
			(ct) => BINARY_CONTENT_TYPES.has(ct) || ct.startsWith("image/")
		)
	) {
		return "binary";
	}

	if (contentTypes.some((ct) => TEXT_CONTENT_TYPES.has(ct))) {
		return "text";
	}

	if (
		contentTypes.length === 0 ||
		!contentTypes.some(
			(ct) => ct === "application/json" || ct.endsWith("+json")
		)
	) {
		console.warn(
			`[cf-generator] JSON content type not included for:\n  ${opInfo.method}:${opInfo.path}\n Found: ${contentTypes}`
		);
	}

	return "json";
}
