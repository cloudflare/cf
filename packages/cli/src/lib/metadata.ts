/**
 * Generated-command metadata types + loader.
 *
 * The generator writes machine-readable artefacts under
 * `src/commands/_generated/_meta/`:
 *
 *   - `commands.json`       — full command catalogue (used by
 *                             `cf complete`, `cf tools`, and the
 *                             agent-facing `--help` callers)
 *   - `hand-written-commands.json`
 *                           — handwritten-only command catalogue, including
 *                             markers for generated command overrides
 *   - `schemas.json`        — per-operation JSON schemas (used by
 *                             `cf schema`)
 *
 * `tsdown` copies all metadata files into `dist/_meta/` at build time
 * (`vite.config.ts` → `pack.onSuccess`), so a bundled cf binary finds
 * them next to its own entry chunk; a dev-mode run via `tsx` finds
 * them in the source tree under `_generated/_meta/`. `loadMeta`
 * tries both layouts in turn so callers don't have to.
 *
 * Previously the same "try 3 candidate paths, parse JSON, type-guard,
 * cache" loop was copy-pasted into four separate command files. This
 * module is the single source of truth.
 */

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type {
	ArgumentMeta,
	CommandMeta as ForgeCommandMeta,
	ExampleMeta,
	OptionMeta as ForgeOptionMeta,
} from "@cloudflare/forge";

/** Option metadata, including CLI aliases accepted by yargs. */
export type OptionMeta = ForgeOptionMeta & {
	alias?: string | string[];
};

/** Command metadata, including aliases and the summary used in listings. */
export type CommandMeta = Omit<ForgeCommandMeta, "options"> & {
	aliases?: string[];
	summary?: string;
	options: OptionMeta[];
};

export type { ArgumentMeta, ExampleMeta };

/**
 * Metadata structure from the generated `commands.json` file.
 */
export interface CommandsMetadata {
	version: string;
	generatedAt: string;
	commands: CommandMeta[];
	/** Descriptions for command groups (product and method group levels) */
	descriptions?: Record<string, string>;
}

/**
 * Runtime shape check for parsed command metadata.
 */
export function isCommandsMetadata(value: unknown): value is CommandsMetadata {
	return (
		value !== null &&
		typeof value === "object" &&
		"commands" in value &&
		Array.isArray((value as Record<string, unknown>).commands)
	);
}

/**
 * Cache per generated-metadata filename so a single process pays the
 * read+parse cost at most once per file. The values are intentionally
 * `unknown` — the caller's `guard` narrows on the way out.
 */
const META_CACHE = new Map<string, unknown>();

/**
 * Load a generated-metadata JSON file from `_meta/`.
 *
 * @param callerMetaUrl - The caller's `import.meta.url`. Used as the
 *   anchor for locating `_meta/`, which lives next to the bundled
 *   entry chunk and (in dev) under `src/commands/_generated/_meta/`.
 * @param filename - The file under `_meta/` to read, e.g.
 *   `"commands.json"`, `"hand-written-commands.json"`, `"schemas.json"`.
 * @param guard - Runtime shape check; returning false is treated as
 *   "file is corrupt, fall through to the next candidate path".
 * @returns The parsed metadata, or `null` if no candidate path
 *   resolved or every candidate failed the shape check.
 */
export function loadMeta<T>(
	callerMetaUrl: string,
	filename: string,
	guard: (value: unknown) => value is T
): T | null {
	const cacheKey = `${callerMetaUrl}::${filename}`;
	const cached = META_CACHE.get(cacheKey);
	if (cached !== undefined) {
		return cached as T | null;
	}

	const callerDir = dirname(fileURLToPath(callerMetaUrl));

	// Bundled path (next to the entry chunk) first so production
	// resolves on the very first probe; dev / cwd-relative fallbacks
	// after.
	const candidates = [
		join(callerDir, "_meta", filename),
		join(callerDir, "_generated", "_meta", filename),
		join(callerDir, "..", "_generated", "_meta", filename),
		join(process.cwd(), "src", "commands", "_generated", "_meta", filename),
	];

	for (const candidate of candidates) {
		if (!existsSync(candidate)) {
			continue;
		}
		try {
			const parsed: unknown = JSON.parse(readFileSync(candidate, "utf-8"));
			if (guard(parsed)) {
				META_CACHE.set(cacheKey, parsed);
				return parsed;
			}
		} catch {
			// fall through to next candidate
		}
	}

	META_CACHE.set(cacheKey, null);
	return null;
}
