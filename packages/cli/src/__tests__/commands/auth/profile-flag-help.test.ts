import { runInTempDir } from "@cloudflare/workers-utils/test-helpers";
import { describe, expect, it } from "vite-plus/test";
import { mockOutputStreams } from "../../helpers/capture-output.js";
import { runCf } from "../../helpers/run-cf.js";

// cloudflare/cf#687: `cf auth list` and `cf auth logout` reject `--profile`,
// so their help must not advertise it as an accepted option.
describe("--profile in help for auth commands that reject it", () => {
	runInTempDir();
	const std = mockOutputStreams();

	it.each([
		["list", "The --profile flag cannot be used with `cf auth list`."],
		["logout", "The --profile flag cannot be used with `cf auth logout`."],
	])("cf auth %s rejects --profile", async (command, message) => {
		await expect(
			runCf(["auth", command, "--profile", "example"], {
				CLOUDFLARE_API_TOKEN: undefined,
			})
		).rejects.toThrow(message);
	});

	it.each(["list", "logout"])(
		"cf auth %s --help does not advertise --profile",
		async (command) => {
			await expect(
				runCf(["auth", command, "--help"], {
					CLOUDFLARE_API_TOKEN: undefined,
				})
			).resolves.toEqual({ exitCode: 0 });

			expect(std.out).toContain(`cf auth ${command}`);
			expect(std.out).not.toContain("--profile");
			expect(std.out).not.toContain("Use a specific auth profile");
		}
	);
});
