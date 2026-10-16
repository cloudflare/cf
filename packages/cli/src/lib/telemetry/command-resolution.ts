import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { isCommandsMetadata, loadMeta } from "../metadata.js";
import { passedFlags } from "./sanitization.js";
import type {
	CommandResolutionFailure,
	CommandResolutionProperties,
} from "./types.js";

/**
 * Sanitises what yargs could not resolve before it reaches telemetry.
 *
 * Unrecognised tokens are often user data (IDs, domains, resource names), so
 * a token is sent only when it is a word from cf's own command catalogue.
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
				// Single-character aliases are handled as short flags.
				if (alias.length > 1) {
					options.add(alias);
				}
			}
		}
	}
	for (const group of Object.keys(metadata.descriptions ?? {})) {
		addCommandWords(group.split(" "));
	}
	return { commands, options };
}

/**
 * The command words and option names cf recognises. Loading the catalogue
 * costs a few milliseconds, so it happens only on this error path. If it
 * cannot be loaded every unknown token is reduced to a shape label.
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
		return { commands: new Set(), options };
	}
	return {
		commands: new Set([...cachedCatalogue.commands, ...BUILT_IN_COMMANDS]),
		options: new Set([...cachedCatalogue.options, ...options]),
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
 * only when they are cf options; their values are never read.
 */
export function sanitizeCommandResolution(
	failure: CommandResolutionFailure,
	rawArgv: string[],
	vocabulary: CommandVocabulary
): SanitizedCommandResolution {
	const known = new Set<string>();
	const unknown = new Set<string>();
	for (const flag of passedFlags(rawArgv)) {
		(vocabulary.options.has(flag) ? known : unknown).add(flag);
	}
	const argsUsed = [...known].sort();
	const suggestedCommand =
		failure.kind === "suggested-command" ? failure.suggestedCommand : undefined;

	return {
		resolutionFailure: failure.kind,
		knownCommand: failure.knownCommand.join(" "),
		knownCommandIsLeaf: failure.knownCommandIsLeaf,
		unknownTokens: failure.unknownTokens
			.slice(0, MAX_UNKNOWN_TOKENS)
			.map((token) => sanitizeCommandToken(token, vocabulary.commands)),
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
