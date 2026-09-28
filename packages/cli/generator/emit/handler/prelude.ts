/**
 * Emit the handler's prelude — runs before the dry-run + auth blocks.
 *
 * Two pieces:
 *   1. **`queryParams` object** (the query bag): populated from the
 *      op's query args, mapping each `argv.` property to its wire
 *      spelling (`perPage` → `per_page`, `nameExact` → `name.exact`).
 *   2. **Headers object**: populated from header params (e.g.
 *      `cf-r2-jurisdiction`).
 *
 * Note: positional path/string args are NOT pre-validated here. cf is a
 * client-side CLI driving the user's own credentials — there is no trust
 * boundary, so "hardening" a resource id against traversal / control
 * chars / URL operators guards nothing the user couldn't do by calling
 * the API directly.
 *
 * Correct URL construction (percent-encoding so the id reaches the API
 * verbatim — e.g. a key `foo/bar` arriving as `foo%2Fbar`) is handled on
 * BOTH terminal codepaths:
 *   - the typed SDK methods, which wrap every path param in
 *     `encodeURIComponent(...)` internally (see `forge-sdk-ts`); and
 *   - the generator-built raw URL strings (body-bypass, raw-output /
 *     header branches, file-upload, multipart), which now encode their
 *     own segments via `substitutePathTemplate`'s `paramExpr` in
 *     `build-context.ts` (mirrored in the `--dry-run` preview path).
 * Any new generator-built URL string MUST encode its own interpolated
 * segments — the "encoding is the SDK's job" claim only covers the
 * typed-method path.
 *
 * Returns lines for downstream emitters
 */
import { argvKey } from "../../codegen/identifiers.js";
import { headerArgs, queryArgs } from "../../intermediate-representation.js";
import { usesTypedQuery } from "../sdk-path.js";
import type { EmitContext } from "../context.js";

export function emitPrelude(ctx: EmitContext): string[] {
	const { derived, hasParams, hasHeaders } = ctx;
	const lines: string[] = [];

	if (hasParams) {
		lines.push(``);
		lines.push(
			usesTypedQuery(ctx)
				? `      const queryParams: Query = {`
				: `      const queryParams: Record<string, unknown> = {`
		);
		for (const a of queryArgs(derived.args)) {
			if (a.origin.kind !== "query") continue;
			lines.push(`        '${a.origin.wireName}': ${argvKey(a.name)},`);
		}
		lines.push(`      };`);
	}

	if (hasHeaders) {
		lines.push(``);
		lines.push(`      const headers: Record<string, string> = {};`);
		for (const a of headerArgs(derived.args)) {
			if (a.origin.kind !== "header") continue;
			const read = argvKey(a.name);
			lines.push(
				`      if (${read} !== undefined) headers['${a.origin.wireName}'] = String(${read});`
			);
		}
	}

	return lines;
}
