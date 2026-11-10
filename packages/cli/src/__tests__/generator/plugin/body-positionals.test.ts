import { stripTypeScriptTypes } from "node:module";
import { Script } from "node:vm";
import { runInTempDir, seed } from "@cloudflare/workers-utils/test-helpers";
import { beforeAll, describe, expect, it, vi } from "vite-plus/test";
import yargs, { type CommandModule } from "yargs";
import * as bodyParser from "../../../lib/body-parser.js";
import { resolveFileToken } from "../../../lib/input-validation.js";
import { generateFiles } from "../../helpers/cli-plugin.js";
import type { CommandMeta } from "../../../lib/command-meta.js";

function setup(code: string) {
	const send = vi.fn(async () => undefined);
	const createCommandClient = vi.fn(async () => ({ send }));
	const formatDryRun = vi.fn();
	const source = stripTypeScriptTypes(
		code
			.slice(code.indexOf("function builder"))
			.replace("export default command;", "command;")
	);
	const command = new Script(source).runInNewContext({
		...bodyParser,
		resolveFileToken,
		operation: {},
		createCommandClient,
		formatDryRun,
		formatOutput: () => {},
		runWithTelemetry: (
			_meta: unknown,
			_argv: unknown,
			task: () => Promise<void>
		) => task(),
		withProgress: (_label: string, task: () => Promise<unknown>) => task(),
	}) as CommandModule;
	return {
		send,
		createCommandClient,
		formatDryRun,
		run: async (args: string[]) =>
			yargs(["save", ...args])
				.exitProcess(false)
				.command(command)
				.strict()
				.fail((message, error) => {
					throw error ?? new Error(message);
				})
				.parseAsync(),
	};
}

describe("body positionals with --body", () => {
	runInTempDir();
	let files: Map<string, string>;
	beforeAll(() => {
		files = generateFiles({
			openapi: "3.0.3",
			info: { title: "Body positionals", version: "1" },
			paths: {
				"/things/{thing_id}": {
					post: {
						operationId: "saveThing",
						summary: "Save a thing",
						"x-fern-sdk-group-name": "things",
						"x-fern-sdk-method-name": "save",
						"x-forge-params": {
							script_tag: { positional: true, flagName: "worker-tag" },
						},
						parameters: [
							{
								name: "thing_id",
								in: "path",
								required: true,
								schema: { type: "string" },
							},
						],
						requestBody: {
							required: true,
							content: {
								"application/json": {
									schema: { $ref: "#/components/schemas/Input" },
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
			components: {
				schemas: {
					Input: {
						type: "object",
						required: ["script_tag"],
						properties: {
							script_tag: { type: "string" },
							label: { type: "string" },
						},
					},
				},
			},
		});
	});
	const command = () => setup(files.get("things/save.ts") ?? "");

	it("keeps command usage and positional metadata consistent", () => {
		const { commands } = JSON.parse(files.get("_meta/commands.json") ?? "") as {
			commands: CommandMeta[];
		};
		expect(commands[0]).toMatchObject({
			usage: "cf things save <thing-id> <worker-tag> [options]",
			arguments: [
				{ name: "thing-id", required: true },
				{ name: "worker-tag", required: true },
			],
		});
	});

	it.each([false, true])(
		"sends the same body in execution and dry run (dry run: %s)",
		async (dryRun) => {
			await seed({ "body ü.json": '{"label":"from file"}' });
			for (const [args, expected] of [
				[
					["tag", "--body", '{"label":"raw"}'],
					{ script_tag: "tag", label: "raw" },
				],
				[["tag", "--body", '{"script_tag":"tag"}'], { script_tag: "tag" }],
				[
					["tag", "--body", "@body ü.json"],
					{ script_tag: "tag", label: "from file" },
				],
				[["tag", "--label", "flag"], { script_tag: "tag", label: "flag" }],
				[
					["tag", "--label", "ignored", "--body", '{"label":"raw"}'],
					{ script_tag: "tag", label: "raw" },
				],
			] as const) {
				const { run, send, formatDryRun } = command();
				await run(["thing", ...args, ...(dryRun ? ["--dry-run"] : [])]);
				if (dryRun) {
					expect(formatDryRun).toHaveBeenCalledExactlyOnceWith(
						expect.objectContaining({
							body: expected,
							pathParams: { "thing-id": "thing" },
						})
					);
					expect(send).not.toHaveBeenCalled();
				} else {
					expect(send).toHaveBeenCalledExactlyOnceWith(
						{},
						{ thing_id: "thing", body: expected }
					);
				}
			}
		}
	);

	it.each([false, true])(
		"rejects conflicting inputs before authentication (dry run: %s)",
		async (dryRun) => {
			const { run, send, createCommandClient, formatDryRun } = command();
			await expect(
				run([
					"thing",
					"tag",
					"--body",
					'{"script_tag":"other"}',
					...(dryRun ? ["--dry-run"] : []),
				])
			).rejects.toThrow(/worker-tag.*script_tag.*--body/);
			expect(createCommandClient).not.toHaveBeenCalled();
			expect(send).not.toHaveBeenCalled();
			expect(formatDryRun).not.toHaveBeenCalled();
		}
	);

	it.each(["null", "[]", "1", '"text"'])(
		"rejects a positional combined with non-object JSON %s",
		async (body) => {
			const { run, createCommandClient } = command();
			await expect(run(["thing", "tag", "--body", body])).rejects.toThrow(
				/--body must be a JSON object/
			);
			expect(createCommandClient).not.toHaveBeenCalled();
		}
	);

	it.each([false, true])(
		"requires a body positional even when --body contains its field (dry run: %s)",
		async (dryRun) => {
			await seed({ "body ü.json": '{"script_tag":"tag"}' });
			for (const args of [
				[],
				["--body", '{"script_tag":"tag"}'],
				["--body", "@body ü.json"],
			]) {
				const { run, createCommandClient, send, formatDryRun } = command();
				await expect(
					run(["thing", ...args, ...(dryRun ? ["--dry-run"] : [])])
				).rejects.toThrow(/Not enough non-option arguments/);
				expect(createCommandClient).not.toHaveBeenCalled();
				expect(send).not.toHaveBeenCalled();
				expect(formatDryRun).not.toHaveBeenCalled();
			}
		}
	);

	it("still requires URL positionals with --body", async () => {
		const { run, createCommandClient } = command();
		await expect(run(["--body", '{"script_tag":"tag"}'])).rejects.toThrow();
		expect(createCommandClient).not.toHaveBeenCalled();
	});
});
