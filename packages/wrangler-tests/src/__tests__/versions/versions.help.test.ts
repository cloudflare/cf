import { describe, test } from "vitest";
import { mockConsoleMethods } from "../helpers/mock-console";
import { runWrangler } from "../helpers/run-wrangler";

describe("versions help", () => {
	const std = mockConsoleMethods();

	test("shows versions help w/ --help", async ({ expect }) => {
		await runWrangler("workers versions --help");
		expect(std.out).toContain("cf workers versions");
		expect(std.out).toContain("list");
		expect(std.out).toContain("get");
	});

	test("shows implicit subhelp", async ({ expect }) => {
		await runWrangler("workers versions");
		expect(std.out).toContain("cf workers versions");
	});
});
