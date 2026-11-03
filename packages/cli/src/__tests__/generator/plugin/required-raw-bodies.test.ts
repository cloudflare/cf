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

		function setup(name = "update") {
			const source = stripTypeScriptTypes(files.get(`things/${name}.ts`) ?? "")
				.replace(/^import[\s\S]*?;\n/gm, "")
				.replace("export default command;", "command;");
			const send = vi.fn(async () => undefined);
			const client = { send };
			const createCommandClient = vi.fn(async () => client);
			const requestApi = vi.fn(async () => undefined);
			const formatOutput = vi.fn();
			const formatDryRun = vi.fn();
			const command = new Script(source).runInNewContext({
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

		it("rejects missing input before authentication, requests, or success output", async () => {
			const { run, createCommandClient, requestApi, send, formatOutput } =
				setup();
			await expect(run()).rejects.toThrow("--body or --file is required");
			expect(createCommandClient).not.toHaveBeenCalled();
			expect(requestApi).not.toHaveBeenCalled();
			expect(send).not.toHaveBeenCalled();
			expect(formatOutput).not.toHaveBeenCalled();
		});

		it.each(["preview", ""])(
			"sends the explicit inline body %j",
			async (body) => {
				const { run, requestApi, client, send } = setup();
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
				const { run, requestApi, client, send } = setup();
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

		it("allows a dry run without input or authentication", async () => {
			const { run, createCommandClient, requestApi, send, formatDryRun } =
				setup();
			await run(["--dry-run"]);
			expect(formatDryRun).toHaveBeenCalledExactlyOnceWith(
				expect.objectContaining({ body: undefined })
			);
			expect(createCommandClient).not.toHaveBeenCalled();
			expect(requestApi).not.toHaveBeenCalled();
			expect(send).not.toHaveBeenCalled();
		});

		it("rejects an empty file path before making a request", async () => {
			const { run, requestApi, send, formatOutput } = setup();
			await expect(run(["--file", ""])).rejects.toThrow(
				"Cannot read invalid or empty file:"
			);
			expect(requestApi).not.toHaveBeenCalled();
			expect(send).not.toHaveBeenCalled();
			expect(formatOutput).not.toHaveBeenCalled();
		});

		if (contentType === "text/plain") {
			it("still allows omission when the schema makes the body optional", async () => {
				const { run, send, requestApi } = setup("edit");
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
