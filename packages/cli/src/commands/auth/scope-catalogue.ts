/**
 * Cloudflare's OAuth scope catalogue (`GET /oauth/scopes`): every scope an
 * OAuth client can request, with the category the consent screen groups it
 * under. Cached on disk so repeat runs of `cf auth scopes` stay local.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { getCfConfigPath } from "@cloudflare/workers-auth/cf";
import type { Cloudflare } from "#lib/auth.js";
import listOAuthScopes from "#operations/oauth-scopes/list.js";

export interface CatalogueScope {
	id: string;
	name: string;
	category?: string;
}

/** Catalogue entries by scope id. */
export type ScopeCatalogue = ReadonlyMap<string, CatalogueScope>;

// Cloudflare adds scopes rarely; a day keeps repeat runs off the network
// while still picking up a new scope soon after it ships.
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

interface CacheEntry {
	fetchedAt: number;
	scopes: unknown;
}

function cachePath(): string {
	return join(getCfConfigPath(), "cache", "oauth-scopes.json");
}

function parseScopes(value: unknown): CatalogueScope[] | undefined {
	if (!Array.isArray(value)) {
		return undefined;
	}
	const scopes: CatalogueScope[] = [];
	for (const item of value) {
		const { id, name, category } = (item ?? {}) as Record<string, unknown>;
		if (
			typeof id !== "string" ||
			typeof name !== "string" ||
			(category !== undefined && typeof category !== "string")
		) {
			return undefined;
		}
		scopes.push({ id, name, category });
	}
	return scopes;
}

function toCatalogue(scopes: CatalogueScope[]): ScopeCatalogue {
	return new Map(scopes.map((scope) => [scope.id, scope]));
}

function readCache(): CatalogueScope[] | undefined {
	try {
		const entry = JSON.parse(readFileSync(cachePath(), "utf-8")) as CacheEntry;
		return typeof entry?.fetchedAt === "number" &&
			Date.now() - entry.fetchedAt <= CACHE_TTL_MS
			? parseScopes(entry.scopes)
			: undefined;
	} catch {
		return undefined;
	}
}

// A read-only home directory or sandboxed runner is normal; a cache miss
// isn't worth surfacing.
function writeCache(scopes: CatalogueScope[]): void {
	try {
		const path = cachePath();
		mkdirSync(dirname(path), { recursive: true });
		const entry: CacheEntry = { fetchedAt: Date.now(), scopes };
		writeFileSync(path, JSON.stringify(entry), "utf-8");
	} catch {
		/* ignore */
	}
}

/**
 * The scope catalogue, from the cache when fresh. `createClient` is a thunk
 * so a cache hit doesn't resolve credentials. Throws when the fetch fails.
 */
export async function loadScopeCatalogue(
	createClient: () => Promise<Cloudflare>
): Promise<ScopeCatalogue> {
	const cached = readCache();
	if (cached) {
		return toCatalogue(cached);
	}
	const client = await createClient();
	// The client returns a list as `{ result, result_info }`.
	const response = await client.send(listOAuthScopes);
	const scopes = parseScopes(
		response !== null && typeof response === "object" && "result" in response
			? response.result
			: response
	);
	if (!scopes) {
		throw new Error("the API returned an unexpected scope catalogue");
	}
	writeCache(scopes);
	return toCatalogue(scopes);
}
