/**
 * On-disk cache for runtime-fetched request-body schemas.
 *
 * `--help` should be cheap the second time without going stale enough to
 * hide a new field. One file per key, never a prefetched catalogue: the
 * key space is thousands of models, and a stale or corrupt entry should
 * only affect the key it belongs to.
 *
 * Lives under workers-auth's canonical config directory but in its own
 * subtree — `state.json` carries a cross-version compatibility contract
 * (see `lib/state.ts`) and cached schemas have no business in it.
 */
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { getCfConfigPath } from "@cloudflare/workers-auth/cf";
import { VERSION } from "../version.js";
import type { JsonSchema } from "./schema-flags.js";

/** Total network budget for schema-backed help, including account discovery. */
export const SCHEMA_HELP_TIMEOUT_MS = 5000;

/**
 * These schemas change rarely, but `--help` shouldn't fetch every time.
 * An hour is about one fetch per key per sitting while still picking up a
 * new field the same day.
 */
const CACHE_TTL_MS = 60 * 60 * 1000;

interface CacheEntry {
	fetchedAt: number;
	schema: JsonSchema;
}

function isJsonSchema(
	value: unknown,
	seen = new WeakSet<object>()
): value is JsonSchema {
	if (value === null || typeof value !== "object" || Array.isArray(value)) {
		return false;
	}
	if (seen.has(value)) {
		return false;
	}
	seen.add(value);
	const schema = value as Record<string, unknown>;
	const validTypes = new Set([
		"array",
		"boolean",
		"integer",
		"null",
		"number",
		"object",
		"string",
	]);
	const types = Array.isArray(schema.type) ? schema.type : [schema.type];
	const numericKeywords = [
		"minLength",
		"maxLength",
		"minimum",
		"maximum",
		"multipleOf",
		"minItems",
		"maxItems",
		"minProperties",
		"maxProperties",
	];
	const exclusiveBoundKeywords = ["exclusiveMinimum", "exclusiveMaximum"];
	if (
		(schema.type !== undefined &&
			(types.length === 0 ||
				!types.every(
					(item) => typeof item === "string" && validTypes.has(item)
				))) ||
		(schema.description !== undefined &&
			typeof schema.description !== "string") ||
		(schema.title !== undefined && typeof schema.title !== "string") ||
		(schema.required !== undefined &&
			(!Array.isArray(schema.required) ||
				!schema.required.every((item) => typeof item === "string"))) ||
		(schema.enum !== undefined && !Array.isArray(schema.enum)) ||
		(schema.oneOf !== undefined &&
			(!Array.isArray(schema.oneOf) ||
				schema.oneOf.length === 0 ||
				!schema.oneOf.every((item) => isJsonSchema(item, seen)))) ||
		(schema.anyOf !== undefined &&
			(!Array.isArray(schema.anyOf) ||
				schema.anyOf.length === 0 ||
				!schema.anyOf.every((item) => isJsonSchema(item, seen)))) ||
		(schema.allOf !== undefined &&
			(!Array.isArray(schema.allOf) ||
				schema.allOf.length === 0 ||
				!schema.allOf.every((item) => isJsonSchema(item, seen)))) ||
		(schema.if !== undefined && !isJsonSchema(schema.if, seen)) ||
		(schema.then !== undefined && !isJsonSchema(schema.then, seen)) ||
		(schema.additionalProperties !== undefined &&
			typeof schema.additionalProperties !== "boolean" &&
			!isJsonSchema(schema.additionalProperties, seen)) ||
		(schema.uniqueItems !== undefined &&
			typeof schema.uniqueItems !== "boolean") ||
		numericKeywords.some(
			(key) =>
				schema[key] !== undefined &&
				(typeof schema[key] !== "number" || !Number.isFinite(schema[key]))
		) ||
		exclusiveBoundKeywords.some(
			(key) =>
				schema[key] !== undefined &&
				typeof schema[key] !== "boolean" &&
				(typeof schema[key] !== "number" || !Number.isFinite(schema[key]))
		)
	) {
		return false;
	}
	if (schema.items !== undefined) {
		const items = Array.isArray(schema.items) ? schema.items : [schema.items];
		if (!items.every((item) => isJsonSchema(item, seen))) {
			return false;
		}
	}
	if (schema.properties !== undefined) {
		if (
			schema.properties === null ||
			typeof schema.properties !== "object" ||
			Array.isArray(schema.properties)
		) {
			return false;
		}
		if (
			!Object.values(schema.properties).every((item) =>
				isJsonSchema(item, seen)
			)
		) {
			return false;
		}
	}
	if (schema.pattern !== undefined) {
		if (typeof schema.pattern !== "string") {
			return false;
		}
		try {
			new RegExp(schema.pattern);
		} catch {
			return false;
		}
	}
	return true;
}

/**
 * Result of a runtime schema lookup. Failure is a value, not a throw: every
 * caller degrades to `--body` rather than propagating.
 */
export type SchemaLookup<Extra = unknown> =
	| ({ ok: true; schema: JsonSchema } & Extra)
	| { ok: false; reason: string };

/**
 * Pull a schema out of an API response, tolerantly.
 *
 * Responses wrap it under a key (`input`, `registration_schema`) but a
 * response that doesn't look like a schema at all should degrade to
 * `--body`, not throw — hence the shape check rather than a cast.
 */
export function pickSchema(
	result: unknown,
	key: string
): JsonSchema | undefined {
	if (result === null || typeof result !== "object") {
		return undefined;
	}
	const inner = (result as Record<string, unknown>)[key] ?? result;
	if (inner === null || typeof inner !== "object") {
		return undefined;
	}
	if (!isJsonSchema(inner)) {
		return undefined;
	}
	const candidate = inner;
	return (candidate.properties ??
		candidate.oneOf ??
		candidate.anyOf ??
		candidate.allOf)
		? candidate
		: undefined;
}

function cachePath(namespace: string, keyParts: readonly string[]): string {
	const digest = createHash("sha256")
		.update([VERSION, ...keyParts].join(" "))
		.digest("hex")
		.slice(0, 32);
	return join(getCfConfigPath(), "cache", namespace, `${digest}.json`);
}

/** A cached schema, if one is present and still fresh. */
export function readCachedSchema(
	namespace: string,
	keyParts: readonly string[]
): JsonSchema | undefined {
	try {
		const entry = JSON.parse(
			readFileSync(cachePath(namespace, keyParts), "utf-8")
		) as CacheEntry;
		return typeof entry?.fetchedAt === "number" &&
			Date.now() - entry.fetchedAt <= CACHE_TTL_MS &&
			isJsonSchema(entry.schema)
			? entry.schema
			: undefined;
	} catch {
		return undefined;
	}
}

/**
 * Cache a schema. Failures are swallowed — a read-only home directory or
 * a sandboxed CI runner is normal, and a cache miss isn't worth surfacing.
 */
export function writeCachedSchema(
	namespace: string,
	keyParts: readonly string[],
	schema: JsonSchema
): void {
	try {
		const path = cachePath(namespace, keyParts);
		mkdirSync(dirname(path), { recursive: true });
		const entry: CacheEntry = { fetchedAt: Date.now(), schema };
		writeFileSync(path, JSON.stringify(entry), "utf-8");
	} catch {
		/* ignore */
	}
}

/** Describe a failed schema fetch in one clause. Never throws. */
export function describeSchemaFailure(err: unknown): string {
	if (err === null || typeof err !== "object") {
		return "the request failed";
	}
	const status = (err as { statusCode?: number }).statusCode;
	if (status === 404) {
		return "not found, or this account can't access it";
	}
	if (status === 401) {
		return "credentials were rejected; update `CLOUDFLARE_API_TOKEN` or run `cf auth login`";
	}
	if (status === 403) {
		return "these credentials can't read it — check your API token permissions";
	}
	const message = (err as Error).message;
	if (!message) {
		return "the request failed";
	}
	const firstLine = (message.split("\n")[0] ?? "").replace(/\.$/, "");
	return /^"?timeout"?$/i.test(firstLine) ? "the request timed out" : firstLine;
}
