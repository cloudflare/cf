import { stripTypeScriptTypes } from "node:module";
import { Script } from "node:vm";
import { describe, expect, it } from "vite-plus/test";
import yargs, { type CommandModule } from "yargs";
import { Client, type Operation } from "../../../api/client.js";
import { path } from "../../../api/path.js";
import { generateFiles } from "../../helpers/cli-plugin.js";

describe.each([undefined, false])("query arrays (explode: %s)", (explode) => {
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
							schema: { type: "array", items: { type: "string" } },
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

	async function run(flags: string[]) {
		const urls: URL[] = [];
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

	it.each([
		{ flags: ["--indicator-ids", "001"], expected: ["001"] },
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
});
