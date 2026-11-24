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
		).resolves.toMatchObject({ force: false });
		expect(handler).toHaveBeenCalledWith(
			expect.objectContaining({ force: false })
		);
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
	it("binds camel-case command operands to the declared kebab-case positional", async () => {
		await expect(
			commandParser(["get", "example"], {
				command: "get <resourceId>",
				builder: (args) => args.positional("resource-id", { type: "string" }),
				handler,
			}).parse()
		).resolves.toMatchObject({
			resourceId: "example",
			"resource-id": "example",
		});
	});
	it("distinguishes omitted, empty and malformed numeric values", async () => {
		await expect(
			commandParser(
				["--count", "2", "get", "--count", "--count=", "--count=bad"],
				{
					command: "get",
					builder: (args) => args.option("count", { type: "number" }),
					handler,
				}
			).parse()
		).resolves.toMatchObject({ count: [2, undefined, 0, NaN] });
	});
});
