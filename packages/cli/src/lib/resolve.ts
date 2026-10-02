/**
 * Resource name resolution utilities
 *
 * Allows users to use friendly names instead of UUIDs
 */
import type { Cloudflare } from "./auth.js";

/**
 * Small in-memory TTL cache for resolver lookups (e.g. zone names).
 *
 * Used to avoid repeated API calls when a single cf invocation resolves
 * the same friendly name more than once, or when the SDK's per-process
 * lifetime sees several quick calls in a row. 60s default mirrors the
 * previous standalone `completion-cache.ts` helper that lived here for
 * the same reason; inlined to drop one indirection.
 */
const RESOLVE_CACHE = new Map<string, { data: unknown; expires: number }>();
async function getCached<T>(
	key: string,
	fetcher: () => Promise<T>,
	ttlMs = 60_000
): Promise<T> {
	const entry = RESOLVE_CACHE.get(key);
	const now = Date.now();
	if (entry && entry.expires > now) {
		return entry.data as T;
	}
	const data = await fetcher();
	RESOLVE_CACHE.set(key, { data, expires: now + ttlMs });
	return data;
}

/**
 * Check if a string is a valid UUID v4
 */
export function isUUID(str: string): boolean {
	const uuidRegex =
		/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
	return uuidRegex.test(str);
}

/**
 * Check if a string looks like a Cloudflare ID (32 hex chars)
 */
export function isCloudflareId(str: string): boolean {
	return /^[0-9a-f]{32}$/i.test(str);
}

/**
 * Check if a string is any kind of ID (UUID or Cloudflare ID)
 */
export function isId(str: string): boolean {
	return isUUID(str) || isCloudflareId(str);
}

/**
 * Validate that a string looks like a valid domain name
 * Allows: letters, numbers, hyphens, dots
 * Must start and end with alphanumeric
 */
export function isValidDomainName(str: string): boolean {
	// Basic validation: must be 1-253 chars, contain only valid chars
	if (!str || str.length > 253) {
		return false;
	}

	// Must contain at least one dot (e.g., example.com)
	if (!str.includes(".")) {
		return false;
	}

	// Check each label (part between dots)
	const labels = str.split(".");
	for (const label of labels) {
		// Labels must be 1-63 chars
		if (label.length === 0 || label.length > 63) {
			return false;
		}
		// Must start with alphanumeric
		if (!/^[a-zA-Z0-9]/.test(label)) {
			return false;
		}
		// Must end with alphanumeric
		if (!/[a-zA-Z0-9]$/.test(label)) {
			return false;
		}
		// Can only contain alphanumeric and hyphens
		if (!/^[a-zA-Z0-9-]+$/.test(label)) {
			return false;
		}
	}

	return true;
}

/**
 * Zone information
 */
interface Zone {
	id: string;
	name: string;
	status?: string;
	account?: {
		id?: string;
		name?: string;
	};
}

/**
 * Resolve a zone ID or name to a zone ID
 *
 * If the input looks like a UUID/ID, return it as-is.
 * Otherwise, look up the zone by name.
 *
 * @param client - Cloudflare SDK client
 * @param accountId - Account ID to search in
 * @param zoneIdOrName - Zone ID or zone name (e.g., "example.com")
 * @returns Zone ID
 * @throws Error if zone not found
 */
export async function resolveZoneId(
	client: Cloudflare,
	accountId: string,
	zoneIdOrName: string
): Promise<string> {
	// If it looks like an ID, return as-is
	if (isId(zoneIdOrName)) {
		return zoneIdOrName;
	}

	// Validate domain name format before making API call
	if (!isValidDomainName(zoneIdOrName)) {
		throw new Error(
			`Invalid zone identifier: "${zoneIdOrName}". Must be a zone ID or valid domain name.`
		);
	}

	// Otherwise, look up by name
	const zoneName = zoneIdOrName.toLowerCase();
	const cacheKey = `zones:${accountId}:${zoneName}`;
	const zones = await getCached<Zone[]>(cacheKey, async () => {
		return (
			await client.zones.list({ "account.id": accountId, name: zoneName })
		).result;
	});

	const zone = zones.find((z) => z.name.toLowerCase() === zoneName);

	if (!zone) {
		throw new Error(`Zone not found: ${zoneIdOrName}`);
	}

	return zone.id;
}
