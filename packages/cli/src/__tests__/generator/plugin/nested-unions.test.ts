import { stripTypeScriptTypes } from "node:module";
import { Script } from "node:vm";
import { beforeAll, describe, expect, it, vi } from "vite-plus/test";
import yargs, { type CommandModule } from "yargs";
import {
	compactBody,
	parseBody,
	setNestedValue,
} from "../../../lib/body-parser.js";
import { validateBodyUnions } from "../../../lib/body-unions.js";
import { resolveFileToken } from "../../../lib/input-validation.js";
import { generateFiles } from "../../helpers/cli-plugin.js";

type Json = Record<string, unknown>;
const id = "b07a1f7c-1b34-4fba-9c57-f8033b913973";
function scope(explicit: boolean): Json {
	return {
		...(explicit ? { discriminator: { propertyName: "type" } } : {}),
		oneOf: [
			{
				type: "object",
				additionalProperties: false,
				required: ["type"],
				properties: { type: { type: "string", enum: ["default"] } },
			},
			{
				type: "object",
				additionalProperties: false,
				required: ["type", "dataset_ids"],
				properties: {
					type: { type: "string", enum: ["datasets"] },
					dataset_ids: {
						type: "array",
						minItems: 1,
						maxItems: 50,
						items: { type: "string", format: "uuid" },
						"x-fern-property-name": "ids",
					},
				},
			},
		],
	};
}
function generate(schema: Json, schemas: Json = {}): Map<string, string> {
	const paths: Json = {};
	for (const [verb, name] of [
		["post", "create"],
		["put", "update"],
	] as const) {
		paths[`/things/${name}`] = {
			[verb]: {
				summary: `${name} a thing`,
				"x-fern-sdk-group-name": "things",
				"x-fern-sdk-method-name": name,
				requestBody: {
					required: true,
					content: {
						"application/json": { schema },
					},
				},
				responses: {
					"200": {
						description: "OK",
						content: { "application/json": { schema: { type: "object" } } },
					},
				},
			},
		};
	}
	return generateFiles({
		openapi: "3.0.3",
		info: { title: "Nested unions", version: "1" },
		paths,
		components: { schemas },
	});
}

// Execute the regenerated builder and handler, replacing only I/O.
function command(code: string) {
	const send = vi.fn(
		async (_operation: unknown, _request: { body: unknown }) => undefined
	);
	const preview = vi.fn((_detail: { body: unknown }) => {});
	const source = stripTypeScriptTypes(
		code
			.slice(code.indexOf("function builder"))
			.replace("export default command;", "command;")
	);
	const module = new Script(source).runInNewContext({
		compactBody,
		parseBody,
		setNestedValue,
		validateBodyUnions,
		resolveFileToken,
		formatDryRun: preview,
		operation: {},
		createCommandClient: async () => ({ send }),
		requestApi: async (
			_client: unknown,
			_method: string,
			_path: string,
			request: { body: unknown }
		) => send({}, request),
		runWithTelemetry: async (
			_meta: unknown,
			_argv: unknown,
			task: () => Promise<void>
		) => task(),
		withProgress: async (_label: string, task: () => Promise<unknown>) =>
			task(),
		formatOutput: () => {},
	}) as CommandModule;
	return {
		send,
		preview,
		run: async (argv: string[]) =>
			yargs(argv)
				.exitProcess(false)
				.command(module)
				.strict()
				.fail((message, error) => {
					throw error ?? new Error(message);
				})
				.parseAsync(),
	};
}

describe.each([false, true])(
	"nested unions (explicit discriminator and reference: %s)",
	(explicit) => {
		let files: Map<string, string>;
		beforeAll(() => {
			files = generate(
				{
					type: "object",
					properties: {
						settings: {
							type: "object",
							properties: {
								scope: explicit
									? { $ref: "#/components/schemas/Scope" }
									: scope(explicit),
							},
						},
					},
				},
				explicit ? { Scope: scope(explicit) } : {}
			);
		});
		describe.each(["create", "update"])("%s", (name) => {
			const flag = (suffix: string) => `--settings-scope-${suffix}`;
			it.each([false, true])(
				"accepts valid scopes (dry run: %s)",
				async (dryRun) => {
					for (const [flags, expected] of [
						[[], undefined],
						[[flag("type"), "default"], { type: "default" }],
						[
							[flag("type"), "datasets", flag("ids"), id],
							{ type: "datasets", dataset_ids: [id] },
						],
						[
							[
								flag("type"),
								"datasets",
								flag("ids"),
								...Array<string>(50).fill(id),
							],
							{ type: "datasets", dataset_ids: Array<string>(50).fill(id) },
						],
					] as const) {
						const c = command(files.get(`things/${name}.ts`) ?? "");
						await c.run([name, ...flags, ...(dryRun ? ["--dry-run"] : [])]);
						const body = dryRun
							? c.preview.mock.calls[0]?.[0]?.body
							: c.send.mock.calls[0]?.[1]?.body;
						expect(body).toEqual(
							expected === undefined ? {} : { settings: { scope: expected } }
						);
						if (dryRun) {
							expect(c.send).not.toHaveBeenCalled();
						}
					}
				}
			);
			it.each([false, true])(
				"rejects invalid scopes before preview or send (dry run: %s)",
				async (dryRun) => {
					for (const [flags, error] of [
						[[flag("type"), "datasets"], /dataset_ids.*required/],
						[
							[flag("type"), "default", flag("ids"), id],
							/dataset_ids.*not allowed/,
						],
						[[flag("ids"), id], /settings-scope-type.*required/],
						[
							[
								flag("type"),
								"datasets",
								flag("ids"),
								...Array<string>(51).fill(id),
							],
							/at most 50/,
						],
					] as const) {
						const c = command(files.get(`things/${name}.ts`) ?? "");
						await expect(
							c.run([name, ...flags, ...(dryRun ? ["--dry-run"] : [])])
						).rejects.toThrow(error);
						expect(c.send).not.toHaveBeenCalled();
						expect(c.preview).not.toHaveBeenCalled();
					}
				}
			);
			it.each([false, true])(
				"keeps complete --body input available (dry run: %s)",
				async (dryRun) => {
					const c = command(files.get(`things/${name}.ts`) ?? "");
					const body = {
						settings: { scope: { type: "datasets", dataset_ids: [id] } },
					};
					await c.run([
						name,
						"--body",
						JSON.stringify(body),
						...(dryRun ? ["--dry-run"] : []),
					]);
					expect(
						dryRun
							? c.preview.mock.calls[0]?.[0]?.body
							: c.send.mock.calls[0]?.[1]?.body
					).toEqual(body);
				}
			);
			it.each([false, true])(
				"lets --body bypass projected union validation (dry run: %s)",
				async (dryRun) => {
					const c = command(files.get(`things/${name}.ts`) ?? "");
					const body = { settings: { scope: { type: "datasets" } } };
					await c.run([
						name,
						"--body",
						JSON.stringify(body),
						...(dryRun ? ["--dry-run"] : []),
					]);
					expect(
						dryRun
							? c.preview.mock.calls[0]?.[0]?.body
							: c.send.mock.calls[0]?.[1]?.body
					).toEqual(body);
				}
			);
		});
	}
);

describe.each([false, true])("outer union (at root: %s)", (root) => {
	let files: Map<string, string>;
	beforeAll(() => {
		const outer = {
			oneOf: [
				{
					type: "object",
					additionalProperties: false,
					required: ["scope"],
					properties: { scope: scope(false) },
				},
				{
					type: "object",
					additionalProperties: false,
					required: ["fallback"],
					properties: {
						fallback: { type: "string" },
						scope: {
							type: "object",
							additionalProperties: false,
							required: ["type"],
							properties: {
								type: { type: "string", enum: ["default", "datasets"] },
							},
						},
					},
				},
			],
		};
		files = generate(
			root ? outer : { type: "object", properties: { settings: outer } }
		);
	});
	for (const name of ["create", "update"]) {
		it.each([false, true])(
			`${name} preserves outer alternatives (dry run: %s)`,
			async (dryRun) => {
				const prefix = root ? "--" : "--settings-";
				for (const [flags, expected] of [
					[[`${prefix}scope-type`, "default"], { scope: { type: "default" } }],
					[
						[`${prefix}scope-type`, "datasets", `${prefix}scope-ids`, id],
						{ scope: { type: "datasets", dataset_ids: [id] } },
					],
					[
						[`${prefix}fallback`, "chosen", `${prefix}scope-type`, "datasets"],
						{ fallback: "chosen", scope: { type: "datasets" } },
					],
				] as const) {
					const c = command(files.get(`things/${name}.ts`) ?? "");
					await c.run([name, ...flags, ...(dryRun ? ["--dry-run"] : [])]);
					expect(
						dryRun
							? c.preview.mock.calls[0]?.[0]?.body
							: c.send.mock.calls[0]?.[1]?.body
					).toEqual(root ? expected : { settings: expected });
				}
			}
		);
		it.each([false, true])(
			`${name} rejects invalid nested branches (dry run: %s)`,
			async (dryRun) => {
				const prefix = root ? "--" : "--settings-";
				const c = command(files.get(`things/${name}.ts`) ?? "");
				await expect(
					c.run([
						name,
						`${prefix}scope-type`,
						"datasets",
						...(dryRun ? ["--dry-run"] : []),
					])
				).rejects.toThrow(root ? /Invalid request body/ : /Invalid settings/);
				expect(c.send).not.toHaveBeenCalled();
				expect(c.preview).not.toHaveBeenCalled();
			}
		);
	}
});

describe("tagged union detection", () => {
	it.each([
		[
			"overlapping enums",
			{
				oneOf: [
					{
						type: "object",
						required: ["type"],
						properties: { type: { enum: ["a"] } },
					},
					{
						type: "object",
						required: ["type"],
						properties: { type: { enum: ["a", "b"] } },
					},
				],
			},
		],
		[
			"optional selector",
			{
				oneOf: [
					{
						type: "object",
						required: ["type"],
						properties: { type: { enum: ["a"] } },
					},
					{ type: "object", properties: { type: { enum: ["b"] } } },
				],
			},
		],
		[
			"untagged objects",
			{
				oneOf: [
					{ type: "object", properties: { name: { type: "string" } } },
					{ type: "object", properties: { id: { type: "string" } } },
				],
			},
		],
		[
			"non-object member",
			{
				oneOf: [
					{
						type: "object",
						required: ["type"],
						properties: { type: { enum: ["a"] } },
					},
					{ type: "string" },
				],
			},
		],
		[
			"nonexclusive union",
			{
				anyOf: [
					{
						type: "object",
						required: ["type"],
						properties: { type: { enum: ["a"] } },
					},
					{
						type: "object",
						required: ["type"],
						properties: { type: { enum: ["b"] } },
					},
				],
			},
		],
		[
			"single member",
			{
				oneOf: [
					{
						type: "object",
						required: ["type"],
						properties: { type: { enum: ["a"] } },
					},
				],
			},
		],
	])("leaves %s without tagged validation", (_name, selection) => {
		const files = generate({
			type: "object",
			properties: { label: { type: "string" }, scope: selection },
		});
		for (const name of ["create", "update"]) {
			expect(files.get(`things/${name}.ts`)).not.toContain(
				"validateBodyUnions"
			);
		}
	});
	it.each([false, true])(
		"validates boolean selectors (dry run: %s)",
		async (dryRun) => {
			const files = generate({
				type: "object",
				properties: {
					scope: {
						oneOf: [
							{
								type: "object",
								additionalProperties: false,
								required: ["enabled"],
								properties: { enabled: { type: "boolean", enum: [false] } },
							},
							{
								type: "object",
								additionalProperties: false,
								required: ["enabled", "ids"],
								properties: {
									enabled: { type: "boolean", enum: [true] },
									ids: { type: "array", items: { type: "string" } },
								},
							},
						],
					},
				},
			});
			for (const name of ["create", "update"]) {
				for (const [flags, expected] of [
					[["--scope-enabled=false"], { enabled: false }],
					[
						["--scope-enabled", "--scope-ids", id],
						{ enabled: true, ids: [id] },
					],
				] as const) {
					const c = command(files.get(`things/${name}.ts`) ?? "");
					await c.run([name, ...flags, ...(dryRun ? ["--dry-run"] : [])]);
					expect(
						dryRun
							? c.preview.mock.calls[0]?.[0]?.body
							: c.send.mock.calls[0]?.[1]?.body
					).toEqual({ scope: expected });
				}
				const c = command(files.get(`things/${name}.ts`) ?? "");
				await expect(
					c.run([name, "--scope-enabled", ...(dryRun ? ["--dry-run"] : [])])
				).rejects.toThrow(/ids.*required/);
				expect(c.send).not.toHaveBeenCalled();
				expect(c.preview).not.toHaveBeenCalled();
			}
		}
	);
});
