import { chmodSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vite-plus/test";
import {
	normalizeSpawnExit,
	shouldRelaySignal,
	spawnImpl,
} from "../../../commands/dev/spawn.js";
import type { DiscoveredImpl } from "../../../commands/dev/discover.js";
import type { KnownImpl } from "../../../commands/dev/known-impls.js";

/**
 * Subprocess tests for `spawnImpl`. We use a real shell fixture
 * (a temp file with a shebang) rather than mocking child_process,
 * because the function under test IS the subprocess plumbing — the
 * point is to verify it works against an actual process tree.
 *
 * Each test creates an executable bash script in a temp dir, builds a
 * `DiscoveredImpl` pointing at it, and asserts on `spawnImpl`'s
 * return value (the propagated exit code and termination signal).
 *
 * The fixtures intentionally use bash rather than Node — keeps them
 * tiny and avoids re-importing Node modules in a child process. These
 * integration fixtures are POSIX-only; the platform-independent exit
 * normalization is tested separately below.
 */
describe("spawnImpl", () => {
	function makeFakeImpl(script: string): DiscoveredImpl {
		const dir = mkdtempSync(join(tmpdir(), "cf-spawn-test-"));
		// The binary name is the impl's choice; we use a generic
		// placeholder for the test fixture since `spawnImpl`
		// doesn't care about the name (it just executes whatever
		// `discovered.binary` points at).
		const binPath = join(dir, "fake-impl");
		writeFileSync(binPath, `#!/usr/bin/env bash\n${script}\n`);
		chmodSync(binPath, 0o755);

		// We construct just enough of `DiscoveredImpl` for the function
		// under test. The fields it actually reads are `binary` and
		// (in the error path) `impl.pkg` + `impl.installHint`.
		const impl: KnownImpl = {
			ecosystem: "npm",
			pkg: "@cloudflare/vite-plugin",
			description: "Test fixture",
			manifest: "package.json",
			binary: () => binPath,
			installHint: "(test fixture)",
		};
		return { impl, binary: binPath, manifestPath: "(test)" };
	}

	it("returns 0 when the impl exits 0", async () => {
		const fake = makeFakeImpl(`exit 0`);
		const result = await spawnImpl(fake, "dev", []);
		expect(result).toEqual({ exitCode: 0 });
	});

	it("propagates a non-zero exit code from the impl", async () => {
		const fake = makeFakeImpl(`exit 42`);
		const result = await spawnImpl(fake, "dev", []);
		expect(result).toEqual({ exitCode: 42 });
	});

	it("forwards argv to the impl after the dev subcommand", async () => {
		// The fixture writes its argv to a file we read back. The first
		// arg is always `dev` (the subcommand discriminator cf inserts);
		// the rest come from the user.
		const argFile = join(mkdtempSync(join(tmpdir(), "cf-spawn-args-")), "argv");
		const fake = makeFakeImpl(
			`printf "%s\\n" "$@" > ${JSON.stringify(argFile)}`
		);

		await spawnImpl(fake, "dev", ["--port", "3000", "some-positional"]);

		const lines = readFileSync(argFile, "utf-8").trim().split("\n");
		expect(lines).toEqual(["dev", "--port", "3000", "some-positional"]);
	});

	it("marks the impl to use cf authentication", async () => {
		const authFile = join(
			mkdtempSync(join(tmpdir(), "cf-spawn-auth-")),
			"auth"
		);
		const fake = makeFakeImpl(
			`printf "%s" "$CLOUDFLARE_CF_AUTH" > ${JSON.stringify(authFile)}`
		);

		await spawnImpl(fake, "dev", []);

		expect(readFileSync(authFile, "utf-8")).toBe("true");
	});

	it("forces dev servers onto cf's registry", async () => {
		const envFile = join(mkdtempSync(join(tmpdir(), "cf-spawn-env-")), "env");
		const registryPath = join(tmpdir(), "cf-test-registry");
		const previousCloudflare = process.env.CLOUDFLARE_REGISTRY_PATH;
		process.env.CLOUDFLARE_REGISTRY_PATH = registryPath;

		try {
			const fake = makeFakeImpl(
				`printf "%s\\n%s\\n%s\\n" "$CLOUDFLARE_REGISTRY_PATH" "$WRANGLER_REGISTRY_PATH" "$MINIFLARE_REGISTRY_PATH" > ${JSON.stringify(envFile)}`
			);
			await spawnImpl(fake, "dev", []);

			expect(readFileSync(envFile, "utf8").trim().split("\n")).toEqual([
				registryPath,
				registryPath,
				registryPath,
			]);
		} finally {
			if (previousCloudflare === undefined) {
				delete process.env.CLOUDFLARE_REGISTRY_PATH;
			} else {
				process.env.CLOUDFLARE_REGISTRY_PATH = previousCloudflare;
			}
		}
	});

	it("throws when the impl has no resolved binary", async () => {
		const impl: KnownImpl = {
			ecosystem: "npm",
			pkg: "@cloudflare/vite-plugin",
			description: "Test fixture",
			manifest: "package.json",
			binary: () => null,
			installHint: "(test)",
		};
		const broken: DiscoveredImpl = {
			impl,
			binary: null,
			manifestPath: "(test)",
		};

		// The handler in commands/dev/index.ts pre-checks for a null
		// binary, but spawnImpl itself is documented to be safe to
		// call without re-deriving the precondition. The message
		// surfaces the install hint so the user has a recovery path.
		await expect(spawnImpl(broken, "dev", [])).rejects.toThrow(
			/binary not found/
		);
	});

	it("maps signal-killed exits to 128 + signal_number", async () => {
		// Bash propagates the parent's signal exit code via $? as
		// `128 + sig`, but here we want to verify cf maps a
		// child-exited-by-signal event to the same convention. We
		// simulate by having the impl kill itself with SIGTERM (15).
		// The expected exit code is 128 + 15 = 143.
		const fake = makeFakeImpl(`kill -TERM $$`);
		const result = await spawnImpl(fake, "dev", []);
		expect(result).toEqual({ exitCode: 143, signal: "SIGTERM" });
	});
});

describe("normalizeSpawnExit", () => {
	it.each([
		[0, null, undefined, { exitCode: 0 }],
		[null, "SIGINT", undefined, { exitCode: 130, signal: "SIGINT" }],
		[0, null, "SIGINT", { exitCode: 0, signal: "SIGINT" }],
		[null, "SIGTERM", undefined, { exitCode: 143, signal: "SIGTERM" }],
		[null, "SIGKILL", undefined, { exitCode: 137, signal: "SIGKILL" }],
		[null, "SIGKILL", "SIGINT", { exitCode: 137, signal: "SIGKILL" }],
	] as const)(
		"normalizes code %s, observed signal %s, and forwarded signal %s",
		(code, signal, forwardedSignal, expected) => {
			expect(normalizeSpawnExit(code, signal, forwardedSignal)).toEqual(
				expected
			);
		}
	);
});

describe("shouldRelaySignal", () => {
	it("does not resend Ctrl+C to a Windows child", () => {
		expect(shouldRelaySignal("SIGINT", "win32")).toBe(false);
		expect(shouldRelaySignal("SIGTERM", "win32")).toBe(true);
		expect(shouldRelaySignal("SIGINT", "linux")).toBe(true);
	});
});
