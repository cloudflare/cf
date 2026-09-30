/**
 * Hand-written generated-tree integration and command metadata.
 *
 * Most leaves under `_generated/` are emitted from the OpenAPI spec. A bounded
 * set of hand-written commands either replace an underspecified operation or
 * add a local workflow with no API equivalent. This module splices non-root
 * entries into generated yargs trees and supplies metadata for those entries
 * and for hand-written roots.
 *
 * This is a short list, not a mechanism to grow. Each entry is a
 * product-specific exception to the rule that `src/` contains no API
 * knowledge (AGENTS.md, "Critical Invariants") and stops tracking spec
 * changes automatically, so each needs a drift guard in `src/__tests__/`.
 * Generalising into a forge annotation is deliberately deferred until
 * there are four or more examples — too few data points and the
 * annotation gets fitted to one case.
 *
 * Leaf-override keys are the emit path the generator would have written,
 * minus `.ts`. Metadata comes from colocated `meta.json` sidecars.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
	handWrittenCommands,
	leafHandWrittenCommands,
	parentOverrideHandWrittenCommands,
} from "../src/commands/hand-written.js";
import type {
	LeafOverrideHandWrittenCommand,
	LeafHandWrittenCommand,
} from "../src/commands/hand-written.js";
import type {
	CommandMeta as ForgeCommandMeta,
	MethodCategory,
	OptionMeta as ForgeOptionMeta,
} from "@cloudflare/forge";

type CommandMeta = Omit<ForgeCommandMeta, "options"> & {
	aliases?: string[];
	options: Array<ForgeOptionMeta & { alias?: string | string[] }>;
};

type HandWrittenMeta = Pick<
	CommandMeta,
	"description" | "usage" | "arguments" | "options"
>;

const HAND_WRITTEN_LEAF_OVERRIDES = new Map(
	handWrittenCommands
		.filter(
			(command): command is LeafOverrideHandWrittenCommand =>
				command.kind === "leafOverride"
		)
		.map((command) => [command.emitKey, command.dir])
);

/** Directory under `src/commands/` for an overridden leaf, if any. */
export function handWrittenLeafOverrideDir(
	emitKey: string
): string | undefined {
	return HAND_WRITTEN_LEAF_OVERRIDES.get(emitKey);
}

/**
 * Module specifier a generated index imports an overridden leaf from.
 * Uses the `#commands/*` subpath so the emitted path stays
 * position-independent — same reason the emitters use `#lib/*`.
 */
export function handWrittenLeafOverrideModule(
	emitKey: string
): string | undefined {
	const dir = handWrittenLeafOverrideDir(emitKey);
	return dir === undefined ? undefined : `#commands/${dir}/index.js`;
}

/**
 * Read the hand-authored metadata sidecar for an overridden leaf.
 *
 * A partial `CommandMeta`: the generator derives the rest from the spec and
 * the sidecar overrides only what the hand-written command changes — usage,
 * flags, prose. Importing from `src/` at generate time would invert the
 * dependency, so it's plain JSON read from disk.
 */
export function readHandWrittenLeafOverrideMeta(dir: string): HandWrittenMeta {
	const path = fileURLToPath(
		new URL(`../src/commands/${dir}/meta.json`, import.meta.url)
	);
	let parsed: unknown;
	try {
		parsed = JSON.parse(readFileSync(path, "utf-8"));
	} catch (err) {
		const reason = err instanceof Error ? err.message : "unknown error";
		throw new Error(
			`src/commands/${dir}/meta.json is missing or invalid: ${reason}`
		);
	}
	if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
		throw new Error(
			`src/commands/${dir}/meta.json must be a JSON object of CommandMeta fields`
		);
	}
	const meta = parsed as Record<string, unknown>;
	const allowed = new Set(["description", "usage", "arguments", "options"]);
	const unexpected = Object.keys(meta).filter((key) => !allowed.has(key));
	if (
		unexpected.length > 0 ||
		typeof meta.description !== "string" ||
		typeof meta.usage !== "string" ||
		!Array.isArray(meta.arguments) ||
		!Array.isArray(meta.options)
	) {
		throw new Error(
			`src/commands/${dir}/meta.json may only define description, usage, arguments, and options`
		);
	}
	return meta as unknown as HandWrittenMeta;
}

/**
 * Hand-written leaf commands, keyed by the product whose index adopts them.
 *
 * Unlike {@link HAND_WRITTEN_LEAF_OVERRIDES}, these commands do not replace an
 * API operation: they add local CLI behaviour for which OpenAPI has no
 * representation. Their metadata sidecar therefore has to provide a complete
 * command description rather than a partial overlay on spec-derived metadata.
 * Unlike
 * {@link HAND_WRITTEN_SUBGROUPS}, each entry is itself an executable leaf.
 */
/** Hand-written leaf commands to splice into a product's index, if any. */
export function handWrittenLeafCommands(
	resourceName: string
): readonly LeafHandWrittenCommand[] {
	return leafHandWrittenCommands().filter(
		(command) => command.parent === resourceName
	);
}

/** User-facing generated-parent overrides contributed by added leaves. */
export function handWrittenParentOverrides(resourceName: string): {
	describe?: string;
	expose: boolean;
} {
	const override = parentOverrideHandWrittenCommands().find(
		(command) => command.parent === resourceName
	);
	return {
		describe: override?.describe,
		expose: override?.expose ?? false,
	};
}

/**
 * Module specifier for a hand-written leaf command, if one is registered at
 * the given emit path, including nested groups.
 */
export function handWrittenLeafCommandModule(
	emitKey: string
): string | undefined {
	const separator = emitKey.lastIndexOf("/");
	if (separator === -1) {
		return undefined;
	}
	const resourceName = emitKey.slice(0, separator);
	const commandName = emitKey.slice(separator + 1);
	const command = handWrittenLeafCommands(resourceName).find(
		(entry) => entry.name === commandName
	);
	return command === undefined
		? undefined
		: `#commands/${command.dir}/index.js`;
}

/**
 * Read a hand-written leaf command's complete metadata sidecar.
 *
 * There is no spec method to supply identity fields for an added command, so
 * the sidecar must carry the whole `CommandMeta` rather than the partial prose
 * and argument override accepted by {@link readHandWrittenLeafOverrideMeta}.
 */
export function readHandWrittenLeafCommandMeta(
	resourceName: string,
	command: LeafHandWrittenCommand
): CommandMeta {
	const sidecar = `src/commands/${command.dir}/meta.json`;
	const path = fileURLToPath(
		new URL(`../src/commands/${command.dir}/meta.json`, import.meta.url)
	);
	let parsed: unknown;
	try {
		parsed = JSON.parse(readFileSync(path, "utf-8"));
	} catch (err) {
		const reason = err instanceof Error ? err.message : "unknown error";
		throw new Error(`${sidecar} is missing or invalid: ${reason}`);
	}
	if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
		throw new Error(`${sidecar} must be a complete CommandMeta object`);
	}
	const meta = parsed as Record<string, unknown>;
	if (
		typeof meta.command !== "string" ||
		typeof meta.name !== "string" ||
		!Array.isArray(meta.fullPath) ||
		!meta.fullPath.every((segment) => typeof segment === "string") ||
		typeof meta.category !== "string" ||
		typeof meta.description !== "string" ||
		typeof meta.usage !== "string" ||
		!Array.isArray(meta.arguments) ||
		!Array.isArray(meta.options)
	) {
		throw new Error(
			`${sidecar} must define command, name, fullPath, category, description, usage, arguments, and options`
		);
	}

	const categories = new Set<MethodCategory>([
		"read",
		"create",
		"update",
		"delete",
		"action",
	]);
	if (!categories.has(meta.category as MethodCategory)) {
		throw new Error(
			`${sidecar} category must be one of: ${[...categories].join(", ")}`
		);
	}
	if (
		meta.aliases !== undefined &&
		(!Array.isArray(meta.aliases) ||
			!meta.aliases.every((alias) => typeof alias === "string"))
	) {
		throw new Error(`${sidecar} aliases must be an array of strings`);
	}

	const expectedFullPath = [...resourceName.split("/"), command.name];
	const expectedCommand = `cf ${expectedFullPath.join(" ")}`;
	if (
		meta.name !== command.name ||
		meta.command !== expectedCommand ||
		(meta.fullPath as string[]).length !== expectedFullPath.length ||
		!(meta.fullPath as string[]).every(
			(segment, index) => segment === expectedFullPath[index]
		)
	) {
		throw new Error(
			`${sidecar} identity must match its registration: name "${command.name}", fullPath ${JSON.stringify(expectedFullPath)}, command "${expectedCommand}"`
		);
	}
	return meta as unknown as CommandMeta;
}

/**
 * A hand-written sub-group: a whole command tree with no spec counterpart,
 * spliced in as a child of a generated product index.
 */
interface HandWrittenSubGroup {
	/** Command word yargs registers, e.g. `migrations`. */
	name: string;
	/** Directory under `src/commands/` holding `index.ts` + `meta.json`. */
	dir: string;
	/** One-line group description for `_meta/commands.json`. */
	describe: string;
	dryRun: "preview" | "native";
}

/**
 * Hand-written sub-groups, keyed by the product whose index adopts them.
 *
 * Distinct from {@link HAND_WRITTEN_LEAF_OVERRIDES} above in what it does, not
 * just in shape. A leaf override *replaces* a command the spec already
 * describes: the operation still exists, so its identity (path, verb,
 * operationId) stays spec-derived and only the implementation is
 * hand-written. A sub-group here has **no spec counterpart at all** — it is
 * added, not replaced — so nothing about it can be derived and `meta.json`
 * has to carry every leaf's metadata in full.
 *
 * The same caveats apply, more strongly: each entry is product knowledge in
 * `src/` (AGENTS.md, "Critical Invariants"), tracks no spec changes, and
 * needs a drift guard in `src/__tests__/`. Reach for it only when the work
 * genuinely is not an API operation — `d1 migrations` is a filesystem walk
 * plus N calls to one endpoint, with file ordering and bookkeeping
 * semantics OpenAPI cannot express.
 */
const HAND_WRITTEN_SUBGROUPS = new Map<string, HandWrittenSubGroup[]>();
for (const command of handWrittenCommands) {
	if (command.kind !== "subgroup") {
		continue;
	}
	const commands = HAND_WRITTEN_SUBGROUPS.get(command.parent) ?? [];
	commands.push({
		name: command.name,
		dir: command.dir,
		describe: command.describe,
		dryRun: command.dryRun,
	});
	HAND_WRITTEN_SUBGROUPS.set(command.parent, commands);
}

/** Hand-written sub-groups to splice into a product's index, if any. */
export function handWrittenSubGroups(
	resourceName: string
): readonly HandWrittenSubGroup[] {
	return HAND_WRITTEN_SUBGROUPS.get(resourceName) ?? [];
}

/**
 * Read a hand-written command-list metadata sidecar.
 *
 * Unlike a leaf override's sidecar this is a complete `CommandMeta[]`, because
 * there is no spec-derived base to merge over for root commands or sub-groups.
 * `httpMethod` / `apiPath` / `operationId` are optional and normally absent.
 */
export function readHandWrittenCommandListMeta(dir: string): CommandMeta[] {
	const path = fileURLToPath(
		new URL(`../src/commands/${dir}/meta.json`, import.meta.url)
	);
	let parsed: unknown;
	try {
		parsed = JSON.parse(readFileSync(path, "utf-8"));
	} catch (err) {
		const reason = err instanceof Error ? err.message : "unknown error";
		throw new Error(
			`src/commands/${dir}/meta.json is missing or invalid: ${reason}`
		);
	}
	if (!Array.isArray(parsed)) {
		throw new Error(
			`src/commands/${dir}/meta.json must be a JSON array of CommandMeta objects`
		);
	}
	return parsed as CommandMeta[];
}
