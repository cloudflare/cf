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
function generate(explicit: boolean): Map<string, string> {
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
						"application/json": {
							schema: {
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
		};
	}
	return generateFiles({
		openapi: "3.0.3",
		info: { title: "Nested unions", version: "1" },
		paths,
		components: { schemas: explicit ? { Scope: scope(explicit) } : {} },
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
			files = generate(explicit);
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
		});
	}
);
