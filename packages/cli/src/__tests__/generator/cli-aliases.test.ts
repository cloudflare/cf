import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { transform } from "esbuild";
import { describe, expect, it, vi } from "vite-plus/test";
import yargs from "yargs";
import { filterForCliAudience } from "../../../generator/cli-audience.js";
import * as bodyParser from "../../lib/body-parser.js";
import { redactDryRunBody } from "../../lib/dry-run.js";
import * as inputValidation from "../../lib/input-validation.js";
import { transformRequestBody } from "../../lib/request-body-transform.js";
import { generateFiles } from "../helpers/cli-plugin.js";
import type { ForgeOpenApiDocument } from "../../../generator/openapi.js";
import type { DryRunOutput } from "../../lib/dry-run.js";
import type { RequestTransform } from "@cloudflare/forge/request-transform";
import type { CommandModule } from "yargs";

function files(source = fixture()) {
	filterForCliAudience(source);
	return generateFiles(
		source as { info: Record<string, unknown> } & Record<string, unknown>
	);
}
function requireValue<T>(value: T | null | undefined): T {
	assert(value !== undefined && value !== null);
	return value;
}

const path =
	"/accounts/{account_id}/workers/workers/{worker_id}/previews/{preview_id}/deployments/latest";
function fixture(): ForgeOpenApiDocument {
	return JSON.parse(
		readFileSync(
			new URL("./fixtures/previews-cli-aliases.json", import.meta.url),
			"utf8"
		)
	);
}
function operation(source: ForgeOpenApiDocument): Record<string, unknown> {
	return requireValue(
		requireValue(requireValue(source.paths)[path]).patch
	) as unknown as Record<string, unknown>;
}
function aliasEntry(source: ForgeOpenApiDocument): Record<string, unknown> {
	return requireValue(
		(operation(source)["x-forge-aliases"] as Record<string, unknown>[]).find(
			(item) => item["x-forge-request-transform"] !== undefined
		)
	);
}
function alias(source: ForgeOpenApiDocument): RequestTransform {
	return aliasEntry(source)["x-forge-request-transform"] as RequestTransform;
}
/** Execute an emitted leaf with real yargs and body helpers, mocking its I/O. */
async function commandHarness(
	generated: Map<string, string>,
	leaf = "put",
	group = `previews/${leaf === "edit" ? "deployments" : "secrets"}`
) {
	const code = requireValue(generated.get(`${group}/${leaf}.ts`));
	const sdkCall = vi.fn().mockResolvedValue({ id: "new-deployment" });
	const requestApi = vi.fn().mockResolvedValue({ id: "new-deployment" });
	const createCommandClient = vi.fn().mockResolvedValue({
		send: sdkCall,
	});
	const promptForRequiredField = vi.fn().mockResolvedValue("stdin-secret");
	const confirmDelete = vi.fn().mockResolvedValue(true);
	const dryRun = vi.fn();
	const modules: Record<string, unknown> = {
		"#lib/auth.js": {
			createCommandClient,
			getAccountId: async () => "account",
			resolveAccountIdSilent: async () => "account",
			requestApi,
		},
		"#lib/local.js": { LOCAL_ACCOUNT_ID: "local-account" },
		"#lib/output.js": { formatOutput: vi.fn() },
		"#lib/dry-run.js": {
			formatDryRun: (
				output: DryRunOutput & { sensitiveBodyPaths?: string[][] }
			) =>
				dryRun({
					...output,
					body: redactDryRunBody(output.body, output.sensitiveBodyPaths ?? []),
				}),
		},
		"#lib/progress.js": {
			withProgress: (_label: string, run: () => unknown) => run(),
		},
		"#lib/telemetry/index.js": {
			runWithTelemetry: (_info: unknown, _argv: unknown, run: () => unknown) =>
				run(),
		},
		"#lib/prompt.js": { promptForRequiredField, confirmDelete },
		"#lib/body-parser.js": bodyParser,
		"#lib/input-validation.js": inputValidation,
		"#lib/request-body-transform.js": { transformRequestBody },
	};
	const module: { exports: { default?: CommandModule } } = { exports: {} };
	const compiled = await transform(code, {
		loader: "ts",
		format: "cjs",
	});
	runInNewContext(compiled.code, {
		module,
		exports: module.exports,
		process,
		URLSearchParams,
		require: (id: string) => {
			expect(
				Object.hasOwn(modules, id),
				`Unexpected generated import: ${id}`
			).toBe(true);
			return modules[id];
		},
	});
	const command = requireValue(module.exports.default);
	return {
		code,
		sdkCall,
		requestApi,
		createCommandClient,
		promptForRequiredField,
		confirmDelete,
		dryRun,
		run: async (args: string[]) =>
			yargs([])
				.scriptName("cf")
				.exitProcess(false)
				.strict()
				.command(command)
				.parseAsync(args),
	};
}

describe("CLI request aliases", () => {
	it("generates the primary edit command and selected secret aliases", () => {
		const generated = files();
		expect(generated.has("previews/deployments/edit.ts")).toBe(true);
		expect(generated.has("previews/secrets/put.ts")).toBe(true);
		const meta = JSON.parse(requireValue(generated.get("_meta/commands.json")));
		const put = meta.commands.find(
			(c: { command: string }) => c.command === "cf previews secrets put"
		);
		expect(put.requestTransform.requestBody).toEqual(
			alias(fixture()).requestBody
		);
		expect(put.options.map((o: { name: string }) => o.name)).toEqual(
			expect.arrayContaining(["value", "ignore-defaults"])
		);
		expect(put.options.map((o: { name: string }) => o.name)).not.toContain(
			"body"
		);
		expect(
			requireValue(generated.get("previews/deployments/edit.ts"))
		).toContain("option('body'");
	});
	it("sends one PATCH with computed keys, secret text, and inherited query parameters", async () => {
		const harness = await commandHarness(files());
		const text = "secret with quotes ' and unicode ☁";
		await harness.run([
			"put",
			"preview",
			"MY_SECRET",
			"--worker-id",
			"worker",
			"--value",
			text,
			"--ignore-defaults",
		]);
		expect(harness.requestApi).toHaveBeenCalledExactlyOnceWith(
			expect.anything(),
			"PATCH",
			"/accounts/account/workers/workers/worker/previews/preview/deployments/latest?ignore_defaults=true",
			{ body: { env: { MY_SECRET: { type: "secret_text", text } } } }
		);
		expect(harness.promptForRequiredField).not.toHaveBeenCalled();
	});
	it("prompts for an omitted sensitive value through the existing secret input path", async () => {
		const harness = await commandHarness(files());
		await harness.run(["put", "preview", "MY_SECRET", "--worker-id", "worker"]);
		expect(harness.promptForRequiredField).toHaveBeenCalledExactlyOnceWith(
			"value",
			expect.any(String),
			{ kind: "secret" }
		);
		expect(harness.requestApi.mock.calls[0]?.[3]).toEqual({
			body: {
				env: { MY_SECRET: { type: "secret_text", text: "stdin-secret" } },
			},
		});
	});
	it.each([{ values: [] }, { values: ["--value", "private-text"] }])(
		"redacts dry-run values without authentication or prompting (%j)",
		async ({ values }) => {
			const harness = await commandHarness(files());
			await harness.run([
				"put",
				"preview",
				"MY_SECRET",
				"--worker-id",
				"worker",
				"--dry-run",
				...values,
			]);
			expect(harness.dryRun.mock.calls[0]?.[0].body).toEqual({
				env: { MY_SECRET: { type: "secret_text", text: "<redacted>" } },
			});
			expect(harness.createCommandClient).not.toHaveBeenCalled();
			expect(harness.promptForRequiredField).not.toHaveBeenCalled();
		}
	);
	it("confirms removal and sends a null tombstone in one deployment patch", async () => {
		const harness = await commandHarness(files(), "delete");
		await harness.run([
			"delete",
			"preview",
			"MY_SECRET",
			"--worker-id",
			"worker",
			"--force",
		]);
		expect(harness.confirmDelete).toHaveBeenCalledOnce();
		expect(harness.requestApi).toHaveBeenCalledExactlyOnceWith(
			expect.anything(),
			"PATCH",
			"/accounts/account/workers/workers/worker/previews/preview/deployments/latest",
			{ body: { env: { MY_SECRET: null } } }
		);
	});
	it("selects aliases independently of a parent's audience", () => {
		const source = fixture();
		operation(source)["x-fern-audiences"] = ["sdk"];
		const generated = files(source);
		expect(generated.has("previews/secrets/put.ts")).toBe(true);
		expect(generated.has("previews/deployments/edit.ts")).toBe(false);
	});
	it("sends JSON when the endpoint also accepts merge-patch JSON", async () => {
		const source = fixture();
		const body = operation(source).requestBody as {
			content: Record<string, unknown>;
		};
		body.content["application/merge-patch+json"] =
			body.content["application/json"];
		const generated = files(source);
		const harness = await commandHarness(generated);
		expect(harness.code).not.toContain('.option("file"');
		const meta = JSON.parse(requireValue(generated.get("_meta/commands.json")));
		const put = meta.commands.find(
			(c: { command: string }) => c.command === "cf previews secrets put"
		);
		expect(put.options.map((o: { name: string }) => o.name)).not.toContain(
			"file"
		);
		await harness.run([
			"put",
			"preview",
			"NAME",
			"--worker-id",
			"worker",
			"--value",
			"text",
		]);
		expect(harness.requestApi).toHaveBeenCalledOnce();
	});
	it.each(["Apply these labels?", ""])(
		"uses ordinary names, help fallbacks, optional positionals, and confirmation (%j)",
		async (confirmation) => {
			const generated = files({
				openapi: "3.0.0",
				info: { title: "Label aliases", version: "1" },
				"x-forge-commands": {
					catalogue: {
						description: "Manage the catalogue.",
						groups: { "2fa": { description: "Manage labels." } },
					},
				},
				paths: {
					"/labels": {
						patch: {
							operationId: "catalogue.labels.edit",
							description: "Edit labels.",
							"x-fern-sdk-group-name": "catalogue.labels",
							"x-fern-sdk-method-name": "edit",
							"x-forge-aliases": [
								{
									"x-fern-sdk-group-name": "catalogue.2fa",
									"x-fern-sdk-method-name": "edit",
									"x-fern-audiences": ["cf-cli"],
									"x-forge-require-confirmation": confirmation,
									"x-forge-request-transform": {
										arguments: [
											{
												name: "display_label",
												type: "string",
												positional: true,
											},
										],
										requestBody: {
											object: [
												{
													key: "label",
													value: { arg: "display_label" },
													omitIfUnset: "display_label",
												},
											],
										},
									},
								},
							],
							requestBody: {
								content: {
									"application/json": {
										schema: {
											type: "object",
											properties: { label: { type: "string" } },
										},
									},
								},
							},
							responses: { "204": { description: "Labels updated." } },
						},
					},
				},
			});
			const meta = JSON.parse(
				requireValue(generated.get("_meta/commands.json"))
			);
			const edit = meta.commands.find(
				(c: { command: string }) => c.command === "cf catalogue 2fa edit"
			);
			expect(edit.description).toBe("Edit labels.");
			expect(edit.arguments).toEqual(
				expect.arrayContaining([
					expect.objectContaining({
						name: "display-label",
						required: false,
						description: "Display label",
					}),
				])
			);
			const harness = await commandHarness(generated, "edit", "catalogue/2fa");
			await harness.run(["edit", "--force"]);
			expect(harness.requestApi.mock.calls[0]?.[3]).toEqual({ body: {} });
			await harness.run(["edit", "Personal", "--force"]);
			expect(harness.requestApi.mock.calls[1]?.[3]).toEqual({
				body: { label: "Personal" },
			});
			expect(harness.confirmDelete).toHaveBeenCalledWith({
				force: true,
				message: confirmation,
			});
			expect(harness.promptForRequiredField).not.toHaveBeenCalled();
		}
	);
	it.each([{ body: [] }, { body: ["first", "second"] }])(
		"sends and previews one array request body (%j)",
		async ({ body }) => {
			const generated = files({
				openapi: "3.0.0",
				info: { title: "Array request alias", version: "1" },
				"x-forge-commands": {
					catalogue: {
						description: "Manage the catalogue.",
						groups: { labels: { description: "Manage labels." } },
					},
				},
				paths: {
					"/labels": {
						patch: {
							operationId: "catalogue.labels.edit",
							description: "Edit labels.",
							"x-fern-sdk-group-name": "catalogue.labels",
							"x-fern-sdk-method-name": "edit",
							"x-forge-aliases": [
								{
									"x-fern-sdk-group-name": "catalogue.labels",
									"x-fern-sdk-method-name": "reset",
									"x-fern-audiences": ["cf-cli"],
									description: "Reset labels.",
									"x-forge-request-transform": {
										arguments: [],
										requestBody: { literal: body },
									},
								},
							],
							requestBody: {
								required: true,
								content: {
									"application/json": {
										schema: { type: "array", items: { type: "string" } },
									},
								},
							},
							responses: { "204": { description: "Labels updated." } },
						},
					},
				},
			});
			const harness = await commandHarness(
				generated,
				"reset",
				"catalogue/labels"
			);
			await harness.run(["reset", "--dry-run"]);
			expect(harness.dryRun.mock.calls[0]?.[0]).toMatchObject({
				bodyKind: "json",
				body,
			});
			expect(harness.requestApi).not.toHaveBeenCalled();
			await harness.run(["reset"]);
			expect(harness.requestApi).toHaveBeenCalledExactlyOnceWith(
				expect.anything(),
				"PATCH",
				"/labels",
				{ body }
			);
		}
	);
	it("reports mapping syntax errors through command metadata validation", () => {
		const source = fixture();
		aliasEntry(source)["x-forge-request-transform"] = {
			...alias(source),
			requestBody: { script: "invalid" },
		};
		expect(() => files(source)).toThrow(
			/previews\.secrets\.put: Unknown request transform field/
		);
	});
	it("reports mapping reference errors with the command name", () => {
		const source = fixture();
		alias(source).requestBody = { arg: "missing" };
		expect(() => files(source)).toThrow(
			/previews\.secrets\.put: Unknown request transform argument reference: missing/
		);
	});
	it.each([
		"body",
		"file",
		"force",
		"f",
		"mode",
		"m",
		"help",
		"h",
		"version",
		"v",
		"worker-id",
		"worker_id",
		"WorkerId",
	])("rejects colliding argument %s", (name) => {
		const source = fixture();
		const mapping = alias(source);
		requireValue(mapping.arguments[0]).name = name;
		expect(() => files(source)).toThrow(/collides/);
	});
});
