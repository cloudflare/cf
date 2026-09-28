/**
 * Membership predicates over arg-name collections.
 *
 * The generator routinely asks "is this arg-name an already-declared
 * option?" Naive `Set<string>.has()` falls down
 * because OpenAPI param names use snake_case (`account_id`) but the
 * generator's working names are kebab-case (`account-id`), so every
 * lookup ended up as the same two-line "check kebab OR snake" idiom.
 *
 * These helpers concentrate that idiom in one place. Each takes the
 * collection it queries; none of them stash state.
 */
import { toKebabCase } from "@cloudflare/forge";

/**
 * Find the arg in `args` whose kebab `name` equals `kebabName`.
 */
export function findArgByKebab<T extends { name: string }>(
	args: readonly T[],
	kebabName: string
): T | undefined {
	return args.find((a) => toKebabCase(a.name) === kebabName);
}

/**
 * Test whether any arg in `args` has the given kebab `name`. Equivalent
 * to `findArgByKebab(args, name) !== undefined` but reads better at the
 * use site.
 */
export function someArgHasKebab(
	args: readonly { name: string }[],
	kebabName: string
): boolean {
	return args.some((a) => toKebabCase(a.name) === kebabName);
}

/**
 * Test whether any arg in `args` has the given API field name
 * (kebab or snake form). Used by header/multipart dedup against
 * names laid down by earlier passes.
 */
export function someArgHasApiName(
	args: readonly { name: string }[],
	apiName: string
): boolean {
	return someArgHasKebab(args, toKebabCase(apiName));
}
