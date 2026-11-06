import { stripTypeScriptTypes } from "node:module";
import { Script } from "node:vm";
import { describe, expect, it } from "vite-plus/test";
import yargs, { type CommandModule } from "yargs";
import { Client, type Operation } from "../../../api/client.js";
import { path } from "../../../api/path.js";
import { generateFiles } from "../../helpers/cli-plugin.js";

/**
 * A `GET /things` whose `severity` query parameter is an array of enums:
 * `inline` spells the item enum out in the parameter itself, and `ref`
 * points it at a component schema, as the pinned OpenAPI document does.
 */
function files(items: Record<string, unknown>): Map<string, string> {
	return generateFiles({
		openapi: "3.0.3",
		info: { title: "Query array enums", version: "1" },
		paths: {
			"/things": {
				get: {
					"x-fern-sdk-group-name": "things",
					"x-fern-sdk-method-name": "list",
					summary: "List things",
					parameters: [
						{
							name: "severity",
							in: "query",
							required: true,
							schema: { type: "array", items },
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
				Severity: {
					type: "string",
					enum: ["informational", "low", "medium", "high", "critical"],
				},
			},
		},
	});
}

const inlineEnum = {
	type: "string",
	enum: ["informational", "low", "medium", "high", "critical"],
};

/**
 * Runs the generated `things list` command with `flags`, and returns what
 * the operation sent: the parsed argument and the URLs it requested. It
 * throws whatever yargs rejected the invocation with, before any request.
 */
async function run(
	files: Map<string, string>,
	flags: string[]
): Promise<{ argv: Record<string, unknown>; urls: URL[] }> {
	const operationSource = stripTypeScriptTypes(
		files.get("_operations/things/list.ts") ?? ""
	)
		.replace(/^import[\s\S]*?;\n/gm, "")
		.replace("export default", "const operation =");
	const operation = new Script(`${operationSource}\noperation;`).runInNewContext(
		{
			path,
		}
	) as Operation;
	const source = stripTypeScriptTypes(files.get("things/list.ts") ?? "")
		.replace(/^import[\s\S]*?;\n/gm, "")
		.replace("export default command;", "command;");
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
	return { argv: argv as Record<string, unknown>, urls };
}

describe.each([
	["inline item enum", inlineEnum],
	[
		"referenced item schema",
		{ $ref: "#/components/schemas/Severity" },
	],
])("query arrays with enum items (%s)", (_name, items) => {
	const generated = files(items);

	it.each([
		{ flags: ["--severity", "high"], expected: ["high"] },
		{
			flags: ["--severity", "high", "--severity", "low"],
			expected: ["high", "low"],
		},
	])("keeps permitted values an array: $flags", async ({ flags, expected }) => {
		const { argv, urls } = await run(generated, flags);
		expect(argv["severity"]).toEqual(expected);
		expect(urls).toHaveLength(1);
		expect(urls[0]?.searchParams.getAll("severity")).toEqual(expected);
	});

	it("rejects an item that is not one of the enum's values, before a request", async () => {
		await expect(run(generated, ["--severity", "invalid"])).rejects.toThrow();
	});

	it("rejects an invalid item among permitted ones, before a request", async () => {
		await expect(
			run(generated, ["--severity", "high", "--severity", "invalid"])
		).rejects.toThrow();
	});
});
