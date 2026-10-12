import { describe, it } from "vite-plus/test";
import { mockConsoleMethods } from "../helpers/mock-console";
import { runWrangler } from "../helpers/run-wrangler";

describe("d1", () => {
	const std = mockConsoleMethods();

	it("should show help when the migrations command is passed", async ({
		expect,
	}) => {
		await runWrangler("d1 migrations");

		expect(std.out).toContain("cf d1 migrations");
		expect(std.out).toContain("create <message>");
		expect(std.out).toContain("list <database>");
		expect(std.out).toContain("apply <database>");
	});
});
