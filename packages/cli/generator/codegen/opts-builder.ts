/**
 * Generator-side helpers for emitting the SDK call's options-object
 * literal as a TypeScript source string.
 *
 * Every handler block ends in some shape of
 * `client.<verb>(<url>, { body, headers, query? })`. The conditional
 * sub-fields ("only include headers when the user set any") share a
 * fixed idiom: `Object.keys(headers).length > 0 ? headers : undefined`.
 * This module concentrates those idioms in one place — the alternative
 * is six near-identical ad-hoc options-string assemblies scattered
 * across `generator.ts`, each spelt slightly differently.
 *
 * All helpers return TypeScript source fragments. They do not run.
 */

/**
 * Source-fragment for a guarded `headers` object reference: emits
 * `Object.keys(headers).length > 0 ? headers : undefined`, the
 * standard idiom for "only forward headers when the user supplied
 * any".
 */
export const HEADERS_GUARDED_EXPR =
	"Object.keys(headers).length > 0 ? headers : undefined";

/**
 * Source-fragment that constructs the URL-encoded query string from
 * the `queryParams` Record at runtime. Drops `undefined` values before
 * encoding (yargs leaves defaulted-but-unset flags defined as `undefined`).
 * Used by body-bearing handler blocks where query params must be
 * appended to the URL (the SDK options bag only accepts body + headers
 * for body-bearing requests).
 */
export const QS_FROM_PARAMS_EXPR =
	"new URLSearchParams(Object.entries(queryParams).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])).toString()";

/**
 * Description of a single field in the emitted SDK-options object.
 *
 * - `key`: the property name (`body`, `headers`, `query`, ...).
 * - `expr`: the TypeScript expression to assign.
 * - `omit`: when true, the field is skipped entirely. Use this for
 *   "only emit headers when `hasHeaders`" branches.
 */
export interface OptsField {
	key: string;
	expr: string;
	omit?: boolean;
}

/**
 * Render an SDK-options object literal from a list of fields. Skips
 * any field with `omit: true`. Returns the full braces form, including
 * the surrounding `{ ... }`.
 *
 * Caller is responsible for ordering. The two conventional orderings
 * are:
 *   - `body, headers` for body-bearing calls.
 *   - `query, headers` for read calls.
 */
export function renderOpts(fields: OptsField[]): string {
	const parts = fields.filter((f) => !f.omit).map((f) => `${f.key}: ${f.expr}`);
	return `{ ${parts.join(", ")} }`;
}
