/**
 * TTL cache of fetched API data under workers-auth's canonical config
 * directory, in its own subtree: `state.json` carries a cross-version
 * compatibility contract (see `lib/state.ts`) and cached responses have no
 * business in it. Keys include the cf version, so a cf with a different
 * entry shape never reads another version's file.
 */
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { getCfConfigPath } from "@cloudflare/workers-auth/cf";
import { VERSION } from "../version.js";

interface CacheEntry {
	fetchedAt: number;
	value: unknown;
}

function cachePath(namespace: string, keyParts: readonly string[]): string {
	const digest = createHash("sha256")
		.update([VERSION, ...keyParts].join(" "))
		.digest("hex")
		.slice(0, 32);
	return join(getCfConfigPath(), "cache", namespace, `${digest}.json`);
}

/**
 * A cached value, if one is present, younger than `ttlMs`, and accepted by
 * `parse`.
 */
export function readCached<T>(
	namespace: string,
	keyParts: readonly string[],
	ttlMs: number,
	parse: (value: unknown) => T | undefined
): T | undefined {
	try {
		const entry = JSON.parse(
			readFileSync(cachePath(namespace, keyParts), "utf-8")
		) as CacheEntry;
		return typeof entry?.fetchedAt === "number" &&
			Date.now() - entry.fetchedAt <= ttlMs
			? parse(entry.value)
			: undefined;
	} catch {
		return undefined;
	}
}

/**
 * Cache a value. Failures are swallowed — a read-only home directory or
 * a sandboxed CI runner is normal, and a cache miss isn't worth surfacing.
 */
export function writeCached(
	namespace: string,
	keyParts: readonly string[],
	value: unknown
): void {
	try {
		const path = cachePath(namespace, keyParts);
		mkdirSync(dirname(path), { recursive: true });
		const entry: CacheEntry = { fetchedAt: Date.now(), value };
		writeFileSync(path, JSON.stringify(entry), "utf-8");
	} catch {
		/* ignore */
	}
}
