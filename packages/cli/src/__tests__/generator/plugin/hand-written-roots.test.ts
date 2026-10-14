/**
 * How parent overrides present a top-level root: its description and
 * visibility, and, with `createIfMissing`, the root itself before the
 * document has a group of that name.
 */
import { describe, expect, it } from "vite-plus/test";
import { handWrittenMeta } from "../../../commands/hand-written-meta.js";
import {
	type HandWrittenCommand,
	handWrittenCommands,
} from "../../../commands/hand-written.js";
import { generateFiles } from "../../helpers/cli-plugin.js";
import type { Config } from "../../../../generator/plugin/index.js";

/** A document with an operation for each of `operations`. */
function doc(operations: { group: string; name: string; hidden?: boolean }[]) {
	const paths: Record<string, unknown> = {};
	operations.forEach((op, i) => {
		paths[`/operations/${i}`] = {
			get: {
				operationId: `operation-${i}`,
				"x-fern-sdk-group-name": [op.group],
				"x-fern-sdk-method-name": op.name,
				description: `Operation ${i}`,
				...(op.hidden ? { "x-forge-hidden": true } : {}),
				responses: {
					"200": {
						description: "OK",
						content: { "application/json": { schema: { type: "object" } } },
					},
				},
			},
		};
	});
	return {
		openapi: "3.0.3",
		info: { title: "Test", version: "1" },
		paths,
		components: { schemas: {} },
	};
}

/** The Preview entries of cf's registry, with `extra`. */
function previews(extra: HandWrittenCommand[] = []): Config {
	return {
		handWritten: [
			...handWrittenCommands.filter(
				(c) =>
					(c.kind === "leaf" || c.kind === "parentOverride") &&
					c.parent === "previews"
			),
			...extra,
		],
		sidecars: handWrittenMeta,
	};
}

function read(files: Map<string, string>, path: string): string {
	const content = files.get(path);
	if (content === undefined) {
		throw new Error(`no ${path} in ${[...files.keys()].join(", ")}`);
	}
	return content;
}

describe("created roots", () => {
	it("creates an opted-in parent before its API operations exist", () => {
		const files = generateFiles(doc([]), previews());
		const index = read(files, "previews/index.ts");
		expect(index).toContain("describe: 'Manage Worker Previews'");
		expect(index).toContain(
			"import $deploy from '#commands/previews/deploy/index.js';"
		);
		expect(read(files, "index.ts")).toContain(
			"lazyCommand<CommonYargsOptions>('previews', 'Manage Worker Previews', () => import('./previews/index.js'), null), hideCommand: false"
		);
		const meta = JSON.parse(read(files, "_meta/commands.json")) as {
			commands: { command: string }[];
			descriptions: Record<string, string>;
		};
		expect(meta.descriptions["previews"]).toBe("Manage Worker Previews");
		expect(meta.commands.map((c) => c.command)).toContain("cf previews deploy");
	});

	it("preserves the schema-provided parent when it arrives", () => {
		const files = generateFiles(
			doc([{ group: "previews", name: "delete" }]),
			previews()
		);
		const index = read(files, "previews/index.ts");
		expect(index).toContain(".command($delete)");
		expect(index).toContain(
			".command(withHandWrittenDryRun($deploy, 'preview'))"
		);
		const root = read(files, "index.ts");
		expect(root.match(/lazyCommand<CommonYargsOptions>\('previews'/g)).toEqual([
			"lazyCommand<CommonYargsOptions>('previews'",
		]);
	});

	it("rejects creating a nested parent as a top-level root", () => {
		expect(() =>
			generateFiles(
				doc([]),
				previews([
					{
						kind: "parentOverride",
						parent: "example/nested",
						describe: "Nested group",
						expose: true,
						createIfMissing: true,
					},
				])
			)
		).toThrow("createIfMissing only supports top-level command roots.");
	});
});

describe("parent presentation overrides", () => {
	it.each([true, false])(
		"applies expose=%s to a hidden schema root",
		(expose) => {
			const files = generateFiles(
				doc([{ group: "fixture", name: "get", hidden: true }]),
				{
					handWritten: [
						{
							kind: "parentOverride",
							parent: "fixture",
							describe: "Local description",
							expose,
						},
					],
					sidecars: { roots: {}, subgroups: {}, leaves: {}, leafOverrides: {} },
				}
			);
			expect(read(files, "index.ts")).toContain(
				`lazyCommand<CommonYargsOptions>('fixture', 'Local description', () => import('./fixture/index.js'), null), hideCommand: ${!expose}`
			);
			expect(read(files, "fixture/index.ts")).toContain(
				"describe: 'Local description'"
			);
			expect(
				JSON.parse(read(files, "_meta/commands.json")).descriptions
			).toMatchObject({ fixture: "Local description" });
		}
	);
});
