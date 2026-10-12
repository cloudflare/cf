/**
 * The hand-written commands that are spliced into the generated tree.
 *
 * cf registers a short list of hand-written commands, in
 * `src/commands/hand-written.ts`, that replace a generated leaf, add one,
 * add a whole group, or sit at the root, each with a `meta.ts` sidecar
 * describing it, listed in `src/commands/hand-written-meta.ts`. The plugin
 * is built with the registry and the sidecars as its {@link Config}.
 *
 * A port of cf's `hand-written-overrides.ts`.
 */
import { firstWord, GenerateError, type Obj, type Value } from "./js.js";
import type {
	HandWrittenCommand,
	HandWrittenDryRunStrategy,
	LeafHandWrittenCommand,
	LeafOverrideHandWrittenCommand,
	ParentOverrideHandWrittenCommand,
	RootHandWrittenCommand,
	SubGroupHandWrittenCommand,
} from "../../src/commands/hand-written.js";
import type {
	CommandMeta,
	LeafCommandMeta,
	LeafOverrideMeta,
} from "../../src/lib/command-meta.js";

export type DryRun = HandWrittenDryRunStrategy;
export type Root = RootHandWrittenCommand;
export type LeafOverride = LeafOverrideHandWrittenCommand;
export type Leaf = LeafHandWrittenCommand;
export type SubGroup = SubGroupHandWrittenCommand;

/**
 * The sidecars of the hand-written commands, by directory. Keyed by any
 * string, so tests can generate with commands of their own.
 */
export interface Sidecars {
	/** Every command under each root. */
	roots: Readonly<Record<string, readonly CommandMeta[]>>;
	/** Every leaf of each subgroup. */
	subgroups: Readonly<Record<string, readonly CommandMeta[]>>;
	leaves: Readonly<Record<string, LeafCommandMeta>>;
	leafOverrides: Readonly<Record<string, LeafOverrideMeta>>;
}

/** What the plugin is built with. */
export interface Config {
	handWritten: readonly HandWrittenCommand[];
	sidecars: Sidecars;
}

export function rootName(root: Root): string {
	return firstWord(root.command) ?? root.command;
}

/**
 * Sidecars are JSON, which their interfaces, having no index signatures,
 * don't say.
 */
function json(meta: CommandMeta | LeafOverrideMeta): Obj {
	return meta as unknown as Obj;
}

/** The hand-written commands, and their sidecars by directory. */
export class HandWritten {
	readonly roots: readonly Root[];
	readonly leafOverrides: readonly LeafOverride[];
	readonly allLeaves: readonly Leaf[];
	readonly allSubgroups: readonly SubGroup[];
	private readonly parents: readonly ParentOverrideHandWrittenCommand[];
	private readonly sidecars: Sidecars;

	constructor(config: Config) {
		const of = <K extends HandWrittenCommand["kind"]>(kind: K) =>
			config.handWritten.filter(
				(c): c is Extract<HandWrittenCommand, { kind: K }> => c.kind === kind
			);
		this.roots = of("root");
		this.leafOverrides = of("leafOverride");
		this.allLeaves = of("leaf");
		this.allSubgroups = of("subgroup");
		this.parents = of("parentOverride");
		this.sidecars = config.sidecars;
	}

	/** The directory of the command that replaces the leaf at `emitKey`. */
	leafOverrideDir(emitKey: string): string | undefined {
		// A later registration of the same key replaces an earlier one.
		for (let i = this.leafOverrides.length - 1; i >= 0; i--) {
			const o = this.leafOverrides[i] as LeafOverride;
			if (o.emitKey === emitKey) {
				return o.dir;
			}
		}
		return undefined;
	}

	/** The leaves added under `parent`. */
	leaves(parent: string): Leaf[] {
		return this.allLeaves.filter((l) => l.parent === parent);
	}

	/** The module an index imports the added leaf at `emitKey` from. */
	leafModule(emitKey: string): string | undefined {
		const slash = emitKey.lastIndexOf("/");
		if (slash < 0) {
			return undefined;
		}
		const parent = emitKey.slice(0, slash);
		const name = emitKey.slice(slash + 1);
		const leaf = this.leaves(parent).find((l) => l.name === name);
		return leaf && `#commands/${leaf.dir}/index.js`;
	}

	/** Reports whether a leaf's parent is one `under` accepts. */
	leavesUnder(under: (parent: string) => boolean): boolean {
		return this.allLeaves.some((l) => under(l.parent));
	}

	/** Reports whether a subgroup's parent is one `under` accepts. */
	subgroupsUnder(under: (parent: string) => boolean): boolean {
		return this.allSubgroups.some((s) => under(s.parent));
	}

	subgroups(parent: string): SubGroup[] {
		return this.allSubgroups.filter((s) => s.parent === parent);
	}

	/** The description override and whether `parent` is exposed. */
	parentOverride(parent: string): [string | undefined, boolean] {
		const p = this.parents.find((o) => o.parent === parent);
		return p ? [p.describe, p.expose] : [undefined, false];
	}

	/**
	 * The parent overrides that create their root when the document has no
	 * group of that name, so their hand-written leaves have a parent before
	 * the API does. Only top-level roots can be created.
	 */
	createdRoots(): ParentOverrideHandWrittenCommand[] {
		const created = this.parents.filter((p) => p.createIfMissing === true);
		for (const p of created) {
			if (p.parent.includes("/")) {
				throw new GenerateError(
					`Parent override "${p.parent}": createIfMissing only supports top-level command roots.`
				);
			}
		}
		return created;
	}

	assertUniqueLeaves(resource: string, leaves: readonly Leaf[]): void {
		const names: string[] = [];
		for (const leaf of leaves) {
			if (names.includes(leaf.name)) {
				throw new GenerateError(
					`Hand-written leaf command "${resource} ${leaf.name}" is registered more than once.`
				);
			}
			names.push(leaf.name);
		}
	}

	/** The fields an override's sidecar replaces. */
	leafOverrideMeta(dir: string): Obj {
		return json(sidecar(this.sidecars.leafOverrides, dir));
	}

	/**
	 * An added leaf's complete metadata, whose identity must match where it
	 * is registered: types can't tie a sidecar to its registration.
	 */
	leafMeta(resource: string, leaf: Leaf): Value {
		const meta = sidecar(this.sidecars.leaves, leaf.dir);
		const expected = [...resource.split("/"), leaf.name];
		const command = `cf ${expected.join(" ")}`;
		const samePath =
			meta.fullPath.length === expected.length &&
			meta.fullPath.every((p, i) => p === expected[i]);
		if (meta.name !== leaf.name || meta.command !== command || !samePath) {
			throw new GenerateError(
				`src/commands/${leaf.dir}/meta.ts identity must match its registration: name "${leaf.name}", fullPath ${JSON.stringify(expected)}, command "${command}"`
			);
		}
		return json(meta);
	}

	/** Every command under a root. */
	rootMeta(root: Root): Value[] {
		return sidecar(this.sidecars.roots, root.dir).map(json);
	}

	/** Every leaf of a subgroup. */
	subgroupMeta(group: SubGroup): Value[] {
		return sidecar(this.sidecars.subgroups, group.dir).map(json);
	}
}

/** The sidecar of the command in `dir`. */
function sidecar<T>(sidecars: Readonly<Record<string, T>>, dir: string): T {
	const meta = Object.prototype.hasOwnProperty.call(sidecars, dir)
		? sidecars[dir]
		: undefined;
	if (meta === undefined) {
		throw new GenerateError(
			`src/commands/${dir}/meta.ts is not listed in src/commands/hand-written-meta.ts`
		);
	}
	return meta;
}
