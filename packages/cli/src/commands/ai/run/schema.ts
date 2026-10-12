import type { Cloudflare } from "#lib/auth.js";
import type { SchemaLookup } from "#lib/schema-cache.js";
/**
 * `cf ai run`'s model input-schema lookup.
 *
 * `/ai/models/schema?model=<id>` is account-scoped, so it answers both
 * halves of the problem this command exists to solve: flags are accurate
 * per model, and a model the caller isn't entitled to 404s rather than
 * being enumerated anywhere. Every failure is non-fatal — a missing schema
 * means "fall back to `--body`", never a crash and never a hang.
 */
import {
	describeSchemaFailure,
	pickSchema,
	readCachedSchema,
	writeCachedSchema,
} from "#lib/schema-cache.js";

const CACHE_NAMESPACE = "ai-model-schema";

/**
 * Fetch a model's input schema, preferring a fresh cache entry.
 *
 * `createClient` is a thunk so a cache hit doesn't build a client, which
 * would resolve credentials on what may be a `--help` invocation. Help
 * supplies a deadline; normal execution uses the SDK's request policy.
 */
export async function getModelInputSchema(
	model: string,
	accountId: string,
	createClient: () => Promise<Cloudflare>,
	deadline?: number
): Promise<SchemaLookup> {
	const cached = readCachedSchema(CACHE_NAMESPACE, [accountId, model]);
	if (cached) {
		return { ok: true, schema: cached };
	}

	let result: unknown;
	try {
		const client = await createClient();
		if (deadline === undefined) {
			result = await client.ai.getModelSchema({
				account_id: accountId,
				model,
			});
		} else {
			const timeout = deadline - Date.now();
			if (timeout <= 0) {
				return { ok: false, reason: "the request timed out" };
			}
			result = await client.ai.getModelSchema(
				{ account_id: accountId, model },
				{ timeoutInSeconds: timeout / 1000, maxRetries: 0 }
			);
		}
	} catch (err) {
		return { ok: false, reason: describeSchemaFailure(err) };
	}

	// The endpoint returns `{ input, output }`; only the input side shapes
	// flags.
	const schema = pickSchema(result, "input");
	if (!schema) {
		return { ok: false, reason: "the API returned no input schema" };
	}
	writeCachedSchema(CACHE_NAMESPACE, [accountId, model], schema);
	return { ok: true, schema };
}
