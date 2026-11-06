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

describe("multipart bodies", () => {
	runInTempDir();

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
