import { stripTypeScriptTypes } from "node:module";
import { Script } from "node:vm";
import { runInTempDir, seed } from "@cloudflare/workers-utils/test-helpers";
import { describe, expect, it, vi } from "vite-plus/test";
import yargs, { type CommandModule } from "yargs";
import {
	readFileForFlag,
	resolveFileToken,
} from "../../../lib/input-validation.js";
import { generateFiles } from "../../helpers/cli-plugin.js";

function setup(files: Map<string, string>, name = "update") {
	const source = stripTypeScriptTypes(files.get(`things/${name}.ts`) ?? "")
		.replace(/^import[\s\S]*?;\n/gm, "")
		.replace("export default command;", "command;");
	const send = vi.fn(async () => undefined);
	const client = { send };
	const createCommandClient = vi.fn(async () => client);
	const requestApi = vi.fn(
		async (
			_client: unknown,
			_method: string,
			_path: string,
			_options: { body?: unknown; headers?: Record<string, string> }
		) => undefined
	);
	const formatOutput = vi.fn();
	const formatDryRun = vi.fn();
	const command = new Script(source).runInNewContext({
		Blob,
		FormData,
		operation: {},
		createCommandClient,
		getAccountId: async () => "account",
		resolveAccountIdSilent: async () => "account",
		requestApi,
		readFileForFlag,
		resolveFileToken,
		formatOutput,
		formatDryRun,
		withProgress: async (_label: string, task: () => Promise<unknown>) =>
			task(),
		runWithTelemetry: (
			_info: unknown,
			_argv: unknown,
			task: () => Promise<void>
		) => task(),
	}) as CommandModule;
	const run = (flags: string[] = []) =>
		yargs([name, ...flags])
			.exitProcess(false)
			.command(command)
			.strict()
			.fail((message, error) => {
				throw error ?? new Error(message);
			})
			.parseAsync();
	return {
		run,
		client,
		createCommandClient,
		requestApi,
		send,
		formatOutput,
		formatDryRun,
	};
}

describe.each(["text/plain", "application/octet-stream"])(
	"required %s bodies",
	(contentType) => {
		runInTempDir();
		const endpoint = (name: string, required: boolean) => ({
			"x-fern-sdk-group-name": "things",
			"x-fern-sdk-method-name": name,
			summary: "Update a thing",
			parameters: [
				{
					name: "account_id",
					in: "path",
					required: true,
					schema: { type: "string" },
				},
			],
			requestBody: {
				required,
				content: {
					[contentType]: { schema: { $ref: "#/components/schemas/Value" } },
				},
			},
			responses: {
				"200": {
					description: "OK",
					content: { "application/json": { schema: { type: "object" } } },
				},
			},
		});
		const files = generateFiles({
			openapi: "3.0.3",
			info: { title: "Raw bodies", version: "1" },
			paths: {
				"/accounts/{account_id}/things": {
					put: endpoint("update", true),
					patch: endpoint("edit", false),
				},
			},
			components: { schemas: { Value: { type: "string" } } },
		});

		it("rejects missing input before authentication, requests, or success output", async () => {
			const { run, createCommandClient, requestApi, send, formatOutput } =
				setup(files);
			await expect(run()).rejects.toThrow("--body or --file is required");
			expect(createCommandClient).not.toHaveBeenCalled();
			expect(requestApi).not.toHaveBeenCalled();
			expect(send).not.toHaveBeenCalled();
			expect(formatOutput).not.toHaveBeenCalled();
		});

		it.each(["preview", ""])(
			"sends the explicit inline body %j",
			async (body) => {
				const { run, requestApi, client, send } = setup(files);
				await run(["--body", body]);
				expect(requestApi).toHaveBeenCalledExactlyOnceWith(
					client,
					"PUT",
					"/accounts/account/things",
					{ body, headers: { "Content-Type": contentType } }
				);
				expect(send).not.toHaveBeenCalled();
			}
		);

		it.each(["--body", "--file"])(
			"sends a file supplied through %s",
			async (flag) => {
				await seed({ "body value.txt": "preview" });
				const { run, requestApi, client, send } = setup(files);
				await run([flag, `${flag === "--body" ? "@" : ""}body value.txt`]);
				expect(requestApi).toHaveBeenCalledExactlyOnceWith(
					client,
					"PUT",
					"/accounts/account/things",
					{
						body: Buffer.from("preview"),
						headers: { "Content-Type": contentType },
					}
				);
				expect(send).not.toHaveBeenCalled();
			}
		);

		it("ignores an unreadable --body when --file supplies the payload", async () => {
			await seed({ "body value.txt": "preview" });
			const { run, requestApi, client, send } = setup(files);
			await run(["--file", "body value.txt", "--body", "@missing.txt"]);
			expect(requestApi).toHaveBeenCalledExactlyOnceWith(
				client,
				"PUT",
				"/accounts/account/things",
				{
					body: Buffer.from("preview"),
					headers: { "Content-Type": contentType },
				}
			);
			expect(send).not.toHaveBeenCalled();
		});

		it("allows a dry run without input or authentication", async () => {
			const { run, createCommandClient, requestApi, send, formatDryRun } =
				setup(files);
			await run(["--dry-run"]);
			expect(formatDryRun).toHaveBeenCalledExactlyOnceWith(
				expect.objectContaining({ body: undefined })
			);
			expect(createCommandClient).not.toHaveBeenCalled();
			expect(requestApi).not.toHaveBeenCalled();
			expect(send).not.toHaveBeenCalled();
		});

		it("previews a --file body during a dry run", async () => {
			const { run, requestApi, formatDryRun } = setup(files);
			await run(["--dry-run", "--file", "body.txt"]);
			expect(formatDryRun).toHaveBeenCalledExactlyOnceWith(
				expect.objectContaining({ body: { file: "body.txt" } })
			);
			expect(requestApi).not.toHaveBeenCalled();
		});

		it("rejects an unreadable @file body before authentication", async () => {
			const { run, createCommandClient, requestApi, send } = setup(files);
			await expect(run(["--body", "@missing.txt"])).rejects.toThrow(
				"missing.txt"
			);
			expect(createCommandClient).not.toHaveBeenCalled();
			expect(requestApi).not.toHaveBeenCalled();
			expect(send).not.toHaveBeenCalled();
		});

		it("does not import the JSON body parser", () => {
			expect(files.get("things/update.ts")).not.toContain("parseBody");
		});

		it("rejects an empty file path before making a request", async () => {
			const { run, requestApi, send, formatOutput } = setup(files);
			await expect(run(["--file", ""])).rejects.toThrow(
				"Cannot read invalid or empty file:"
			);
			expect(requestApi).not.toHaveBeenCalled();
			expect(send).not.toHaveBeenCalled();
			expect(formatOutput).not.toHaveBeenCalled();
		});

		if (contentType === "text/plain") {
			it("still allows omission when the schema makes the body optional", async () => {
				const { run, send, requestApi } = setup(files, "edit");
				await run();
				expect(send).toHaveBeenCalledExactlyOnceWith(
					{},
					{ account_id: "account" }
				);
				expect(requestApi).not.toHaveBeenCalled();
			});
		}
	}
);

describe("mixed raw and multipart bodies", () => {
	runInTempDir();
	const files = generateFiles({
		openapi: "3.0.3",
		info: { title: "Mixed bodies", version: "1" },
		paths: {
			"/things": {
				put: {
					"x-fern-sdk-group-name": "things",
					"x-fern-sdk-method-name": "update",
					summary: "Update a thing",
					requestBody: {
						required: true,
						content: {
							"application/octet-stream": {
								schema: { $ref: "#/components/schemas/Value" },
							},
							"multipart/form-data": {
								schema: {
									type: "object",
									properties: {
										value: { $ref: "#/components/schemas/Value" },
										metadata: { type: "object", additionalProperties: true },
										attachment: { type: "string", format: "binary" },
									},
								},
							},
						},
					},
					responses: { "200": { description: "OK" } },
				},
			},
		},
		components: { schemas: { Value: { type: "string" } } },
	});

	it.each([
		["metadata", "{}"],
		["attachment", "inline attachment"],
	])(
		"keeps --body literal when --%s selects multipart",
		async (flag, value) => {
			const { run, requestApi, client, send } = setup(files);
			await run([`--${flag}`, value, "--body", "@literal"]);
			expect(requestApi).toHaveBeenCalledExactlyOnceWith(
				client,
				"PUT",
				"/things",
				{ body: expect.any(FormData) }
			);
			const form = requestApi.mock.calls[0]?.[3].body as FormData;
			expect(form.get("value")).toBe("@literal");
			const part = form.get(flag);
			if (flag === "attachment") {
				expect(part).toBeInstanceOf(Blob);
				expect(await (part as Blob).text()).toBe(value);
			} else {
				expect(part).toBe(value);
			}
			expect(send).not.toHaveBeenCalled();
		}
	);
});

describe("required JSON bodies without writable flags", () => {
	const responseSchema = {
		type: "object",
		required: ["id"],
		properties: { id: { type: "string", readOnly: true } },
	};
	const jsonFiles = (schema: Record<string, unknown>, withHeader = false) =>
		generateFiles({
			openapi: "3.0.3",
			info: { title: "Read-only JSON bodies", version: "1" },
			paths: {
				"/things": {
					put: {
						"x-fern-sdk-group-name": "things",
						"x-fern-sdk-method-name": "update",
						summary: "Update a thing",
						parameters: withHeader
							? [{ name: "revision", in: "header", schema: { type: "string" } }]
							: [],
						requestBody: {
							required: true,
							content: { "application/json": { schema } },
						},
						responses: { "200": { description: "OK" } },
					},
				},
			},
			components: { schemas: { Response: responseSchema } },
		});

	it.each([
		responseSchema,
		{ $ref: "#/components/schemas/Response" },
		{
			allOf: [
				responseSchema,
				{ type: "object", properties: { id: { type: "string" } } },
			],
		},
		{
			allOf: [
				{ type: "object", properties: { id: { type: "string" } } },
				responseSchema,
			],
		},
	])(
		"sends an empty JSON body for read-only properties: %j",
		async (schema) => {
			const { run, send } = setup(jsonFiles(schema));
			await run();
			expect(send).toHaveBeenCalledExactlyOnceWith({}, { body: {} });
		}
	);

	it("sends an empty read-only JSON body through the header request path", async () => {
		const { run, client, requestApi } = setup(jsonFiles(responseSchema, true));
		await run(["--revision", "current"]);
		expect(requestApi).toHaveBeenCalledExactlyOnceWith(
			client,
			"PUT",
			"/things",
			{
				body: {},
				headers: { revision: "current" },
			}
		);
	});

	it.each([
		{ ...responseSchema, additionalProperties: { type: "string" } },
		{
			type: "object",
			properties: {
				...responseSchema.properties,
				values: { type: "array", items: { type: "boolean" } },
			},
		},
	])(
		"still requires input for other mandatory JSON bodies: %j",
		async (schema) => {
			const { run, createCommandClient, send, requestApi } = setup(
				jsonFiles(schema)
			);
			await expect(run()).rejects.toThrow("--body is required");
			expect(createCommandClient).not.toHaveBeenCalled();
			expect(send).not.toHaveBeenCalled();
			expect(requestApi).not.toHaveBeenCalled();
		}
	);
});

describe("multipart bodies", () => {
	runInTempDir();
	const multipartFiles = (
		properties: Record<string, unknown>,
		required: string[]
	) =>
		generateFiles({
			openapi: "3.0.3",
			info: { title: "Multipart bodies", version: "1" },
			paths: {
				"/things": {
					put: {
						"x-fern-sdk-group-name": "things",
						"x-fern-sdk-method-name": "update",
						summary: "Update a thing",
						requestBody: {
							required: true,
							content: {
								"multipart/form-data": {
									schema: { type: "object", properties, required },
								},
							},
						},
						responses: { "200": { description: "OK" } },
					},
				},
			},
		});
	const readOnlyFields = {
		id: { type: "string", readOnly: true },
		snapshot: { type: "string", format: "binary", readOnly: true },
		archives: {
			type: "array",
			items: { type: "string", format: "binary" },
			readOnly: true,
		},
	};

	it("omits read-only text and binary flags and uploads to the writable payload", async () => {
		const files = multipartFiles(
			{
				...readOnlyFields,
				label: { type: "string" },
				file: { type: "string", format: "binary" },
				attachment: { type: "string", format: "binary" },
			},
			["id", "snapshot", "archives", "file"]
		);
		const code = files.get("things/update.ts") ?? "";
		for (const field of Object.keys(readOnlyFields)) {
			expect(code).not.toContain(`.option('${field}',`);
			expect(code).not.toContain(`formData.append('${field}',`);
		}
		await seed({ "payload.txt": "writable content" });
		const { run, requestApi } = setup(files);
		await run([
			"--file",
			"payload.txt",
			"--label",
			"preview",
			"--attachment",
			"extra content",
		]);
		const form = requestApi.mock.calls[0]?.[3].body as FormData;
		expect([...form.keys()]).toEqual(["file", "label", "attachment"]);
		expect(await (form.get("file") as Blob).text()).toBe("writable content");
		expect(form.get("label")).toBe("preview");
		expect(await (form.get("attachment") as Blob).text()).toBe("extra content");
	});

	it("allows omission when only read-only form fields are required", async () => {
		const { run, send, requestApi } = setup(
			multipartFiles(readOnlyFields, Object.keys(readOnlyFields))
		);
		await run();
		expect(send).toHaveBeenCalledExactlyOnceWith({}, {});
		expect(requestApi).not.toHaveBeenCalled();
	});

	it("still requires input when a writable form field is required", async () => {
		const { run, createCommandClient, requestApi, send } = setup(
			multipartFiles(
				{ ...readOnlyFields, file: { type: "string", format: "binary" } },
				["id", "file"]
			)
		);
		await expect(run()).rejects.toThrow("--body or --file is required");
		expect(createCommandClient).not.toHaveBeenCalled();
		expect(requestApi).not.toHaveBeenCalled();
		expect(send).not.toHaveBeenCalled();
	});

	it("rejects an empty file path before making a request", async () => {
		const files = generateFiles({
			openapi: "3.0.3",
			info: { title: "Multipart bodies", version: "1" },
			paths: {
				"/things": {
					put: {
						"x-fern-sdk-group-name": "things",
						"x-fern-sdk-method-name": "update",
						summary: "Update a thing",
						requestBody: {
							required: true,
							content: {
								"multipart/form-data": {
									schema: {
										type: "object",
										properties: { file: { type: "string", format: "binary" } },
										required: ["file"],
									},
								},
							},
						},
						responses: { "200": { description: "OK" } },
					},
				},
			},
		});
		const { run, requestApi, send, formatOutput } = setup(files);
		await expect(run(["--file", ""])).rejects.toThrow(
			"Cannot read invalid or empty file:"
		);
		expect(requestApi).not.toHaveBeenCalled();
		expect(send).not.toHaveBeenCalled();
		expect(formatOutput).not.toHaveBeenCalled();
	});
});
