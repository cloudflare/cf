/**
 * Body Parser
 *
 * Parses raw JSON input from the `--body` CLI flag and reconstructs
 * request bodies from individual CLI flags.
 *
 * No value "hardening" happens here. cf is a client-side CLI driving the
 * user's own credentials — there's no trust boundary — and the SDK
 * JSON-serialises the body before sending, so any byte (control chars
 * included) is escaped into valid JSON. The API, not cf, is the
 * authority on what a field may contain.
 */

import { readFileSync } from "node:fs";
import { resolve as resolvePath } from "node:path";

/**
 * Set a value at a nested path in an object, creating intermediate objects as needed.
 * Used by generated commands to reconstruct the API request body from flat CLI flags.
 *
 * @example
 * const body = {};
 * setNestedValue(body, ['origin', 'host'], 'db.example.com');
 * // body = { origin: { host: 'db.example.com' } }
 */
export function setNestedValue(
	obj: Record<string, unknown>,
	path: string[],
	value: unknown
): void {
	if (path.length === 0) {
		return;
	}
	let current: Record<string, unknown> = obj;
	for (let i = 0; i < path.length - 1; i++) {
		const key = path[i] ?? "";
		if (!current[key] || typeof current[key] !== "object") {
			current[key] = {};
		}
		current = current[key] as Record<string, unknown>;
	}
	const lastKey = path[path.length - 1] ?? "";
	current[lastKey] = value;
}

export function compactBody<T>(value: unknown): T {
	const compact = (item: unknown): unknown => {
		if (Array.isArray(item)) {
			return item;
		}
		if (item === null || typeof item !== "object") {
			return item;
		}
		const entries = Object.entries(item).flatMap(([key, child]) => {
			const compacted = compact(child);
			if (compacted === undefined) {
				return [];
			}
			if (
				typeof compacted === "object" &&
				compacted !== null &&
				!Array.isArray(compacted) &&
				Object.keys(compacted).length === 0
			) {
				return [];
			}
			return [[key, compacted]];
		});
		return Object.fromEntries(entries);
	};
	return compact(value) as T;
}
/**
 * Parse a raw JSON string from the --body flag.
 *
 * Accepts any valid JSON: objects, arrays, strings, numbers, booleans, null.
 * Some APIs require non-object bodies (e.g. KV bulk ops need arrays,
 * KV values-update needs a plain string).
 *
 * Following curl's `-d @file` convention, an input starting with `@`
 * is treated as a filesystem path: the file is read as UTF-8 text and
 * the contents are JSON-parsed.  A literal `@`-prefixed JSON value
 * cannot be passed via `--body`; users who need that should construct
 * the body as a string flag from a different command, or `cat` the
 * payload through `xargs`.  This matches `curl -d @foo` behaviour.
 *
 * @param input - Raw JSON string from the CLI, or `@path/to/file.json`.
 * @returns Parsed value
 * @throws Error if JSON is invalid
 */
function parseJson<T>(input: string, flagName: string): T {
	const flag = flagName.startsWith("--") ? flagName : `--${flagName}`;
	let jsonText: string = input;
	if (input.startsWith("@")) {
		const path = input.slice(1);
		if (path.length === 0) {
			throw new Error(
				`${flag} '@' must be followed by a file path (got empty path)`
			);
		}
		const abs = resolvePath(path);
		try {
			jsonText = readFileSync(abs, "utf-8");
		} catch (err) {
			const reason = err instanceof Error ? err.message : "unknown read error";
			throw new Error(`${flag}: cannot read file at '${path}': ${reason}`);
		}
	}
	try {
		return JSON.parse(jsonText) as T;
	} catch {
		throw new Error(`Invalid JSON in ${flag}. Expected valid JSON.`);
	}
}

export function parseBody<T = unknown>(input: string): T {
	return parseJson<T>(input, "body");
}

/**
 * Parse one JSON-valued object-array body flag.
 *
 * Forge keeps direct request-body arrays of objects intact instead of
 * flattening their item properties. The generated command therefore accepts
 * the whole array as one JSON string (or `@file`) and validates only the shape
 * Forge promises: an array whose every item is a non-null JSON object. The API
 * remains responsible for validating each object's schema.
 */
export function parseObjectArray(
	input: unknown,
	flagName: string
): Record<string, unknown>[] | undefined {
	if (input === undefined) {
		return undefined;
	}

	const flag = flagName.startsWith("--") ? flagName : `--${flagName}`;
	if (typeof input !== "string") {
		throw new Error(
			`${flag} must be provided once as a JSON array of objects.`
		);
	}
	const value = parseJson<unknown>(input, flagName);
	if (
		!Array.isArray(value) ||
		value.some(
			(item) => item === null || typeof item !== "object" || Array.isArray(item)
		)
	) {
		throw new Error(`${flag} must be a JSON array of objects.`);
	}
	return value as Record<string, unknown>[];
}
