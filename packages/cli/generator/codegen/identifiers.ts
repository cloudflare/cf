import { toKebabCase } from "@cloudflare/forge";

/**
 * Acronyms preserved as all-uppercase by {@link toPascalCase} and as
 * all-lowercase by {@link sdkPropertyCase} when they appear as a full
 * standalone segment.
 */
export const ACRONYMS = new Set([
	"d1",
	"dns",
	"kv",
	"ai",
	"r2",
	"api",
	"url",
	"http",
	"ssl",
	"tls",
	"ip",
	"tcp",
	"udp",
]);

export function toPascalCase(name: string): string {
	return name
		.split(/[-_]/)
		.map((part) => {
			const lower = part.toLowerCase();
			if (ACRONYMS.has(lower)) return part.toUpperCase();
			return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
		})
		.join("");
}

/**
 * SDK-specific camelCase that fully lowercases the first segment.
 * Needed because the SDK generator produces all-lowercase property names
 * like 'riskscoring' via toCamelCase(toPascalCase('risk-scoring')).
 * Only use this for SDK method paths — for interface fields / argv, use
 * {@link toCamelCase} from forge which preserves inner capitals.
 */
export function sdkPropertyCase(name: string): string {
	const lower = name.toLowerCase();
	if (ACRONYMS.has(lower) && !name.includes("-") && !name.includes("_"))
		return lower;

	const parts = name.split(/[-_]/);
	return parts
		.map((part, i) => {
			const partLower = part.toLowerCase();
			if (i === 0) return partLower;
			if (ACRONYMS.has(partLower)) return part.toUpperCase();
			return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
		})
		.join("");
}

/** Convert a kebab-cased method name to the SDK's camelCased property. */
export function toMethodName(name: string): string {
	return name.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

/**
 * Get a safe variable name for a command, prefixed with `$`
 */
export function getSafeVarName(cmd: string): string {
	return `$${cmd.replace(/-/g, "")}`;
}

/**
 * A safe JS local-variable identifier derived from a flag / param name —
 * snake_case, which is always a valid identifier. Used for the resolved
 * zone / worker-name / path-param locals that can't be a hyphenated
 * `argv["..."]` key.
 */
export function argLocalIdent(name: string): string {
	return toKebabCase(name).replace(/-/g, "_");
}

/**
 * An argv read expression keyed by the kebab name yargs registered the
 * option / positional under: `argv["foo-bar"]`.
 *
 * Reading the registered key directly is round-trip-safe — we never
 * predict yargs' camelCase alias, so the whole class of digit→uppercase
 * mismatch bugs (`ipv4Cidr` vs `ipv4cidr`, `oauth2Enabled`, `s3Key`,
 * `lan1LanId`) simply can't happen: we read exactly the key we wrote.
 */
export function argvKey(name: string): string {
	return `argv[${JSON.stringify(toKebabCase(name))}]`;
}
