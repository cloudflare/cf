import { stripTypeScriptTypes } from "node:module";
import { Script } from "node:vm";
import { describe, expect, it } from "vite-plus/test";
import yargs, { type CommandModule } from "yargs";
import { Client, type Operation } from "../../../api/client.js";
import { path } from "../../../api/path.js";
import { generateFiles } from "../../helpers/cli-plugin.js";
import type { CommandsMetadata } from "../../../lib/command-meta.js";

const enumValues = ["001", "a/b &c", "literal,comma"];
const enumSchema = { type: "string", enum: enumValues };

describe.each(
	[undefined, false].flatMap((explode) => [
		{
			explode,
			schema: "unconstrained",
			parameterSchema: { type: "array", items: { type: "string" } },
			choices: undefined,
		},
		{
			explode,
			schema: "inline enum",
			parameterSchema: { type: "array", items: enumSchema },
			choices: enumValues,
		},
		{
			explode,
			schema: "referenced enum",
			parameterSchema: {
				type: "array",
				items: { $ref: "#/components/schemas/IndicatorId" },
			},
			choices: enumValues,
		},
		{
			explode,
			schema: "allOf referenced array",
			parameterSchema: {
				allOf: [
					{ $ref: "#/components/schemas/IndicatorIds" },
					{
						type: "array",
						items: { $ref: "#/components/schemas/IndicatorId" },
					},
				],
			},
			choices: enumValues,
		},
	])
)(
	"query arrays ($schema, explode: $explode)",
	({ explode, parameterSchema, choices }) => {
		const files = generateFiles({
			openapi: "3.0.3",
			info: { title: "Query arrays", version: "1" },
			paths: {
				"/things": {
					get: {
						"x-fern-sdk-group-name": "things",
						"x-fern-sdk-method-name": "list",
						summary: "List things",
						parameters: [
							{
								name: "indicatorIds",
								in: "query",
								required: true,
								...(explode === undefined ? {} : { explode }),
								schema: parameterSchema,
							},
						],
						responses: {
							"200": {
								description: "OK",
								content: { "application/json": { schema: { type: "object" } } },
							},
						},
					},
				},
			},
			components: {
				schemas: {
					IndicatorId: enumSchema,
					IndicatorIds: {
						type: "array",
						items: { $ref: "#/components/schemas/IndicatorId" },
					},
				},
			},
		});
		const operationSource = stripTypeScriptTypes(
			files.get("_operations/things/list.ts") ?? ""
		)
			.replace(/^import[\s\S]*?;\n/gm, "")
			.replace("export default", "const operation =");
		const operation = new Script(
			`${operationSource}\noperation;`
		).runInNewContext({
			path,
		}) as Operation;
		const source = stripTypeScriptTypes(files.get("things/list.ts") ?? "")
			.replace(/^import[\s\S]*?;\n/gm, "")
			.replace("export default command;", "command;");

		async function run(flags: string[], urls: URL[] = []) {
			const client = new Client({
				baseUrl: "https://api.example.test",
				fetch: async (input) => {
					urls.push(new URL(input instanceof Request ? input.url : input));
					return Response.json({ success: true, result: [] });
				},
			});
			const command = new Script(source).runInNewContext({
				operation,
				createCommandClient: async () => client,
				formatOutput: () => {},
				withProgress: async (_label: string, task: () => Promise<unknown>) =>
					task(),
				runWithTelemetry: (
					_info: unknown,
					_argv: unknown,
					task: () => Promise<void>
				) => task(),
			}) as CommandModule;
			const argv = await yargs(["list", ...flags])
				.exitProcess(false)
				.command(command)
				.strict()
				.fail((message, error) => {
					throw error ?? new Error(message);
				})
				.parseAsync();
			return { argv, urls };
		}

		it("preserves the array type and publishes item choices", () => {
			expect(source).toContain('"type":"string","array":true');
			if (choices === undefined) {
				expect(source).not.toContain('"choices"');
			} else {
				expect(source).toContain(`"choices":${JSON.stringify(choices)}`);
			}
			const metadata = JSON.parse(
				files.get("_meta/commands.json") ?? "{}"
			) as CommandsMetadata;
			const option = metadata.commands
				.find((command) => command.command === "cf things list")
				?.options.find((entry) => entry.name === "indicator-ids");
			expect(option).toMatchObject({ type: "string", required: true });
			expect(option?.enum).toEqual(choices);
			if (explode === false && choices !== undefined) {
				expect(source).toContain('.coerce("indicator-ids"');
			} else {
				expect(source).not.toContain(".coerce(");
			}
		});

		it.each([
			{ flags: ["--indicator-ids", "001"], expected: ["001"] },
			{
				flags: ["--indicator-ids", "literal,comma"],
				expected: ["literal,comma"],
			},
			{
				flags: ["--indicator-ids", "001", "a/b &c"],
				expected: ["001", "a/b &c"],
			},
			{
				flags: ["--indicator-ids", "001", "--indicator-ids", "a/b &c"],
				expected: ["001", "a/b &c"],
			},
		])("parses and serializes $flags", async ({ flags, expected }) => {
			const { argv, urls } = await run(flags);
			expect(argv["indicator-ids"]).toEqual(expected);
			expect(urls).toHaveLength(1);
			expect(urls[0]?.searchParams.getAll("indicatorIds")).toEqual(
				explode === false ? [expected.join(",")] : expected
			);
			expect(urls[0]?.searchParams.has("indicator-ids")).toBe(false);
		});

		it("requires the array flag", async () => {
			await expect(run([])).rejects.toThrow(
				"Missing required argument: indicator-ids"
			);
		});

		if (explode === false) {
			it("retains comma-separated input for joined arrays", async () => {
				const { argv, urls } = await run([
					"--indicator-ids",
					"001,a/b &c",
					"--indicator-ids",
					"001",
				]);
				expect(argv["indicator-ids"]).toEqual(
					choices === undefined
						? ["001,a/b &c", "001"]
						: ["001", "a/b &c", "001"]
				);
				expect(urls[0]?.searchParams.getAll("indicatorIds")).toEqual([
					"001,a/b &c,001",
				]);
			});
		}

		if (choices !== undefined) {
			it.each([
				{ flags: ["--indicator-ids", "invalid"] },
				{ flags: ["--indicator-ids", "001", "invalid"] },
				{ flags: ["--indicator-ids", "001", "--indicator-ids", "invalid"] },
				{ flags: ["--indicator-ids", "001,invalid"] },
			])(
				"rejects invalid items before a request: $flags",
				async ({ flags }) => {
					const urls: URL[] = [];
					await expect(run(flags, urls)).rejects.toThrow(
						/Invalid values:[\s\S]*Argument: indicator-ids[\s\S]*invalid/
					);
					expect(urls).toHaveLength(0);
				}
			);
		}
	}
);
