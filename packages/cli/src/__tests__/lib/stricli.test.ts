import { describe, expect, it, vi } from "vite-plus/test";
import { commandParser } from "../helpers/command-parser.js";
import type { CommandModule } from "yargs";

describe("Stricli command boundary", () => {
	const handler = vi.fn();
	const command: CommandModule = {
		command: "remove <id>",
		builder: (args) =>
			args
				.option("force", { type: "boolean", alias: "f" })
				.option("label", { type: "string" }),
		handler,
	};
	it("does not interpret an invalid confirmation as true", async () => {
		handler.mockClear();
		await expect(
			commandParser(["remove", "id", "--force=maybe"], command).parse()
		).rejects.toThrow("Expected true or false for --force");
		expect(handler).not.toHaveBeenCalled();
	});
	it("preserves grouped switches and an explicit dash-prefixed value", async () => {
		await expect(
			commandParser(["remove", "id", "-qf", "--label=--force"], command).parse()
		).resolves.toMatchObject({
			id: "id",
			quiet: true,
			force: true,
			label: "--force",
		});
	});
});
