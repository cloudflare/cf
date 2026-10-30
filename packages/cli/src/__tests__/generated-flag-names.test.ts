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

interface ParamInfo {
	name: string;
	flag?: string;
	positional?: true;
}
const schemas = schemasFile.schemas as Record<
	string,
	{
		pathParams: ParamInfo[];
		queryParams: ParamInfo[];
		requestBodyFields: { name: string }[];
	}
>;

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

	it("gives no parameter or body field a flag cf owns", () => {
		const clashes = Object.entries(schemas).flatMap(([command, schema]) =>
			[
				...schema.pathParams
					.filter((p) => p.flag !== undefined && p.flag !== "zone")
					.map((p) => p.flag),
				...schema.queryParams.map((p) => p.flag),
				...schema.requestBodyFields.map((field) => field.name),
			]
				.filter((flag) => flag !== undefined && owner(flag) !== undefined)
				.map((flag) => `${command} --${flag}`)
		);
		expect(clashes).toEqual([]);
	});

	it.each([
		[
			"firewall access-rules list",
			"queryParams",
			{ name: "mode", flag: "access-rule-mode" },
		],
		[
			"firewall access-rules list",
			"queryParams",
			{ name: "per_page", flag: "per-page" },
		],
		[
			"magic-cloud-networking on-ramps delete",
			"queryParams",
			{ name: "force", flag: "force-delete" },
		],
		[
			"magic-cloud-networking on-ramps delete",
			"pathParams",
			{ name: "onramp_id", flag: "onramp-id", positional: true },
		],
		["precursor update", "pathParams", { name: "zone_id", flag: "zone" }],
	] as const)("maps %s %s to its flag", (command, location, param) => {
		expect(schemas[command]?.[location]).toContainEqual(
			expect.objectContaining(param)
		);
	});

	it("names no flag for parameters cf resolves itself", () => {
		const params = schemas["firewall access-rules list"]?.pathParams ?? [];
		expect(params.map((p) => [p.name, p.flag])).toEqual([
			["account_or_zone", undefined],
			["account_or_zone_id", undefined],
		]);
	});
});
