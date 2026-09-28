import { runInTempDir } from "@cloudflare/workers-utils/test-helpers";
import { describe, expect, it } from "vitest";
import { runCf } from "./helpers/run-cf.js";

/**
 * Integration tests for the `--local` / `--persist-to` global flags,
 * exercised via a real `runMain` invocation.
 *
 * `--local` stands on its own now — there is no endpoint to supply,
 * because cf spawns its own Miniflare. Dispatch (and therefore workerd)
 * is covered in `lib/local-e2e.test.ts`; nothing here gets that far.
 */
describe("--local flag middleware", () => {
	// Isolate cf's global config dir (HOME / XDG_CONFIG_HOME) so a
	// developer's stored OAuth token doesn't authenticate the
	// "unset --local" case below and turn its expected rejection into a
	// success. Also gives each test a scratch cwd for `--persist-to` to
	// resolve against.
	runInTempDir();

	it("accepts --local --dry-run without starting Miniflare", async () => {
		await expect(
			runCf(["zones", "list", "--local", "--persist-to", "state", "--dry-run"])
		).resolves.toEqual({ exitCode: 0 });
	});

	it("rejects the removed --local-endpoint flag", async () => {
		await expect(
			runCf([
				"zones",
				"list",
				"--local",
				"--local-endpoint",
				"http://127.0.0.1:8787",
			])
		).rejects.toThrow(/Unknown argument/);
	});

	it("rejects --persist-to without --local", async () => {
		await expect(
			runCf(["zones", "list", "--persist-to", "state"])
		).rejects.toThrow(/--persist-to can only be used with --local/);
	});

	it("rejects an empty --persist-to value", async () => {
		await expect(
			runCf(["zones", "list", "--local", "--persist-to", "", "--dry-run"])
		).rejects.toThrow(/--persist-to requires a non-empty directory/);
	});

	it.each([
		["root", ["--local", "--help"]],
		["hand-written command", ["auth", "--local", "--help"]],
	] as const)("allows --local with %s help", async (_name, args) => {
		await expect(runCf([...args])).resolves.toEqual({ exitCode: 0 });
	});

	it.each([
		["auth", ["auth", "whoami"]],
		["login", ["login"]],
		["build", ["build"]],
		["complete", ["complete"]],
		["deploy", ["deploy"]],
		["dev", ["dev"]],
		["schema", ["schema"]],
		["tools", ["tools"]],
	] as const)(
		"rejects --local for the hand-written %s root",
		async (command, args) => {
			await expect(runCf([...args, "--local"])).rejects.toThrow(
				`--local is not supported by cf ${command}.`
			);
		}
	);

	it.each(["--local=false", "--no-local"])(
		"rejects explicit %s for cf dev",
		async (flag) => {
			await expect(runCf(["dev", flag])).rejects.toThrow(
				"--local is not supported by cf dev."
			);
		}
	);

	it("leaves unknown commands with --local to yargs", async () => {
		await expect(runCf(["typoo", "--local"])).rejects.toThrow(
			"Unknown command: typoo"
		);
	});

	it("allows --no-local for hand-written commands other than dev", async () => {
		await expect(runCf(["schema", "ai", "run", "--no-local"])).resolves.toEqual(
			{ exitCode: 0 }
		);
	});
});
