import { describe, expect, it } from "vite-plus/test";
import { flagOwnership } from "../lib/global-options.js";
import type { CommandMeta } from "../lib/metadata.js";

const { default: commandsFile } = await import(
	"../commands/_generated/_meta/commands.json",
	{ with: { type: "json" } }
);
const { default: handWrittenFile } = await import(
	"../commands/_generated/_meta/hand-written-commands.json",
	{ with: { type: "json" } }
);
const { default: schemasFile } = await import(
	"../commands/_generated/_meta/schemas.json",
	{ with: { type: "json" } }
);

const owner = flagOwnership(["dry-run", "body", "force", "f"]);
// cf adds these to every command itself, so a second copy would come from an
// API field.
const CF_EMITTED = new Set(["dry-run", "body"]);

const handWritten = new Set(
	(handWrittenFile.commands as CommandMeta[]).map((c) => c.command)
);
const generated = (commandsFile.commands as CommandMeta[]).filter(
	(c) => !handWritten.has(c.command)
);

describe("generated flag names", () => {
	it("gives no generated command an API flag cf owns", () => {
		const clashes = generated.flatMap((command) => {
			const names = [
				...command.arguments.map((a) => a.name),
				...command.options.map((o) => o.name),
			];
			return names
				.filter(
					(name) =>
						owner(name) !== undefined &&
						!(
							CF_EMITTED.has(name) &&
							names.filter((n) => n === name).length === 1
						)
				)
				.map((name) => `${command.command} --${name}`);
		});
		expect(generated.length).toBeGreaterThan(1000);
		expect(clashes).toEqual([]);
	});

	it("gives no request body field a flag cf owns", () => {
		const clashes = Object.entries(
			schemasFile.schemas as Record<
				string,
				{ requestBodyFields: { name: string }[] }
			>
		).flatMap(([command, schema]) =>
			schema.requestBodyFields
				.filter((field) => owner(field.name) !== undefined)
				.map((field) => `${command} --${field.name}`)
		);
		expect(clashes).toEqual([]);
	});
});
