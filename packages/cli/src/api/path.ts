/**
 * Builds a request path from a template literal, encoding each substituted
 * value as a path segment:
 *
 * ```ts
 * path`/zones/${request.zone_id}/dns_records`
 * ```
 *
 * `null` and `undefined` are spelt out, as `String` spells them.
 */
export function path(
	strings: TemplateStringsArray,
	...params: readonly unknown[]
): string {
	let result = strings[0] ?? "";
	for (const [i, param] of params.entries()) {
		result += encodeURIComponent(String(param)) + (strings[i + 1] ?? "");
	}
	return result;
}
