import { describe, expect, expectTypeOf, it, vi } from "vite-plus/test";
import { apiCommand, apiGroup } from "../../lib/api-command.js";
import { commandParser } from "../helpers/command-parser.js";
import type { CommandModule } from "yargs";

describe("Stricli command boundary", () => {
	it("derives handler inputs from native parameters and dispatches the same native leaf through its group", async () => {
		const execute = vi.fn();
		const leaf = apiCommand({
			command: "list <bucket-id>",
			describe: "List items",
			usage: "",
			flags: {
				limit: {
					kind: "parsed",
					parse: Number,
					brief: "Limit",
					optional: true,
				},
				order: {
					kind: "enum",
					values: ["asc", "desc"],
					default: "asc",
					brief: "Order",
				},
				"dry-run": { kind: "boolean", default: false, brief: "Preview" },
				tags: {
					kind: "parsed",
					parse: String,
					variadic: true,
					optional: true,
					brief: "Tags",
				},
			},
			operands: [{ placeholder: "bucket-id", brief: "Bucket", parse: String }],
			async handler(argv) {
				expectTypeOf(argv.limit).toEqualTypeOf<number | undefined>();
				expectTypeOf(argv.order).toEqualTypeOf<"asc" | "desc">();
				expectTypeOf(argv.dryRun).toEqualTypeOf<boolean>();
				expectTypeOf(argv.tags).toEqualTypeOf<string[] | undefined>();
				expectTypeOf(argv.bucketId).toEqualTypeOf<string>();
				expectTypeOf<keyof typeof argv>().extract<"misspelled">().toBeNever();
				execute(argv);
			},
		});
		const group = apiGroup({
			command: "items",
			describe: "Items",
			routes: { list: leaf },
		});
		expect(group.routeMap().getRoutingTargetForInput("list")).toBe(
			leaf.native()
		);
		await commandParser(
			["items", "list", "a", "--tags", "one", "two", "--limit=4"],
			group
		).parse();
		expect(execute).toHaveBeenCalledWith(
			expect.objectContaining({
				bucketId: "a",
				order: "asc",
				dryRun: false,
				limit: 4,
				tags: ["one", "two"],
			})
		);
	});
	it("loads the generated handler only for execution", async () => {
		const execute = vi.fn(async () => {});
		const loader = vi.fn(async () => ({ default: execute }));
		const command = apiCommand({
			command: "list",
			describe: "List items",
			usage: "",
			flags: {
				order: {
					kind: "enum",
					brief: "Order",
					values: ["asc", "desc"],
					optional: true,
				},
			},
			operands: [],
			loader,
		});
		const parser = commandParser(["list"], command);
		await parser.getHelp();
		expect(await parser.complete(["list", "--order", "d"])).toContainEqual(
			expect.objectContaining({ completion: "desc" })
		);
		expect(loader).not.toHaveBeenCalled();
		await parser.parse();
		expect(loader).toHaveBeenCalledTimes(1);
		expect(execute).toHaveBeenCalledTimes(1);
	});
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
