import type { ParentOverrideHandWrittenCommand } from "../src/commands/hand-written.js";
import type { Schema } from "@cloudflare/forge";

/**
 * Keep hand-written leaves available before their API parent exists in the schema.
 * Only parent overrides with `createIfMissing` opt into creating a fallback root.
 *
 * Schema-provided roots are preserved. Missing roots use the override's description
 * and visibility, with no API methods; the index emitter attaches hand-written
 * leaves later. Nested parent paths are rejected because this creates top-level
 * roots only. The returned map is a copy, leaving the input map unchanged.
 */
export function withHandWrittenCommandRoots(
	commands: ReadonlyMap<string, Schema.command>,
	overrides: readonly ParentOverrideHandWrittenCommand[]
): Map<string, Schema.command> {
	const roots = new Map(commands);
	for (const override of overrides) {
		if (!override.createIfMissing) continue;
		if (override.parent.includes("/")) {
			throw new Error("createIfMissing only supports top-level command roots.");
		}
		if (roots.has(override.parent)) continue;
		roots.set(override.parent, {
			name: override.parent,
			description: override.describe,
			methods: [],
			hideCommand: !override.expose,
		});
	}
	return roots;
}
