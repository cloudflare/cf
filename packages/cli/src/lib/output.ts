import { hasQuietFlag } from "./args.js";
import { isNonInteractiveOrCI } from "./interactive.js";
import { supportsColor, theme } from "./ui/theme.js";
import { getResultInfo } from "#api";

/** Maximum JSON size (in characters) for syntax highlighting - prevents performance issues */
const MAX_HIGHLIGHTED_JSON_SIZE = 50_000;

export interface OutputOptions {
	quiet?: boolean;
	/** Short human-readable description of the completed action (e.g. "Updated value"). When the API returns null (successful mutation with no payload), printed to stderr as `✓ <successLabel>` on TTYs, silent otherwise. */
	successLabel?: string;
}

function outputPayload(data: unknown): {
	payload: unknown;
	resultInfo: unknown;
} {
	if (
		data !== null &&
		typeof data === "object" &&
		"result" in data &&
		Array.isArray(data.result) &&
		"result_info" in data
	) {
		return { payload: data.result, resultInfo: data.result_info };
	}
	return { payload: data, resultInfo: getResultInfo(data) };
}

/**
 * The `✓` line confirming that a command finished. It prints only when
 * stderr is a terminal and `--quiet` is off; scripts read the exit code
 * instead.
 */
export function printSuccess(message: string): void {
	if (process.stderr.isTTY && !hasQuietFlag()) {
		process.stderr.write(`${theme.success("✓")} ${message}\n`);
	}
}

/**
 * Format and output data as JSON.
 *
 * - If options.quiet is true, outputs nothing
 * - If data is null/undefined and options.successLabel is set, prints a ✓
 *   confirmation to stderr on TTYs (and stays silent on stdout so scripts
 *   piping to jq don't see `null`)
 * - Otherwise outputs pretty-printed JSON (highlighted in interactive terminals)
 * - Pagination metadata is printed as a plain `result_info: {...}` line on
 *   stderr, including when redirected, unless `--quiet` is set
 *
 * Callers who need newline-delimited JSON pipe through `jq -c '.[]'` or
 * similar — cf does not surface an ndjson toggle.
 */
export function formatOutput(data: unknown, options: OutputOptions = {}): void {
	if (options.quiet) {
		return;
	}
	const { payload, resultInfo } = outputPayload(data);
	if (
		!hasQuietFlag() &&
		resultInfo !== null &&
		typeof resultInfo === "object" &&
		Object.keys(resultInfo).length > 0
	) {
		process.stderr.write(`result_info: ${JSON.stringify(resultInfo)}\n`);
	}

	// Null/undefined result: a successful mutation with no interesting body.
	// Stay silent on stdout (scripts piping to jq get an empty stream, not
	// the literal string 'null'), and — on TTYs only — write a brief ✓
	// line to stderr so humans know it worked.
	if (payload === null || payload === undefined) {
		if (options.successLabel) {
			printSuccess(options.successLabel);
		}
		return;
	}

	console.log(formatJson(payload));
}

/**
 * Format JSON with syntax highlighting.
 * JSON values use semantic theme roles. Skips highlighting for large outputs
 * to prevent performance issues.
 */
function formatJson(data: unknown): string {
	const json = JSON.stringify(data, null, 2);

	// Non-interactive output must remain parseable even when FORCE_COLOR is set.
	if (
		isNonInteractiveOrCI(process.stdout) ||
		!supportsColor() ||
		json.length > MAX_HIGHLIGHTED_JSON_SIZE
	) {
		return json;
	}

	return json
		.replace(
			// Match a quoted key followed by a colon, consuming escapes as pairs
			// so escaped quotes inside a value cannot be mistaken for key delimiters.
			/"((?:[^"\\]|\\.)*)":/g,
			(_match, key) => `${theme.jsonKey(`"${key}"`)}:`
		)
		.replace(
			// Match a quoted value after a colon, consuming escapes as pairs
			// so only an unescaped quote can end the string.
			/: "((?:[^"\\]|\\.)*)"/g,
			(_match, value) => `: ${theme.jsonString(`"${value}"`)}`
		)
		.replace(/: (-?\d+\.?\d*)/g, (_match, num) => `: ${theme.jsonNumber(num)}`)
		.replace(
			/: (true|false)/g,
			(_match, bool) => `: ${theme.jsonBoolean(bool)}`
		)
		.replace(/: (null)/g, (_match, n) => `: ${theme.muted(n)}`);
}
