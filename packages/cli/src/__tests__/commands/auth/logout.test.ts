import { runInTempDir } from "@cloudflare/workers-utils/test-helpers";
import { describe, expect, it } from "vite-plus/test";
import { mockOutputStreams } from "../../helpers/capture-output.js";
import { runCf } from "../../helpers/run-cf.js";

describe("cf auth logout", () => {
	runInTempDir();
	const std = mockOutputStreams();

	it("explains how to log in when not logged in", async () => {
		await runCf(["auth", "logout"], { CLOUDFLARE_API_TOKEN: undefined });

		expect(std.out).toBe("");
		expect(std.err).toMatchInlineSnapshot(`
			"●  You are not currently logged in. To authenticate, run:

			   cf auth login"
		`);
	});

	it("points at the environment token when only that is set", async () => {
		await runCf(["auth", "logout"], { CLOUDFLARE_API_TOKEN: "env-token" });

		expect(std.out).toBe("");
		expect(std.err).toMatchInlineSnapshot(
			`"●  No cf OAuth credentials found, but CLOUDFLARE_API_TOKEN is set. Unset it to log out."`
		);
	});
});
