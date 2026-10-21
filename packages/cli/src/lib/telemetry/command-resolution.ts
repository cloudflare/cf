import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { isCommandsMetadata, loadMeta } from "../metadata.js";
import { GLOBAL_SHORT_FLAG_ALIASES, readPassedFlags } from "./sanitization.js";
import type { ShortFlagAlias } from "./sanitization.js";
import type {
	CommandResolutionFailure,
	CommandResolutionProperties,
} from "./types.js";

/**
 * Sanitises what yargs could not resolve before it reaches telemetry.
 *
 * Unrecognised tokens are often user data (IDs, domains, resource names), so
 * a token is sent only when it is a word from cf's own command catalogue and
 * is the first unresolved token where a command word was expected. Later
 * tokens, and surplus positionals at a leaf, may be values for the intended
 * command.
 * Anything else is replaced by a label describing its shape. A pattern-based
 * allowlist would pass resource names such as `acme-prod-db`, which is why
 * the vocabulary is closed.
 */

export const MAX_UNKNOWN_TOKENS = 3;
const MAX_TOKEN_LENGTH = 64;

/** Names yargs registers itself, outside the generated catalogue. */
const BUILT_IN_COMMANDS = ["help", "version", "completion"];
const BUILT_IN_OPTIONS = ["help", "version"];

export interface CommandVocabulary {
	commands: ReadonlySet<string>;
	options: ReadonlySet<string>;
	/** Single-character option aliases, used to name short flags. */
	shortFlagAliases: Readonly<Record<string, ShortFlagAlias>>;
}

let cachedCatalogue: CommandVocabulary | null | undefined;

function loadCatalogueVocabulary(): CommandVocabulary | null {
	// The bundled chunk sits next to `dist/_meta/`; the source module needs an
	// anchor inside `src/commands/`, beside `_generated/`.
	const sourceAnchor = pathToFileURL(
		join(dirname(fileURLToPath(import.meta.url)), "..", "..", "commands", "_")
	).href;
	const metadata =
		loadMeta(import.meta.url, "commands.json", isCommandsMetadata) ??
		loadMeta(sourceAnchor, "commands.json", isCommandsMetadata);
	if (!metadata) {
		return null;
	}

	const commands = new Set<string>();
	const options = new Set<string>();
	// `null` marks a letter that names different options in different
	// commands; it is left out, so such a flag is counted rather than named.
	const shortFlags = new Map<string, ShortFlagAlias | null>();
	const addCommandWords = (words: string[]) => {
		for (const word of words) {
			if (word) {
				commands.add(word.toLowerCase());
			}
		}
	};
	for (const command of metadata.commands) {
		addCommandWords(command.fullPath);
		addCommandWords(command.aliases ?? []);
		for (const option of command.options) {
			options.add(option.name);
			const aliases = option.alias === undefined ? [] : [option.alias].flat();
			for (const alias of aliases) {
				if (alias.length > 1) {
					options.add(alias);
					continue;
				}
				const short: ShortFlagAlias = {
					canonical: option.name,
					type: option.type === "boolean" ? "boolean" : "value",
				};
				const existing = shortFlags.get(alias);
				const conflicts =
					existing === null ||
					(existing !== undefined &&
						(existing.canonical !== short.canonical ||
							existing.type !== short.type));
				shortFlags.set(alias, conflicts ? null : short);
			}
		}
	}
	for (const group of Object.keys(metadata.descriptions ?? {})) {
		addCommandWords(group.split(" "));
	}
	const shortFlagAliases: Record<string, ShortFlagAlias> = {};
	for (const [alias, short] of shortFlags) {
		if (short) {
			shortFlagAliases[alias] = short;
		}
	}
	return { commands, options, shortFlagAliases };
}

/**
 * The command words and option names cf recognises. Loading the catalogue
 * costs a few milliseconds, so it happens only on this error path. If it
 * cannot be loaded every unknown token is reduced to a shape label.
 *
 * Short-flag aliases, like option names, come from the whole catalogue
 * rather than the resolved command: the catalogue does not list the
 * generated `--force` (`-f`) of each delete command, so only the
 * catalogue-wide set recognises it there.
 */
export function loadCommandVocabulary(
	globalOptions: readonly string[]
): CommandVocabulary {
	if (cachedCatalogue === undefined) {
		try {
			cachedCatalogue = loadCatalogueVocabulary();
		} catch {
			cachedCatalogue = null;
		}
	}
	const options = new Set([...globalOptions, ...BUILT_IN_OPTIONS]);
	if (!cachedCatalogue) {
		return {
			commands: new Set(),
			options,
			shortFlagAliases: GLOBAL_SHORT_FLAG_ALIASES,
		};
	}
	return {
		commands: new Set([...cachedCatalogue.commands, ...BUILT_IN_COMMANDS]),
		options: new Set([...cachedCatalogue.options, ...options]),
		shortFlagAliases: {
			...cachedCatalogue.shortFlagAliases,
			...GLOBAL_SHORT_FLAG_ALIASES,
		},
	};
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Return a cf command word, or a label for the token's shape. */
export function sanitizeCommandToken(
	token: string,
	commands: ReadonlySet<string>
): string {
	const value = token.slice(0, MAX_TOKEN_LENGTH);
	const lower = value.toLowerCase();
	if (commands.has(lower)) {
		return lower;
	}
	if (/\s/.test(value)) {
		return "<spaced>";
	}
	if (/^[a-z][a-z0-9+.-]*:\/\//i.test(value)) {
		return "<url>";
	}
	if (value.includes("@")) {
		return "<email>";
	}
	if (/[/\\]/.test(value) || /^[.~]/.test(value) || /^[a-z]:$/i.test(value)) {
		return "<path>";
	}
	if (value.includes(":")) {
		// Wrangler-style `kv:namespace`, kept only when every part is a cf word.
		const parts = lower.split(":");
		return parts.every((part) => commands.has(part)) ? lower : "<colon>";
	}
	if (UUID.test(value)) {
		return "<uuid>";
	}
	if (/^\d+$/.test(value)) {
		return "<number>";
	}
	if (/^[0-9a-f]{16,}$/i.test(value)) {
		return "<hex>";
	}
	if (/^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(value)) {
		return "<domain>";
	}
	if (/^[a-z][\w-]*$/i.test(value)) {
		return "<word>";
	}
	return "<other>";
}

export interface SanitizedCommandResolution extends CommandResolutionProperties {
	argsUsed: string[];
	argsCombination: string;
}

/**
 * Build telemetry properties for a resolution failure. Flag names are kept
 * only when they are cf options; their values are never read. Other flags,
 * including unrecognised short flags, are counted.
 */
export function sanitizeCommandResolution(
	failure: CommandResolutionFailure,
	rawArgv: string[],
	vocabulary: CommandVocabulary
): SanitizedCommandResolution {
	const known = new Set<string>();
	const unknown = new Set<string>();
	const { flags, unknownShortFlags } = readPassedFlags(
		rawArgv,
		vocabulary.shortFlagAliases
	);
	for (const flag of flags) {
		(vocabulary.options.has(flag) ? known : unknown).add(flag);
	}
	// Prefixed so `-x` and `--x` count separately; only the size is sent.
	for (const character of unknownShortFlags) {
		unknown.add(`-${character}`);
	}
	const argsUsed = [...known].sort();
	// Only the first unresolved token is known to be in a command position.
	// Any later token, and a surplus positional at a leaf, may be a value, so
	// one that happens to be a cf word (`test`, `dev`) is still labelled.
	const noWords = new Set<string>();
	const firstTokenWords =
		failure.kind === "surplus-positional" ? noWords : vocabulary.commands;
	const suggestedCommand =
		failure.kind === "suggested-command" ? failure.suggestedCommand : undefined;

	return {
		resolutionFailure: failure.kind,
		knownCommand: failure.knownCommand.join(" "),
		knownCommandIsLeaf: failure.knownCommandIsLeaf,
		unknownTokens: failure.unknownTokens
			.slice(0, MAX_UNKNOWN_TOKENS)
			.map((token, index) =>
				sanitizeCommandToken(token, index === 0 ? firstTokenWords : noWords)
			),
		unknownTokenCount: failure.unknownTokens.length,
		// yargs only suggests registered names; the pattern is a backstop.
		...(suggestedCommand !== undefined &&
		/^[a-z0-9][a-z0-9-]{0,63}$/i.test(suggestedCommand)
			? { suggestedCommand }
			: {}),
		unknownFlagCount: unknown.size,
		argsUsed,
		argsCombination: argsUsed.join(", "),
	};
}

export function __resetCommandVocabularyForTests(): void {
	cachedCatalogue = undefined;
}
