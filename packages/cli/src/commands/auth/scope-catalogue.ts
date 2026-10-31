/**
 * Cloudflare's OAuth scope catalogue (`GET /oauth/scopes`): every scope an
 * OAuth client can request, with the category the consent screen groups it
 * under. Cached on disk so repeat runs of `cf auth scopes` stay local.
 */
import { readCached, writeCached } from "../../lib/disk-cache.js";
import type { Cloudflare } from "#lib/auth.js";

export interface CatalogueScope {
	id: string;
	name: string;
	category?: string;
}

/** Catalogue entries by scope id. */
export type ScopeCatalogue = ReadonlyMap<string, CatalogueScope>;

const CACHE_NAMESPACE = "oauth-scopes";

// Cloudflare adds scopes rarely; a day keeps repeat runs off the network
// while still picking up a new scope soon after it ships.
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

// One malformed entry shouldn't cost every other scope its group: skip
// entries without an id, and treat a missing or non-string category as
// uncategorized.
function parseScopes(value: unknown): CatalogueScope[] | undefined {
	if (!Array.isArray(value)) {
		return undefined;
	}
	const scopes: CatalogueScope[] = [];
	for (const item of value) {
		const { id, name, category } = (item ?? {}) as Record<string, unknown>;
		if (typeof id !== "string") {
			continue;
		}
		scopes.push({
			id,
			name: typeof name === "string" ? name : id,
			...(typeof category === "string" && { category }),
		});
	}
	return scopes.length > 0 ? scopes : undefined;
}

function toCatalogue(scopes: CatalogueScope[]): ScopeCatalogue {
	return new Map(scopes.map((scope) => [scope.id, scope]));
}

/**
 * The scope catalogue, from the cache when fresh. `createClient` is a thunk
 * so a cache hit doesn't resolve credentials. Throws when the fetch fails.
 */
export async function loadScopeCatalogue(
	createClient: () => Promise<Cloudflare>
): Promise<ScopeCatalogue> {
	const cached = readCached(CACHE_NAMESPACE, [], CACHE_TTL_MS, parseScopes);
	if (cached) {
		return toCatalogue(cached);
	}
	const [client, { default: listOAuthScopes }] = await Promise.all([
		createClient(),
		import("#operations/oauth-scopes/list.js"),
	]);
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
	writeCached(CACHE_NAMESPACE, [], scopes);
	return toCatalogue(scopes);
}
