import type { ParentOverrideHandWrittenCommand } from "../src/commands/hand-written.js";
import type { Schema } from "@cloudflare/forge";

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
		// Keep local workflows available before their API operations opt into CLI generation.
		roots.set(override.parent, {
			name: override.parent,
			description: override.describe,
			methods: [],
			globalCliArgs: [],
			hideCommand: !override.expose,
		});
	}
	return roots;
}
