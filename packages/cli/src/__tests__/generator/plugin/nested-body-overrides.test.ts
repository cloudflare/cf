import { stripTypeScriptTypes } from "node:module";
import { Script } from "node:vm";
import { runInTempDir, seed } from "@cloudflare/workers-utils/test-helpers";
import { describe, expect, it, vi } from "vite-plus/test";
import yargs, { type CommandModule } from "yargs";
import { derive } from "../../../../generator/plugin/args.js";
import { compactBody, parseBody } from "../../../lib/body-parser.js";
import { resolveFileToken } from "../../../lib/input-validation.js";
import {
	bodyParam,
	find,
	generateFiles,
	method,
	operation,
} from "../../helpers/cli-plugin.js";
import type { Method } from "../../../../generator/plugin/commands.js";
import type { CommandMeta } from "../../../lib/command-meta.js";

describe("exact body-field overrides", () => {
	const op = operation("post", "/things", {
		hasRequestBody: true,
		requestContentTypes: ["application/json"],
		requestBodyRequired: ["settings"],
		bodyParams: [
			bodyParam("settings-label", "string", ["settings", "label"], {
				default: "schema",
				required: true,
			}),
			bodyParam("settings-sibling", "string", ["settings", "sibling"], {
				default: "sibling",
			}),
			bodyParam("label", "string", ["label"], { default: "top" }),
		],
	});
	const args = (params: Method["params"]) =>
		derive(method("create", "things-create", { params }), "things", op).args;

	const parentOverrides: NonNullable<Method["params"]>[string][] = [
		{ choices: ["parent"] },
		{ array: true },
		{ required: false },
		{ fromFile: false },
		{ default: "parent" },
	];
	it.each(parentOverrides)(
		"does not inherit a parent override %j",
		(override) => {
			expect(args({ settings: override })).toEqual(args({}));
		}
	);

	it.each([
		[{ array: true }, { type: "array", fromFile: undefined }],
		[{ required: true }, { required: true }],
		[{ fromFile: { format: "json" } }, { fromFile: { format: "json" } }],
		[{ default: false }, { default: false }],
	] as const)("applies the exact child override %j", (override, expected) => {
		expect(
			find(args({ "settings.sibling": override }), "settings-sibling")
		).toMatchObject(expected);
	});

	it("applies exact child overrides and leaves siblings unchanged", () => {
		const derived = args({
			settings: {
				choices: ["parent"],
				array: true,
				required: true,
				fromFile: false,
				default: "parent",
			},
			"settings.label": {
				choices: ["child"],
				array: false,
				required: false,
				fromFile: false,
				default: "child",
			},
		});
		expect(find(derived, "settings-label")).toMatchObject({
			type: "enum",
			choices: ["child"],
			required: false,
			fromFile: undefined,
			default: "child",
		});
		expect(find(derived, "settings-sibling")).toEqual(
			find(args({}), "settings-sibling")
		);
	});

	it("treats null properties as absent, except default:null clears a schema default", () => {
		const derived = args({
			settings: {
				choices: ["parent"],
				array: true,
				required: false,
				fromFile: false,
				default: "parent",
			},
			"settings.label": {
				choices: null,
				array: null,
				required: null,
				fromFile: null,
				default: null,
			},
			"settings.sibling": null,
		});
		expect(find(derived, "settings-label")).toMatchObject({
			type: "string",
			choices: undefined,
			required: true,
			fromFile: { format: "text" },
			default: undefined,
		});
		expect(find(derived, "settings-sibling")).toEqual(
			find(args({}), "settings-sibling")
		);
	});

	it("preserves top-level overrides, including false defaults", () => {
		expect(
			find(
				args({
					label: {
						choices: ["top"],
						required: true,
						fromFile: false,
						default: false,
					},
				}),
				"label"
			)
		).toMatchObject({
			type: "enum",
			choices: ["top"],
			required: true,
			fromFile: undefined,
			default: false,
		});
	});
});

describe("emitted nested overrides and metadata", () => {
	runInTempDir();
	it.each([false, true])(
		"preserves optional-parent behavior (required parent: %s)",
		async (requiredParent) => {
			const files = generateFiles({
				openapi: "3.0.3",
				info: { title: "Nested overrides", version: "1" },
				paths: {
					"/things": {
						post: {
							"x-fern-sdk-group-name": "things",
							"x-fern-sdk-method-name": "create",
							summary: "Create a thing",
							"x-forge-params": {
								settings: {
									choices: ["parent"],
									array: true,
									required: true,
									fromFile: false,
									default: "parent",
								},
								"settings.label": {
									choices: ["child"],
									array: false,
									required: false,
									fromFile: false,
									default: "child",
								},
								"settings.enabled": { default: false },
							},
							requestBody: {
								content: {
									"application/json": {
										schema: {
											type: "object",
											required: requiredParent ? ["settings"] : [],
											properties: {
												settings: {
													type: "object",
													properties: {
														label: { type: "string", default: "schema" },
														sibling: { type: "string", default: "sibling" },
														enabled: { type: "boolean", default: true },
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
									content: {
										"application/json": { schema: { type: "object" } },
									},
								},
							},
						},
					},
				},
			});
			const metadata = JSON.parse(files.get("_meta/commands.json") ?? "") as {
				commands: CommandMeta[];
			};
			const options =
				metadata.commands.find((c) => c.command === "cf things create")
					?.options ?? [];
			const source = stripTypeScriptTypes(files.get("things/create.ts") ?? "")
				.replace(/^import[\s\S]*?;\n/gm, "")
				.replace("export default command;", "command;");
			const formatDryRun = vi.fn();
			const command = new Script(source).runInNewContext({
				compactBody,
				parseBody,
				resolveFileToken,
				formatDryRun,
				runWithTelemetry: (
					_info: unknown,
					_argv: unknown,
					run: () => Promise<void>
				) => run(),
			}) as CommandModule;
			const parse = async (flags: string[]) =>
				yargs(["create", "--dry-run", ...flags])
					.exitProcess(false)
					.command(command)
					.strict()
					.fail((message, error) => {
						throw error ?? new Error(message);
					})
					.parseAsync();
			for (const [flag, value] of [
				["settings-label", "child"],
				["settings-sibling", "sibling"],
				["settings-enabled", false],
			] as const) {
				const option = options.find((o) => o.name === flag);
				expect(option?.required).toBe(false);
				if (requiredParent) {
					expect(option).toHaveProperty("default", value);
				} else {
					expect(option).not.toHaveProperty("default");
				}
			}
			expect(options.find((o) => o.name === "settings-label")?.enum).toEqual([
				"child",
			]);
			await seed({ "sibling value.txt": "file sibling" });
			await parse([]);
			expect(formatDryRun).toHaveBeenLastCalledWith(
				expect.objectContaining({
					body: requiredParent
						? {
								settings: {
									label: "child",
									sibling: "sibling",
									enabled: false,
								},
							}
						: {},
				})
			);
			await parse([
				"--settings-label",
				"child",
				"--settings-sibling",
				"@sibling value.txt",
				"--settings-enabled=false",
			]);
			const body = formatDryRun.mock.lastCall?.[0].body;
			// Only the exact label override disables @file handling; a sibling retains it.
			expect(body.settings.label).toBe("child");
			expect(body.settings.sibling).toBe("file sibling");
			expect(body.settings.enabled).toBe(false);
			await expect(parse(["--settings-label", "parent"])).rejects.toThrow(
				"Invalid values"
			);
		}
	);
});
