/**
 * `@file` ingestion helpers for generated CLI commands.
 *
 * cf does NOT pre-validate or "harden" resource ids, string flags, or
 * body values. It is a client-side CLI driving the user's own
 * credentials — there is no trust boundary, so rejecting `..`, control
 * chars, or `?#%` guards nothing the user couldn't achieve by calling
 * the API directly. Correct wire encoding is the SDK's responsibility:
 * path params are percent-encoded (`encodeURIComponent(...)`) and bodies
 * are JSON-serialised (control bytes escape into valid JSON), so the
 * API — not cf — is the authority on what a value may contain.
 *
 * What remains here is the curl-style `@file` ingestion used by body
 * flags.
 */

import { readFileSync } from "node:fs";
import { resolve as resolvePath } from "node:path";

/**
 * Read a `--file <path>` flag value into a Buffer, with friendly errors.
 *
 * Used by generated handlers for non-JSON `--file` uploads (raw
 * octet-stream bodies and multipart payload fields). Unlike a bare
 * `readFileSync`, this:
 *   - wraps read failures (ENOENT, EACCES, …) so the user sees
 *     `Cannot read invalid or empty file: <path>` instead of a raw
 *     `node:fs` stack trace,
 *   - preserves the user-supplied path in the message rather than the
 *     resolved absolute path (no cwd leak into scripted CI logs),
 *   - rejects empty files up-front instead of sending a zero-byte body
 *     that the API rejects with an opaque 500.
 *
 * The path is resolved relative to `process.cwd()`, matching shell
 * conventions and `resolveFileToken` above.
 */
export function readFileForFlag(filePath: string): Buffer<ArrayBuffer> {
	let bytes: Buffer<ArrayBuffer>;
	try {
		bytes = readFileSync(resolvePath(filePath));
	} catch {
		throw new Error(`Cannot read invalid or empty file: ${filePath}`);
	}
	if (bytes.byteLength === 0) {
		throw new Error(`Cannot read invalid or empty file: ${filePath}`);
	}
	return bytes;
}

/**
 * Resolve a CLI flag value that may carry an `@path/to/file` token.
 *
 * Follows curl's `-d @file` convention:
 *   - `@path`  — read the file at `path` and substitute its contents.
 *   - any value not starting with `@` — pass through unchanged.
 *   - `value === undefined` — pass through unchanged.
 *
 * Applied to every string-typed body field by default (matching curl's
 * unconditional `-d` behaviour) unless the forge overlay opts out via
 * `params: { <field>: { fromFile: false } }`.  A literal value starting
 * with `@` cannot opt out for an opted-in flag — users who need a
 * literal `@` prefix should use `--body` (which preserves the value
 * verbatim) or shell-escape through a different flag.  This matches
 * curl: `curl -d @foo` always interprets `@`; the escape is
 * `--data-raw` instead.
 *
 * Errors:
 *   - File missing or unreadable → wrapped error with the flag name.
 *   - JSON format on invalid JSON → wrapped error with the flag name.
 *
 * Path resolution is relative to `process.cwd()`, matching shell
 * conventions.  No path-traversal or content hardening — this reads
 * from the user's own machine on behalf of an interactive user.
 */
export function resolveFileToken(
	value: string | undefined,
	fieldName: string,
	format: "text" | "binary" | "base64" | "json" = "text"
): unknown {
	if (value === undefined) {
		return value;
	}
	if (!value.startsWith("@")) {
		// Literal value passes through unchanged.
		return value;
	}
	const path = value.slice(1);
	if (path.length === 0) {
		throw new Error(
			`--${fieldName} '@' must be followed by a file path (got empty path)`
		);
	}
	const abs = resolvePath(path);
	let bytes: Buffer;
	try {
		bytes = readFileSync(abs);
	} catch (err) {
		const reason = err instanceof Error ? err.message : "unknown read error";
		throw new Error(`--${fieldName}: cannot read file at '${path}': ${reason}`);
	}
	switch (format) {
		case "text":
			return bytes.toString("utf-8");
		case "binary":
			return bytes;
		case "base64":
			return bytes.toString("base64");
		case "json": {
			const text = bytes.toString("utf-8");
			try {
				return JSON.parse(text);
			} catch (err) {
				const reason =
					err instanceof Error ? err.message : "unknown JSON parse error";
				throw new Error(
					`--${fieldName}: file at '${path}' is not valid JSON: ${reason}`
				);
			}
		}
	}
}
