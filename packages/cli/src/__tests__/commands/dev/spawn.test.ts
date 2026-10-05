import { chmodSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vite-plus/test";
import { findKnownImpl } from "../../../commands/dev/known-impls.js";
import {
	normalizeSpawnExit,
	shouldRelaySignal,
	spawnImpl,
} from "../../../commands/dev/spawn.js";
import type { DiscoveredImpl } from "../../../commands/dev/discover.js";
import type { KnownImpl } from "../../../commands/dev/known-impls.js";

describe("spawnImpl", () => {
	function makeFakeImpl(
		script: string,
		binaryName = "cf-wrangler.js"
	): DiscoveredImpl {
		const dir = mkdtempSync(join(tmpdir(), "cf spawn test "));
		const binPath = join(dir, binaryName);
		writeFileSync(binPath, `#!/usr/bin/env node\n${script}\n`);
		chmodSync(binPath, 0o755);

		const impl = findKnownImpl(
			binaryName === "cf-vite" ? "@cloudflare/vite-plugin" : "wrangler"
		);
		if (!impl) {
			throw new Error("Missing known Node delegate");
		}
		return { impl, binary: binPath, manifestPath: "(test)" };
	}

	it("returns 0 when the impl exits 0", async () => {
		const fake = makeFakeImpl("process.exit(0)");
		const result = await spawnImpl(fake, "dev", []);
		expect(result).toEqual({ exitCode: 0 });
	});

	it("propagates a non-zero exit code from the impl", async () => {
		const fake = makeFakeImpl("process.exit(42)");
		const result = await spawnImpl(fake, "dev", []);
		expect(result).toEqual({ exitCode: 42 });
	});

	it.each([
		["cf-wrangler.js", "dev"],
		["cf-wrangler.js", "build"],
		["cf-vite", "dev"],
		["cf-vite", "build"],
	] as const)(
		"forwards arguments to the %s Node delegate for %s without a shell",
		async (binaryName, verb) => {
			const argFile = join(
				mkdtempSync(join(tmpdir(), "cf-spawn-args-")),
				"argv"
			);
			const fake = makeFakeImpl(
				`require("node:fs").writeFileSync(${JSON.stringify(argFile)}, JSON.stringify(process.argv.slice(2)))`,
				binaryName
			);

			await spawnImpl(fake, verb, ["--label", "two words", "a&b"]);

			expect(JSON.parse(readFileSync(argFile, "utf-8"))).toEqual([
				verb,
				"--label",
				"two words",
				"a&b",
			]);
		}
	);

	it("marks the impl to use cf authentication", async () => {
		const authFile = join(
			mkdtempSync(join(tmpdir(), "cf-spawn-auth-")),
			"auth"
		);
		const fake = makeFakeImpl(
			`require("node:fs").writeFileSync(${JSON.stringify(authFile)}, process.env.CLOUDFLARE_CF_AUTH ?? "")`
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
				`require("node:fs").writeFileSync(${JSON.stringify(envFile)}, [process.env.CLOUDFLARE_REGISTRY_PATH, process.env.WRANGLER_REGISTRY_PATH, process.env.MINIFLARE_REGISTRY_PATH].join("\\n"))`
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

	it("reports a missing executable and restores signal listeners", async () => {
		const fake = makeFakeImpl("process.exit(0)");
		fake.binary = join(
			mkdtempSync(join(tmpdir(), "cf-missing-bin-")),
			"missing"
		);
		const sigintListeners = process.listenerCount("SIGINT");
		const sigtermListeners = process.listenerCount("SIGTERM");
		await expect(spawnImpl(fake, "dev", [])).rejects.toMatchObject({
			code: "ENOENT",
		});
		expect(process.listenerCount("SIGINT")).toBe(sigintListeners);
		expect(process.listenerCount("SIGTERM")).toBe(sigtermListeners);
	});

	it.skipIf(process.platform === "win32")(
		"maps signal-killed exits to 128 + signal_number",
		async () => {
			const fake = makeFakeImpl('process.kill(process.pid, "SIGTERM")');
			const result = await spawnImpl(fake, "dev", []);
			expect(result).toEqual({ exitCode: 143, signal: "SIGTERM" });
		}
	);
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
