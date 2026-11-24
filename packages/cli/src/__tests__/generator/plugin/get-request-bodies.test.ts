import { stripTypeScriptTypes } from "node:module";
import { Script } from "node:vm";
import { describe, expect, it } from "vite-plus/test";
import yargs, { type CommandModule } from "yargs";
import { Client, type Operation } from "../../../api/client.js";
import { path } from "../../../api/path.js";
import { generateFiles } from "../../helpers/cli-plugin.js";
import type { CommandsMetadata } from "../../../lib/command-meta.js";

// Regression coverage for cloudflare/cf#26: a GET operation whose API
// metadata declares a request body must not advertise body-derived inputs
// that the request then drops. Either the body is sent (and help, dry-run
// and metadata say so), or no body-derived input is emitted at all.

const ok = {
	"200": {
		description: "OK",
		content: { "application/json": { schema: { type: "object" } } },
	},
};

const files = generateFiles({
	openapi: "3.0.3",
	info: { title: "GET bodies", version: "1" },
	paths: {
		"/things/search": {
			get: {
				"x-fern-sdk-group-name": "things",
				"x-fern-sdk-method-name": "search",
				summary: "Search things",
				requestBody: {
					required: false,
					content: {
						"application/json": {
							schema: {
								type: "object",
								properties: {
									name: { type: "string", description: "Name to match" },
								},
							},
						},
					},
				},
				responses: ok,
			},
		},
		"/things": {
			get: {
				"x-fern-sdk-group-name": "things",
				"x-fern-sdk-method-name": "list",
				summary: "List things",
				parameters: [
					{ name: "per_page", in: "query", schema: { type: "number" } },
				],
				responses: ok,
			},
		},
	},
});

interface Sent {
	method: string;
	url: URL;
	body: string;
}

function load(name: string) {
	const operationSource = stripTypeScriptTypes(
		files.get(`_operations/things/${name}.ts`) ?? ""
	)
		.replace(/^import[\s\S]*?;\n/gm, "")
		.replace("export default", "const operation =");
	const operation = new Script(
		`${operationSource}\noperation;`
	).runInNewContext({ path }) as Operation;
	const source = stripTypeScriptTypes(files.get(`things/${name}.ts`) ?? "")
		.replace(/^import[\s\S]*?;\n/gm, "")
		.replace("export default command;", "command;");
	return { operation, source };
}

async function run(name: string, flags: string[]) {
	const { operation, source } = load(name);
	const sent: Sent[] = [];
	const dryRuns: Record<string, unknown>[] = [];
	const client = new Client({
		baseUrl: "https://api.example.test",
		fetch: async (input, init) => {
			const request = new Request(input, init);
			sent.push({
				method: request.method,
				url: new URL(request.url),
				body: await request.text(),
			});
			return Response.json({ success: true, result: {} });
		},
	});
	const command = new Script(source).runInNewContext({
		operation,
		createCommandClient: async () => client,
		formatOutput: () => {},
		formatDryRun: (output: Record<string, unknown>) => {
			dryRuns.push(output);
		},
		resolveFileToken: (value: unknown) => value,
		withProgress: async (_label: string, task: () => Promise<unknown>) =>
			task(),
		runWithTelemetry: (
			_info: unknown,
			_argv: unknown,
			task: () => Promise<void>
		) => task(),
	}) as CommandModule;
	await yargs([name, ...flags])
		.exitProcess(false)
		.command(command)
		.strict()
		.fail((message, error) => {
			throw error ?? new Error(message);
		})
		.parseAsync();
	return { sent, dryRuns };
}

const commands = (
	JSON.parse(files.get("_meta/commands.json") ?? "{}") as CommandsMetadata
).commands;
const schemas = (
	JSON.parse(files.get("_meta/schemas.json") ?? "{}") as {
		schemas: Record<
			string,
			{ hasRequestBody: boolean; requestBodyFields: { name: string }[] }
		>;
	}
).schemas;

describe("GET operation with a declared request body", () => {
	const meta = commands.find((c) => c.command === "cf things search");
	const schema = schemas["things search"];
	const advertised = meta?.options.some((o) => o.name === "name") ?? false;

	it("has command metadata", () => {
		expect(meta).toBeDefined();
		expect(schema).toBeDefined();
	});

	it("metadata and schema metadata agree about body support", () => {
		expect(meta?.hasRequestBody).toBe(schema?.hasRequestBody);
		expect(advertised).toBe(
			schema?.requestBodyFields.some((f) => f.name === "name") ?? false
		);
		// A body-derived option is advertised exactly when a body is supported.
		expect(advertised).toBe(meta?.hasRequestBody);
	});

	it("help advertises a body option only if metadata does", () => {
		const { source } = load("search");
		expect(source.includes(`.option('name'`)).toBe(advertised);
	});

	it("every advertised body option reaches the outgoing request", async () => {
		if (!advertised) {
			// Not emitted: the flag must be rejected rather than ignored.
			await expect(run("search", ["--name", "abc"])).rejects.toThrow(
				/Unknown argument/
			);
			return;
		}
		const { sent } = await run("search", ["--name", "abc"]);
		expect(sent).toHaveLength(1);
		expect(sent[0]?.method).toBe("GET");
		expect(JSON.parse(sent[0]?.body || "null")).toEqual({ name: "abc" });
	});

	it("dry-run reports the body every advertised body option builds", async () => {
		if (!advertised) {
			return;
		}
		const { sent, dryRuns } = await run("search", [
			"--name",
			"abc",
			"--dry-run",
		]);
		expect(sent).toHaveLength(0);
		expect(dryRuns).toHaveLength(1);
		expect(dryRuns[0]?.bodyKind).not.toBe("none");
		expect(dryRuns[0]?.body).toEqual({ name: "abc" });
	});
});

describe("ordinary bodyless GET operation", () => {
	it("advertises no body and sends none", async () => {
		const meta = commands.find((c) => c.command === "cf things list");
		expect(meta?.hasRequestBody).toBe(false);
		expect(schemas["things list"]?.requestBodyFields).toEqual([]);
		const { sent } = await run("list", ["--per-page", "5"]);
		expect(sent).toHaveLength(1);
		expect(sent[0]?.method).toBe("GET");
		expect(sent[0]?.url.searchParams.get("per_page")).toBe("5");
		expect(sent[0]?.body).toBe("");
		const dry = await run("list", ["--dry-run"]);
		expect(dry.dryRuns[0]?.bodyKind).toBe("none");
	});
});
