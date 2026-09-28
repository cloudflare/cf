/**
 * Import set abstraction for generated module emission.
 *
 * Each emitter (interface, builder, handler blocks) advertises the
 * imports it needs by name + source-module path. The final assembly
 * unions the sets and renders them as static `import { … } from '…'`
 * lines. No more "spelunking the flag-tree at the bottom of
 * `generateCommandFile` to remember what was emitted at the top."
 *
 * Two flavors of import are tracked:
 *   - **named**: `import { add(name) } from '<path>'`. Multiple emitters
 *     can `add` the same name; the rendering dedupes.
 *   - **type-only**: `import type { ArgumentsCamelCase } from 'yargs'`.
 *     A separate bucket so we never accidentally emit a value-import
 *     for a type symbol.
 *
 * The `from(path)` accessor returns a per-path builder so call sites
 * read `imports.from(libPath('auth')).add('createCommandClient')` —
 * forming the "add a name to the import for this path" idiom.
 */

interface ImportBucket {
	add(name: string): ImportBucket;
}

export class ImportSet {
	private readonly named = new Map<string, Set<string>>();
	private readonly typed = new Map<string, Set<string>>();

	/** Builder for a value-import from a specific module path. */
	from(path: string): ImportBucket {
		const bucket = this.named.get(path) ?? new Set<string>();
		this.named.set(path, bucket);
		const api: ImportBucket = {
			add: (name) => {
				bucket.add(name);
				return api;
			},
		};
		return api;
	}

	/** Builder for a type-import from a specific module path. */
	typeFrom(path: string): ImportBucket {
		const bucket = this.typed.get(path) ?? new Set<string>();
		this.typed.set(path, bucket);
		const api: ImportBucket = {
			add: (name) => {
				bucket.add(name);
				return api;
			},
		};
		return api;
	}

	/**
	 * Render the collected imports as TypeScript source. Lines are
	 * returned in insertion order (the first `from(path)` call for a
	 * given path determines its position) — keeps the diff stable when
	 * the same emitter wires up the same imports across runs.
	 */
	render(): string[] {
		const lines: string[] = [];
		for (const [path, names] of this.typed) {
			if (names.size === 0) continue;
			const sorted = [...names].sort();
			lines.push(`import type { ${sorted.join(", ")} } from '${path}';`);
		}
		for (const [path, names] of this.named) {
			if (names.size === 0) continue;
			const sorted = [...names].sort();
			lines.push(`import { ${sorted.join(", ")} } from '${path}';`);
		}
		return lines;
	}

	/**
	 * Merge another ImportSet into this one. Used by emitters that
	 * delegate to sub-emitters.
	 */
	merge(other: ImportSet): this {
		for (const [path, names] of other.typed) {
			const target = this.typed.get(path) ?? new Set<string>();
			for (const n of names) target.add(n);
			this.typed.set(path, target);
		}
		for (const [path, names] of other.named) {
			const target = this.named.get(path) ?? new Set<string>();
			for (const n of names) target.add(n);
			this.named.set(path, target);
		}
		return this;
	}
}

/**
 * Standard `EmitResult` shape returned by every emitter.
 *
 * `lines` is the chunk of generated TS to splice into the output;
 * `imports` is whatever the chunk needs at the top of the file.
 */
export interface EmitResult {
	lines: string[];
	imports: ImportSet;
}
