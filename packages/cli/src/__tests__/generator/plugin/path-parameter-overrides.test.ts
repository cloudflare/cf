import { beforeAll, describe, expect, it } from "vite-plus/test";
import { generateFiles } from "../../helpers/cli-plugin.js";
import type { CommandMeta } from "../../../lib/metadata.js";

const spec = {
	openapi: "3.0.3",
	info: { title: "Path parameter overrides", version: "1" },
	paths: {
		"/accounts/{account_id}/ai-search/namespaces/{name}/instances": {
			post: {
				operationId: "ai-search-namespace-create-instance",
				"x-fern-sdk-group-name": "ai-search",
				"x-fern-sdk-method-name": "create",
				description: "Create an instance",
				"x-forge-params": {
					name: { default: "default" },
					id: { positional: true },
				},
				parameters: [
					{
						name: "account_id",
						in: "path",
						required: true,
						schema: { type: "string" },
					},
					{
						name: "name",
						in: "path",
						required: true,
						"x-fern-parameter-name": "namespace",
						schema: { type: "string" },
					},
				],
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: {
								type: "object",
								required: ["id"],
								properties: {
									id: { type: "string", description: "Instance ID" },
								},
							},
						},
					},
				},
				responses: {
					"200": {
						description: "OK",
						content: { "application/json": { schema: { type: "object" } } },
					},
				},
			},
		},
	},
	components: { schemas: {} },
};

describe("path parameter overrides in generated commands", () => {
	let files: Map<string, string>;

	beforeAll(() => {
		files = generateFiles(spec);
	}, 60_000);

	function read(path: string): string {
		const content = files.get(path);
		if (content === undefined) {
			throw new Error("Missing generated file: " + path);
		}
		return content;
	}

	it("registers a defaulted namespace flag beside the sole instance positional", () => {
		const code = read("ai-search/create.ts");
		const namespaceLine = code
			.split("\n")
			.map((line) => line.trim())
			.find((line) => line.startsWith(".option('namespace',"));
		expect(namespaceLine).toBeDefined();
		const json = namespaceLine?.slice(".option('namespace', ".length, -1) ?? "";
		expect(JSON.parse(json)).toEqual({
			type: "string",
			description: "Name",
			default: "default",
		});
		expect(code).toContain("command: 'create <id>'");
		expect(code).not.toContain(".positional('namespace'");
	});

	it("keeps the default and positional placement consistent with metadata, requests, and previews", () => {
		const metadata = JSON.parse(read("_meta/commands.json")) as {
			commands: CommandMeta[];
		};
		const meta = metadata.commands.find(
			(command) => command.command === "cf ai-search create"
		);
		expect(meta?.arguments.map((arg) => arg.name)).toEqual(["id"]);
		expect(meta?.options).toContainEqual(
			expect.objectContaining({
				name: "namespace",
				required: false,
				default: "default",
			})
		);
		expect(meta?.usage).toBe("cf ai-search create <id> [options]");
		const code = read("ai-search/create.ts");
		expect(code).toContain('encodeURIComponent(String(argv["namespace"]))');
		expect(code).toContain('"namespace": String(argv["namespace"]');
		expect(code).not.toContain('bodyData["namespace"]');
		expect(code).not.toContain('namespace: argv["namespace"]');
	});
});
