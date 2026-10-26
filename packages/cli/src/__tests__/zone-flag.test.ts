import { runInTempDir } from "@cloudflare/workers-utils/test-helpers";
import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from "vite-plus/test";
import { captureOutput } from "./helpers/capture-output.js";
import { runCf } from "./helpers/run-cf.js";

describe("--zone global flag", () => {
	runInTempDir();

	const ENV = { CI: "true", CLOUDFLARE_ACCOUNT_ID: "account-id" };

	let output: ReturnType<typeof captureOutput>;

	beforeEach(() => {
		output = captureOutput();
	});

	afterEach(() => vi.restoreAllMocks());

	it("passes a zone name to zone-scoped commands", async () => {
		await runCf(
			["dns", "records", "list", "-z", "example.com", "--dry-run"],
			ENV
		);

		expect(output.stdout()).toContain("/zones/example.com/dns_records");
	});

	it.each([[["-z"]], [["--zone="]], [["--no-zone"]]])(
		"rejects %j without a value",
		async (flags) => {
			await expect(
				runCf(["dns", "records", "list", ...flags, "--dry-run"], ENV)
			).rejects.toThrow("--zone requires a non-empty value.");
			expect(output.stdout()).toBe("");
		}
	);

	it("rejects repeated values", async () => {
		await expect(
			runCf(
				[
					"dns",
					"records",
					"list",
					"--zone",
					"a.example.com",
					"--zone",
					"b.example.com",
					"--dry-run",
				],
				ENV
			)
		).rejects.toThrow("--zone can only be specified once.");
	});
});
