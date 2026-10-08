import { Forge } from "@cloudflare/forge";
import { describe, expect, it, vi } from "vite-plus/test";
import { transformer } from "../../../generator/index.js";
import type * as HandWrittenRegistry from "../../commands/hand-written.js";

const settings = vi.hoisted(() => ({ expose: true }));

// Isolate parent presentation from the registry's unrelated command sidecars.
vi.mock("../../commands/hand-written.js", async (importOriginal) => {
	const actual = await importOriginal<typeof HandWrittenRegistry>();
	return {
		...actual,
		handWrittenCommands: [],
		rootHandWrittenCommands: () => [],
		leafHandWrittenCommands: () => [],
		leafOverrideHandWrittenCommands: () => [],
		subGroupHandWrittenCommands: () => [],
		parentOverrideHandWrittenCommands: () => [
			{
				kind: "parentOverride",
				parent: "fixture",
				describe: "Local description",
				expose: settings.expose,
			},
		],
	};
});

describe("parent presentation overrides", () => {
	it.each([true, false])(
		"applies expose=%s to a hidden schema root",
		async (expose) => {
			settings.expose = expose;
			const forge = new Forge({
				openapi: "3.0.0",
				info: { title: "Fixture", version: "1" },
				paths: {},
			});
			forge.commands.set("fixture", {
				name: "fixture",
				description: "Schema description",
				methods: [],
				globalCliArgs: [],
				hideCommand: true,
			});
			const files = new Map(
				(await forge.transform(transformer)).map((file) => [
					file.path,
					file.content,
				])
			);
			expect(files.get("index.ts")).toContain(
				`lazyCommand<CommonYargsOptions>('fixture', 'Local description', () => import('./fixture/index.js'), null), hideCommand: ${!expose}`
			);
			expect(files.get("fixture/index.ts")).toContain(
				"describe: 'Local description'"
			);
			expect(
				JSON.parse(files.get("_meta/commands.json") ?? "").descriptions
			).toMatchObject({ fixture: "Local description" });
		}
	);
});
