import { runInTempDir } from "@cloudflare/workers-utils/test-helpers";
import { describe, expect, it } from "vite-plus/test";
import { captureOutput } from "../../helpers/capture-output.js";
import { runCf } from "../../helpers/run-cf.js";

describe("cf auth --profile help", () => {
	runInTempDir();

	it.each(["list", "logout"])(
		"does not advertise --profile in `cf auth %s --help`",
		async (command) => {
			const output = captureOutput();

			expect(await runCf(["auth", command, "--help"])).toEqual({
				exitCode: 0,
			});

			expect(output.stdout()).toContain(`cf auth ${command}`);
			expect(output.stdout()).not.toContain("--profile");
		}
	);

	it.each(["list", "logout"])(
		"still rejects --profile on `cf auth %s`",
		async (command) => {
			await expect(
				runCf(["auth", command, "--profile", "example"])
			).rejects.toThrow(/--profile flag cannot be used/);
		}
	);
});
