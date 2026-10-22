import type { CommonYargsOptions } from "../cli-types.js";

export const REDACTED = "<REDACTED>";

export interface ShortFlagAlias<Canonical extends string = string> {
	canonical: Canonical;
	type: "boolean" | "value";
}

export type ShortFlagAliases<Args> = Record<
	string,
	ShortFlagAlias<Extract<keyof Args, string>>
>;

export interface ArgClassification<Args = Record<string, unknown>> {
	safeFlags: string[];
	shortFlagAliases?: ShortFlagAliases<Args>;
}

interface GlobalShortFlagArgs extends CommonYargsOptions {
	help: boolean;
	version: boolean;
}

export const GLOBAL_SHORT_FLAG_ALIASES = {
	q: { canonical: "quiet", type: "boolean" },
	z: { canonical: "zone", type: "value" },
	m: { canonical: "mode", type: "value" },
	h: { canonical: "help", type: "boolean" },
	v: { canonical: "version", type: "boolean" },
} satisfies ShortFlagAliases<GlobalShortFlagArgs>;

function toCamel(flag: string): string {
	return flag.replace(/-([a-z0-9])/g, (_, character: string) =>
		character.toUpperCase()
	);
}

export interface PassedFlags {
	/** Canonical names of long flags and recognised short flags. */
	flags: string[];
	/** Unrecognised short-flag letters. Only ever counted, never sent. */
	unknownShortFlags: string[];
}

/**
 * Flags passed before `--`, without values. A short-flag cluster is read
 * until a flag that takes a value or the first unrecognised character: the
 * rest of the cluster may be that flag's value.
 */
export function readPassedFlags(
	rawArgv: string[],
	shortFlagAliases: Readonly<Record<string, ShortFlagAlias>>
): PassedFlags {
	const flags: string[] = [];
	const unknownShortFlags: string[] = [];
	for (const token of rawArgv) {
		if (token === "--") {
			break;
		}
		if (token.startsWith("--")) {
			const name = token.slice(2).split("=")[0] ?? "";
			const canonical = name.startsWith("no-") ? name.slice(3) : name;
			if (canonical) {
				flags.push(canonical);
			}
			continue;
		}
		if (!token.startsWith("-") || token === "-") {
			continue;
		}

		const shorthand = token.slice(1);
		for (const character of shorthand) {
			const alias = shortFlagAliases[character];
			if (!alias) {
				// Digits and `=` start a value (`-1`, `-q=true`), not a flag.
				if (/[a-z]/i.test(character)) {
					unknownShortFlags.push(character);
				}
				break;
			}
			flags.push(alias.canonical);
			if (alias.type === "value") {
				break;
			}
		}
	}
	return { flags, unknownShortFlags };
}

export interface SanitizedArgs {
	sanitizedArgs: Record<string, unknown>;
	argsUsed: string[];
	argsCombination: string;
}

export function sanitizeArgs<Args extends Record<string, unknown>>(
	argv: Args,
	rawArgv: string[],
	classification: ArgClassification<NoInfer<Args>>
): SanitizedArgs {
	const safe = new Set([
		...classification.safeFlags,
		"quiet",
		"local",
		"temporary-account",
	]);
	const shortFlagAliases = {
		...GLOBAL_SHORT_FLAG_ALIASES,
		...classification.shortFlagAliases,
	};
	const used = new Set<string>();
	const sanitizedArgs: Record<string, unknown> = {};

	for (const flag of readPassedFlags(rawArgv, shortFlagAliases).flags) {
		used.add(flag);
		const value = argv[flag] ?? argv[toCamel(flag)];
		sanitizedArgs[flag] = safe.has(flag) ? value : REDACTED;
	}

	const argsUsed = [...used].sort();
	return {
		sanitizedArgs,
		argsUsed,
		argsCombination: argsUsed.join(", "),
	};
}
