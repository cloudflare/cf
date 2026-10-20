import { stripTypeScriptTypes } from "node:module";
import { Script } from "node:vm";
import { runInTempDir, seed } from "@cloudflare/workers-utils/test-helpers";
import { describe, expect, it, vi } from "vite-plus/test";
import yargs, { type CommandModule } from "yargs";
import {
	compactBody,
	parseBody,
	parseNestedArray,
	parseObjectArray,
	setNestedValue,
} from "../../../lib/body-parser.js";
import { resolveFileToken } from "../../../lib/input-validation.js";
import { generateFiles } from "../../helpers/cli-plugin.js";
import type { CommandMeta } from "../../../lib/command-meta.js";

function generate(typed: boolean) {
	const schema = {
		type: "object",
		properties: {
			name: { type: "string" },
			details: {
				type: "object",
				required: ["rules", "tags"],
				properties: {
					rules: {
						type: "array",
						minItems: 1,
						maxItems: 8,
						items: { $ref: "#/components/schemas/Rule" },
					},
					tags: { type: "array", items: { type: "string" } },
				},
			},
			query: {
				type: "object",
				required: ["groups"],
				properties: {
					groups: {
						type: "array",
						minItems: 1,
						maxItems: 8,
						items: { $ref: "#/components/schemas/RuleGroup" },
					},
					version: { type: "integer", default: 1 },
				},
			},
		},
	};
	return generateFiles({
		openapi: "3.0.3",
		info: { title: "Nested arrays", version: "1" },
		components: {
			schemas: {
				Rule: {
					type: "object",
					properties: {
						field: { type: "string" },
						values: { type: "array", items: { type: "string" } },
					},
					required: ["field"],
				},
				RuleGroup: {
					type: "array",
					items: { $ref: "#/components/schemas/Rule" },
				},
			},
		},
		paths: {
			"/things": Object.fromEntries(
				["post", "patch"].map((verb) => [
					verb,
					{
						"x-fern-sdk-group-name": "things",
						"x-fern-sdk-method-name": verb === "post" ? "create" : "update",
						summary: "Save a thing",
						parameters: typed
							? []
							: [{ in: "header", name: "X-Test", schema: { type: "string" } }],
						requestBody: { content: { "application/json": { schema } } },
						responses: {
							"200": {
								description: "OK",
								content: { "application/json": { schema: { type: "object" } } },
							},
						},
					},
				])
			),
		},
	});
}

describe.each([true, false])(
	"nested array flags (typed request: %s)",
	(typed) => {
		runInTempDir();
		const files = generate(typed);
		const metadata = JSON.parse(files.get("_meta/commands.json") ?? "") as {
			commands: CommandMeta[];
		};
		const rules = [{ field: "name", values: ["one", "two"] }];
		const groups = [rules, [{ field: "other", values: [] }]];

		for (const method of ["create", "update"]) {
			const code = files.get(`things/${method}.ts`) ?? "";
			const source = stripTypeScriptTypes(code)
				.replace(/^import[\s\S]*?;\n/gm, "")
				.replace("export default command;", "command;");
			const setup = () => {
				const send = vi.fn(async () => undefined);
				const requestApi = vi.fn(async () => undefined);
				const formatDryRun = vi.fn();
				const command = new Script(source).runInNewContext({
					compactBody,
					parseBody,
					parseNestedArray,
					parseObjectArray,
					setNestedValue,
					resolveFileToken,
					formatDryRun,
					createCommandClient: async () => ({ send }),
					requestApi,
					operation: {},
					formatOutput: () => {},
					withProgress: async (_label: string, task: () => Promise<unknown>) =>
						task(),
					runWithTelemetry: (
						_info: unknown,
						_argv: unknown,
						run: () => Promise<void>
					) => run(),
				}) as CommandModule;
				const parse = async (flags: string[]) =>
					yargs([method, "--name", "thing", ...flags])
						.exitProcess(false)
						.command(command)
						.strict()
						.fail((message, error) => {
							throw error ?? new Error(message);
						})
						.parseAsync();
				return { parse, send, requestApi, formatDryRun };
			};

			it(`${method} retains both array fields and their group requirements`, () => {
				const options =
					metadata.commands.find((c) => c.command === `cf things ${method}`)
						?.options ?? [];
				expect(options).toContainEqual(
					expect.objectContaining({
						name: "details-rules",
						type: "string",
						description: expect.stringContaining("JSON array of objects"),
					})
				);
				expect(options).toContainEqual(
					expect.objectContaining({
						name: "query-groups",
						type: "string",
						description: expect.stringContaining("JSON array of arrays"),
					})
				);
				expect(code).toContain(
					"const missing = ['details-rules', 'details-tags']"
				);
				expect(code).toContain("const missing = ['query-groups']");
			});

			it.each([false, true])(
				`${method} accepts complete inline, file, and --body inputs (dry run: %s)`,
				async (dryRun) => {
					await seed({
						"rules file.json": JSON.stringify(rules),
						"groups file.json": JSON.stringify(groups),
					});
					const expected = {
						name: "thing",
						details: { rules, tags: ["tag"] },
						query: { groups, version: 2 },
					};
					for (const flags of [
						[
							"--details-rules",
							JSON.stringify(rules),
							"--details-tags",
							"tag",
							"--query-groups",
							JSON.stringify(groups),
							"--query-version",
							"2",
						],
						[
							"--details-rules",
							"@rules file.json",
							"--details-tags",
							"tag",
							"--query-groups",
							"@groups file.json",
							"--query-version",
							"2",
						],
						["--body", JSON.stringify(expected)],
					]) {
						const { parse, send, requestApi, formatDryRun } = setup();
						await parse([...flags, ...(dryRun ? ["--dry-run"] : [])]);
						if (dryRun) {
							expect(formatDryRun).toHaveBeenCalledWith(
								expect.objectContaining({ body: expected })
							);
							expect(send).not.toHaveBeenCalled();
							expect(requestApi).not.toHaveBeenCalled();
						} else if (typed) {
							expect(send).toHaveBeenCalledWith({}, { body: expected });
						} else {
							expect(requestApi).toHaveBeenCalledWith(
								expect.anything(),
								method === "create" ? "POST" : "PATCH",
								"/things",
								expect.objectContaining({ body: expected })
							);
						}
					}
				}
			);

			it(`${method} omits unused optional parents`, async () => {
				const { parse, formatDryRun } = setup();
				await parse(["--dry-run"]);
				expect(formatDryRun).toHaveBeenCalledWith(
					expect.objectContaining({ body: { name: "thing" } })
				);
			});

			it.each([false, true])(
				`${method} rejects partial groups (dry run: %s)`,
				async (dryRun) => {
					for (const [flags, missing] of [
						[["--details-tags", "tag"], "--details-rules"],
						[["--details-rules", JSON.stringify(rules)], "--details-tags"],
						[["--query-version", "1"], "--query-groups"],
					] as const) {
						const { parse, send, requestApi, formatDryRun } = setup();
						await expect(
							parse([...flags, ...(dryRun ? ["--dry-run"] : [])])
						).rejects.toThrow(missing);
						expect(send).not.toHaveBeenCalled();
						expect(requestApi).not.toHaveBeenCalled();
						expect(formatDryRun).not.toHaveBeenCalled();
					}
				}
			);
		}
	}
);
