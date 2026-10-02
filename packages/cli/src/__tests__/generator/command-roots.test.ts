import { describe, expect, it } from "vitest";
import { withHandWrittenCommandRoots } from "../../../generator/command-roots.js";
import { parentOverrideHandWrittenCommands } from "../../commands/hand-written.js";
import type { Schema } from "@cloudflare/forge";

describe("hand-written command roots", () => {
	it("creates an opted-in parent before its API operations exist", () => {
		const source = new Map<string, Schema.command>();
		const roots = withHandWrittenCommandRoots(
			source,
			parentOverrideHandWrittenCommands()
		);
		expect(roots.get("previews")).toEqual({
			name: "previews",
			description: "Manage Worker Previews",
			methods: [],
			globalCliArgs: [],
			hideCommand: false,
		});
		expect(roots.has("access")).toBe(false);
		expect(source.size).toBe(0);
	});

	it("preserves the schema-provided parent when it arrives", () => {
		const schema: Schema.command = {
			name: "previews",
			description: "Preview API",
			methods: [
				{
					name: "delete",
					operationId: "fixture.previews.delete",
					status: "generally-available",
				},
			],
			globalCliArgs: [],
			hideCommand: false,
		};
		const roots = withHandWrittenCommandRoots(
			new Map([[schema.name, schema]]),
			parentOverrideHandWrittenCommands()
		);
		expect(roots.size).toBe(1);
		expect(roots.get("previews")).toBe(schema);
	});

	it("rejects creating a nested parent as a top-level root", () => {
		expect(() =>
			withHandWrittenCommandRoots(new Map(), [
				{
					kind: "parentOverride",
					parent: "example/nested",
					describe: "Nested group",
					expose: true,
					createIfMissing: true,
				},
			])
		).toThrow("createIfMissing only supports top-level command roots.");
	});
});
