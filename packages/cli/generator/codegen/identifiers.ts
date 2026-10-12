import { toKebabCase } from "@cloudflare/forge";

/**
 * Acronyms preserved as all-uppercase by {@link toPascalCase} when they
 * appear as a full standalone segment.
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
