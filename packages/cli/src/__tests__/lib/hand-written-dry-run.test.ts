import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import yargs from "yargs";
import { validateHandWrittenDryRunMetadata } from "../../../generator/metadata.js";
import { withHandWrittenDryRun } from "../../lib/hand-written-dry-run.js";
import { runCf } from "../helpers/run-cf.js";
import type { HandWrittenCommandMeta } from "../../../generator/metadata.js";

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
	it("rejects a new command without a boolean dry-run option", () => {
		const command = {
			command: "cf example create",
			options: [],
			handWritten: { dir: "example/create" },
		} as unknown as HandWrittenCommandMeta;
		expect(validateHandWrittenDryRunMetadata([command])).toEqual([
			"cf example create (example/create/meta.json) must declare exactly one boolean --dry-run option.",
		]);
	});
});
