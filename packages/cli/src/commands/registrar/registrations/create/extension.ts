import type { Cloudflare } from "#lib/auth.js";
import type { SchemaLookup } from "#lib/schema-cache.js";
/** Per-extension registration-schema lookup. */
import {
	describeSchemaFailure,
	pickSchema,
	readCachedSchema,
	writeCachedSchema,
} from "#lib/schema-cache.js";

const CACHE_NAMESPACE = "registrar-extension-schema";

/** Which extension a lookup resolved to, alongside its schema. */
type ExtensionSchema = SchemaLookup<{ extension: string }>;

/**
 * Extensions a domain might belong to, longest first.
 *
 * The registrable extension isn't simply the last label —
 * `example.co.uk` registers under `co.uk`. Getting that right in general
 * needs the Public Suffix List, which cf has no business shipping, so
 * candidates are tried longest-first and the API decides which exists.
 * `--extension` overrides the guess.
 *
 * `shop.example.co.uk` → `example.co.uk`, `co.uk`, `uk`.
 */
export function extensionCandidates(domain: string): string[] {
	const labels = domain.trim().toLowerCase().replace(/\.$/, "").split(".");
	// Skip the first label — that's the name being registered.
	return labels.slice(1).map((_, i) => labels.slice(i + 1).join("."));
}

async function fetchExtensionSchema(
	extension: string,
	accountId: string,
	client: Cloudflare,
	timeout?: number
): Promise<ExtensionSchema> {
	let result: unknown;
	try {
		result =
			timeout === undefined
				? await client.registrar.extensions.get({
						account_id: accountId,
						extension,
					})
				: await client.registrar.extensions.get(
						{ account_id: accountId, extension },
						{ timeoutInSeconds: timeout / 1000, maxRetries: 0 }
					);
	} catch (err) {
		return { ok: false, reason: describeSchemaFailure(err) };
	}
	const schema = pickSchema(result, "registration_schema");
	return schema
		? { ok: true, extension, schema }
		: {
				ok: false,
				reason: `the API returned no registration schema for .${extension}`,
			};
}

/**
 * Resolve the registration schema for a domain, trying candidate suffixes
 * unless `--extension` names one.
 *
 * A 404 means "not that suffix" and moves on; any other failure stops,
 * since retrying a network or auth error against every suffix is pointless.
 * `createClient` is a thunk so a cache hit doesn't resolve credentials on
 * what may be a `--help` invocation. Help supplies a deadline; normal
 * execution leaves it undefined and uses the SDK's standard request policy.
 */
export async function resolveRegistrationSchema(
	domain: string,
	extension: string | undefined,
	accountId: string,
	createClient: () => Promise<Cloudflare>,
	deadline?: number
): Promise<ExtensionSchema> {
	const candidates = extension ? [extension] : extensionCandidates(domain);
	if (candidates.length === 0) {
		return {
			ok: false,
			reason: `'${domain}' has no extension — pass a fully qualified domain name`,
		};
	}

	let client: Cloudflare | undefined;
	let lastReason = "not found";
	for (const candidate of candidates) {
		const cached = readCachedSchema(CACHE_NAMESPACE, [accountId, candidate]);
		if (cached) {
			return { ok: true, extension: candidate, schema: cached };
		}
		if (!client) {
			try {
				client = await createClient();
			} catch (err) {
				return { ok: false, reason: describeSchemaFailure(err) };
			}
		}
		let timeout: number | undefined;
		if (deadline !== undefined) {
			timeout = deadline - Date.now();
			if (timeout <= 0) {
				return { ok: false, reason: "the request timed out" };
			}
		}
		const lookup = await fetchExtensionSchema(
			candidate,
			accountId,
			client,
			timeout
		);
		if (lookup.ok) {
			writeCachedSchema(CACHE_NAMESPACE, [accountId, candidate], lookup.schema);
			return lookup;
		}
		lastReason = lookup.reason;
		if (!/not found/i.test(lookup.reason)) {
			return lookup;
		}
	}
	return {
		ok: false,
		reason:
			candidates.length > 1
				? `no registration schema for ${candidates.map((c) => `.${c}`).join(" or ")} (${lastReason})`
				: lastReason,
	};
}
