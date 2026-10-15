/**
 * Body Parser
 *
 * Parses raw JSON input from the `--body` CLI flag and reconstructs
 * request bodies from individual CLI flags.
 *
 * No value "hardening" happens here. cf is a client-side CLI driving the
 * user's own credentials — there's no trust boundary — and the client
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

export function compactBody<T>(
	value: unknown,
	preservePaths: readonly (readonly string[])[] = []
): T {
	const compact = (item: unknown, path: readonly string[]): unknown => {
		if (Array.isArray(item)) {
			return item;
		}
		if (item === null || typeof item !== "object") {
			return item;
		}
		const entries = Object.entries(item).flatMap(([key, child]) => {
			const childPath = [...path, key];
			const preserve = preservePaths.some(
				(p) =>
					p.length === childPath.length &&
					p.every((part, i) => part === childPath[i])
			);
			const compacted = preserve ? child : compact(child, childPath);
			if (compacted === undefined) {
				return [];
			}
			if (
				!preserve &&
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
	return compact(value, []) as T;
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

export function parseBody<T = unknown>(
	input: string,
	requiredMaps: readonly { path: readonly string[]; flag: string }[] = []
): T {
	const body = parseJson<unknown>(input, "body");
	for (const { path, flag } of requiredMaps) {
		let value: unknown = body;
		for (const key of path) {
			value =
				isJsonObject(value) && Object.hasOwn(value, key)
					? value[key]
					: undefined;
		}
		if (!isJsonObject(value)) {
			throw new Error(
				`--body must include a JSON object at ${path.join(".")} (for --${flag}).`
			);
		}
	}
	return body as T;
}

function isJsonObject(value: unknown): value is Record<string, unknown> {
	return value !== null && typeof value === "object" && !Array.isArray(value);
}

/** Parse a map as one JSON object, retaining its keys and values verbatim. */
export function parseJsonMap(
	input: unknown,
	flagName: string,
	required = false
): Record<string, unknown> | undefined {
	const flag = flagName.startsWith("--") ? flagName : `--${flagName}`;
	if (input === undefined) {
		if (required) {
			throw new Error(
				`${flag} is required (or pass --body with this field set).`
			);
		}
		return undefined;
	}
	if (typeof input !== "string") {
		throw new Error(`${flag} must be provided once as a JSON object.`);
	}
	const value = parseJson<unknown>(input, flagName);
	if (!isJsonObject(value)) {
		throw new Error(`${flag} must be a JSON object.`);
	}
	return value;
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
