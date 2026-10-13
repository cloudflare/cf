import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import yargs from "yargs";
import { withHandWrittenDryRun } from "../../lib/hand-written-dry-run.js";
import { generateFiles } from "../helpers/forge-cli.js";
import { runCf } from "../helpers/run-cf.js";
import type { OptionMeta } from "../../lib/metadata.js";

afterEach(() => vi.restoreAllMocks());

describe("hand-written dry runs", () => {
	it("previews a lazily loaded root subcommand", async () => {
		const output = vi.spyOn(console, "log").mockImplementation(() => {});
		const { exitCode } = await runCf(["auth", "whoami", "--dry-run"]);
		expect(exitCode).toBe(0);
		expect(String(output.mock.calls[0]?.[0])).toContain(
			'"command": "cf auth whoami"'
		);
	});

	it("validates arguments and skips a nested command handler", async () => {
		const handler = vi.fn();
		const output = vi.spyOn(console, "log").mockImplementation(() => {});
		const group = withHandWrittenDryRun(
			{
				command: "group",
				describe: "A hand-written group",
				builder: (args) =>
					args.command({
						command: "delete <id>",
						describe: "Delete a resource",
						builder: (nested) => nested.positional("id", { type: "string" }),
						handler,
					}),
				handler: () => {},
			},
			"preview"
		);

		let error: unknown;
		try {
			await yargs(["group", "delete", "item-1", "--dry-run"])
				.command(group)
				.strict()
				.exitProcess(false)
				.parseAsync();
		} catch (caught) {
			error = caught;
		}
		expect(error).toMatchObject({ code: 0 });
		expect(handler).not.toHaveBeenCalled();
		expect(JSON.parse(String(output.mock.calls[0]?.[0]))).toEqual({
			command: "cf group delete",
			dryRun: true,
			executed: false,
			validated: "arguments only",
		});
	});

	it("skips delegates when their parser disables camel-case expansion", async () => {
		const handler = vi.fn();
		const output = vi.spyOn(console, "log").mockImplementation(() => {});
		const command = withHandWrittenDryRun(
			{
				command: "dev [implArgs..]",
				describe: "Run a delegate",
				builder: (args) =>
					args
						.positional("implArgs", { type: "string", array: true })
						.parserConfiguration({
							"camel-case-expansion": false,
							"unknown-options-as-args": true,
						}),
				handler,
			},
			"preview"
		);

		await expect(async () => {
			await yargs(["dev", "--dry-run", "--token", "secret-value"])
				.command(command)
				.strict()
				.exitProcess(false)
				.parseAsync();
		}).rejects.toMatchObject({ code: 0 });
		expect(handler).not.toHaveBeenCalled();
		expect(output).toHaveBeenCalledTimes(1);
		expect(String(output.mock.calls[0]?.[0])).not.toContain("secret-value");
	});

	it("lets an existing command implement its own dry run", async () => {
		const handler = vi.fn();
		const command = withHandWrittenDryRun(
			{ command: "deploy", describe: "Deploy", handler },
			"native"
		);
		await yargs(["deploy", "--dry-run"])
			.command(command)
			.strict()
			.exitProcess(false)
			.parseAsync();
		expect(handler).toHaveBeenCalledWith(
			expect.objectContaining({ dryRun: true })
		);
	});
});

describe("hand-written dry-run build guard", () => {
	/**
	 * Generates the product `things` with a hand-written leaf `create`, whose
	 * sidecar has `options`.
	 */
	function generate(options: OptionMeta[]) {
		return generateFiles(
			{
				openapi: "3.0.3",
				info: { title: "Test", version: "1" },
				paths: {
					"/things": {
						get: {
							"x-fern-sdk-group-name": "things",
							"x-fern-sdk-method-name": "list",
							description: "List things",
							responses: { "200": { description: "OK" } },
						},
					},
				},
				components: { schemas: {} },
			},
			{
				handWritten: [
					{
						kind: "leaf",
						dryRun: "preview",
						parent: "things",
						name: "create",
						dir: "example/create",
					},
				],
				sidecars: {
					roots: {},
					subgroups: {},
					leafOverrides: {},
					leaves: {
						"example/create": {
							command: "cf things create",
							name: "create",
							fullPath: ["things", "create"],
							category: "create",
							description: "Create a thing",
							usage: "cf things create",
							arguments: [],
							options,
						},
					},
				},
			}
		);
	}

	it("rejects a new command without a boolean dry-run option", () => {
		expect(() => generate([])).toThrow(
			"cf things create (example/create/meta.ts) must declare exactly one boolean --dry-run option."
		);
	});

	it("accepts a command that declares it", () => {
		expect(() =>
			generate([
				{
					name: "dry-run",
					type: "boolean",
					required: false,
					description: "Preview",
				},
			])
		).not.toThrow();
	});
});
