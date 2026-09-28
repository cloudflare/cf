/**
 * Generator-internal shared helpers used across `generator.ts`,
 * `metadata.ts`, and `index.ts`.
 */

import { toKebabCase } from "@cloudflare/forge";
import { argLocalIdent } from "./codegen/identifiers.js";
import { pathParamReadKey } from "./intermediate-representation.js";
import type { ArgIR } from "./intermediate-representation.js";
import type { Schema } from "@cloudflare/forge";

/** Normalize an unknown thrown value for deterministic error reporting. */
export function errorMessage(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}

/**
 * Account-id path-param aliases the API spec uses inconsistently
 * (`account_id`, `account_identifier`, `accountId`). All three resolve
 * to the same global account context, so every path-substitution site
 * must treat them identically — otherwise a `{account_identifier}` /
 * `{accountId}` template falls through to an unpopulated argv key and
 * the request goes to `/accounts/undefined/…`.
 */
export const ACCOUNT_PATH_PARAMS = new Set([
	"account_id",
	"account_identifier",
	"accountId",
]);

/**
 * Zone-id path-param aliases. Same inconsistency story as
 * {@link ACCOUNT_PATH_PARAMS}; the dry-run preview routes these to the
 * `--zone` flag value.
 */
export const ZONE_PATH_PARAMS = new Set([
	"zone_id",
	"zone_identifier",
	"zoneId",
]);

/**
 * Combined account/zone routing is meaningful only when the two placeholders
 * are adjacent path segments. Similar-looking standalone parameter names are
 * ordinary API inputs and must not acquire global scope behaviour.
 */
export function hasAccountOrZoneScope(path: string): boolean {
	return /(?:^|\/)\{account_or_zone\}\/\{account_or_zone_id\}(?:\/|$)/.test(
		path
	);
}

/**
 * Return the generated local that supplies a paired account/zone path
 * parameter. Standalone or non-adjacent lookalikes remain ordinary API
 * parameters.
 */
export function accountOrZonePathParamLocal(
	path: string,
	paramName: string
): "accountOrZone" | "accountOrZoneId" | undefined {
	if (!hasAccountOrZoneScope(path)) {
		return undefined;
	}
	if (paramName === "account_or_zone") {
		return "accountOrZone";
	}
	if (paramName === "account_or_zone_id") {
		return "accountOrZoneId";
	}
	return undefined;
}

/**
 * Context for resolving `{paramName}` placeholders in a path template.
 *
 * - `accountIdExpr`: substitution for `account_id` / `accountId`. Runtime
 *   blocks use `${accountId}`; dry-run uses
 *   `${__cfDryRunAccountId ?? '<account-id>'}`.
 * - `scriptNameExpr`: substitution for `script_name` / `scriptName` when
 *   `needsWorkerName` is set. Runtime: `${scriptName}`; dry-run:
 *   `${argv.scriptName ?? '<scriptName>'}`.
 * - The adjacent account/zone pair uses the conventional generated locals
 *   `accountOrZone` and `accountOrZoneId` in both runtime and dry-run blocks.
 * - `paramExpr(argName)`: substitution for every other path param,
 *   given the argv key of its (possibly renamed) arg in `args`.
 *   Runtime: `${argv.foo}` (or `${foo}` when the first positional is
 *   the zone). Dry-run: `${argv.foo ?? '<foo>'}`.
 * - `firstPositionalIsZone` / `positional`: enables the "first positional
 *   is the zone — render as the bare identifier rather than `argv.X`"
 *   shortcut used by the live-request blocks. Dry-run leaves it off.
 *
 * The returned substitution includes the surrounding `${…}` template-
 * literal interpolation — the caller embeds the result inside a
 * backtick-delimited string in the generated code.
 */
export interface PathTemplateCtx {
	needsWorkerName: boolean;
	args: readonly ArgIR[];
	positional: readonly ArgIR[];
	firstPositionalIsZone: boolean;
	accountIdExpr: string;
	scriptNameExpr: string;
	/**
	 * Substitution for `{zone_id}` / `{zone_identifier}` / `{zoneId}`
	 * when set. Used by the dry-run preview to echo the user's `--zone`
	 * flag into the URL (the live path resolves `argv.zoneId` after auth,
	 * which dry-run runs before, so the live `paramExpr` would render an
	 * empty slot). Leave `undefined` for the runtime variants, which fall
	 * through to `firstPositionalIsZone` / `paramExpr`.
	 */
	zoneExpr?: string;
	paramExpr: (argName: string) => string;
}

/**
 * Substitute `{paramName}` placeholders in an opInfo.path template with
 * generated-source expressions. Used by every block that needs to
 * synthesise the request URL at runtime (dry-run preview, multipart,
 * body-bypass, raw-output, direct API call).
 *
 * Six call sites in the generator collapsed into one helper. The dry-run
 * and runtime variants supply different fallback expressions and differ in
 * whether `firstPositionalIsZone` is honoured (only runtime passes `true`).
 */
export function substitutePathTemplate(
	path: string,
	ctx: PathTemplateCtx
): string {
	return path.replace(/\{([^}]+)\}/g, (_match, paramName: string) => {
		const accountOrZoneLocal = accountOrZonePathParamLocal(path, paramName);
		if (accountOrZoneLocal !== undefined) {
			return `\${${accountOrZoneLocal}}`;
		}
		if (ACCOUNT_PATH_PARAMS.has(paramName)) {
			return ctx.accountIdExpr;
		}
		if (
			ctx.needsWorkerName &&
			(paramName === "script_name" || paramName === "scriptName")
		) {
			return ctx.scriptNameExpr;
		}
		if (ZONE_PATH_PARAMS.has(paramName)) {
			// A zone positional resolves into a snake_case local (auth.ts);
			// take precedence over `zoneExpr` so the positional value wins.
			if (ctx.firstPositionalIsZone) {
				const zoneKey = toKebabCase(paramName);
				const correspondingArg = ctx.positional.find(
					(a) => toKebabCase(a.name) === zoneKey
				);
				if (
					correspondingArg === ctx.positional[0]! &&
					correspondingArg.isZone
				) {
					return `\${${argLocalIdent(paramName)}}`;
				}
			}
			// Otherwise substitute the resolved-zone expression: the
			// `argv.zoneId` slot for the live path, or the `--zone` echo for
			// the dry-run preview. The kebab read key (`argv["zone-id"]`) is
			// NOT what auth.ts populates, so it must never be used here.
			if (ctx.zoneExpr !== undefined) {
				return ctx.zoneExpr;
			}
		}
		return ctx.paramExpr(pathParamReadKey(ctx.args, paramName));
	});
}

/**
 * Escape a string for safe inclusion in a generated single-quoted JS string.
 * Handles backslashes, single quotes, newlines, backticks, and ${} sequences.
 */
export function escapeForSingleQuote(s: string): string {
	return (
		s
			.replace(/\\/g, "\\\\")
			.replace(/'/g, "\\'")
			.replace(/`/g, "\\`")
			.replace(/\$\{/g, "\\${")
			// All four ECMAScript line terminators (LF, CR, U+2028 LINE
			// SEPARATOR, U+2029 PARAGRAPH SEPARATOR) terminate a
			// single-quoted string literal — collapse every one to a space
			// so an OpenAPI description with a CRLF / unicode separator
			// can't emit an unterminated-string syntax error.
			.replace(/[\r\n\u2028\u2029]/g, " ")
	);
}

/**
 * Escape a string for safe inclusion inside a generated template literal
 * (backtick-delimited). Backticks, `$`, and backslashes all need escaping
 * because the literal will be emitted into source that contains
 * `\`…${…}…\`` interpolations.
 */
export function escapeForTemplateLiteral(s: string): string {
	return s.replace(/[`$\\]/g, "\\$&");
}

/**
 * Extract the bracketed parameter names from a path template
 * (e.g. `/zones/{zone_id}/dns_records/{record_id}` → `['zone_id', 'record_id']`).
 */
export function extractTemplateParams(template: string): string[] {
	return [...template.matchAll(/\{([^}]+)\}/g)].map((m) => m[1]!);
}

/**
 * Flatten nested args into positional args and options.
 *
 * Direct `{name, type, …}` args are treated as positional. Nested
 * structures (`{required: […]}`, `{oneOf: […]}`, `{options: […]}`)
 * are flattened into the options list. Duplicate names are deduped by
 * first occurrence.
 */
export function flattenArgs(args: Schema.methodArg[]): {
	positional: Schema.arg[];
	options: Schema.arg[];
} {
	const positional: Schema.arg[] = [];
	const options: Schema.arg[] = [];
	const seen = new Set<string>();

	for (const arg of args) {
		if ("name" in arg && "type" in arg) {
			if (!seen.has(arg.name)) {
				seen.add(arg.name);
				positional.push(arg as Schema.arg);
			}
		} else {
			if ("required" in arg && Array.isArray(arg.required)) {
				for (const a of arg.required) {
					if (!seen.has(a.name)) {
						seen.add(a.name);
						options.push(a);
					}
				}
			}
			if ("oneOf" in arg && Array.isArray(arg.oneOf)) {
				for (const a of arg.oneOf) {
					if (!seen.has(a.name)) {
						seen.add(a.name);
						options.push(a);
					}
				}
			}
			if ("options" in arg && Array.isArray(arg.options)) {
				for (const a of arg.options) {
					if (!seen.has(a.name)) {
						seen.add(a.name);
						options.push(a);
					}
				}
			}
		}
	}

	return { positional, options };
}
