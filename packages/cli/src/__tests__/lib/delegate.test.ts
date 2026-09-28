import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { runInTempDir, seed } from "@cloudflare/workers-utils/test-helpers";
import { describe, expect, it } from "vitest";
import {
	maybeDelegateFromProcess,
	maybeDelegateToLocalInstall,
	resolveDelegateTarget,
} from "../../lib/delegate.js";

/**
 * Tests for Wrangler-2-style local-install delegation.
 *
 * Like `commands/dev/spawn.test.ts`, these use a real child process
 * (a seeded fake local cf install) rather than mocking child_process —
 * the whole point is that the global cf actually re-executes the local
 * copy. `runInTempDir()` gives each test a fresh cwd; `seed()` lays
 * down a `node_modules/cf` fixture whose `bin` is a tiny Node script we
 * control (exit code, argv capture, or self-signal).
 *
 * Resolution note: under vitest/vite, `require.resolve("cf/package.json")`
 * self-resolves to *this* package (`packages/cli/package.json`) when no
 * local fixture is present (real `node` throws instead — same net result
 * via the realpath self-check: resolved === own ⇒ no delegation). So the
 * "running install" is this package's own package.json, computed here as
 * `OWN_PKG`. A seeded fixture lives at a different realpath and therefore
 * triggers delegation.
 */

// packages/cli/package.json — the install these tests run as.
const OWN_PKG = fileURLToPath(
	new URL("../../../package.json", import.meta.url)
);

// The published binary a real user runs. Delegation is wired here (before
// the bundle loads); main() does NOT delegate, so bin/cf is the only entry
// that does — hence the end-to-end test below drives the real artifact.
const BIN = fileURLToPath(new URL("../../../bin/cf", import.meta.url));
// bin/cf imports `../dist/*.mjs`, so the e2e test only runs against a built
// dist. Skipped (not failed) otherwise — run `pnpm build` first.
const DIST_BUILT = existsSync(
	fileURLToPath(new URL("../../../dist/delegate.mjs", import.meta.url))
);

/**
 * Seed a fake project-local cf install in the current temp dir. The bin
 * is an ESM script (`type: "module"` + `.mjs`) so it runs cleanly under
 * `node <bin>` regardless of the host's default module type.
 */
async function seedLocalCf(opts: {
	version?: string;
	script: string;
}): Promise<void> {
	await seed({
		"node_modules/cf/package.json": JSON.stringify({
			name: "cf",
			version: opts.version ?? "9.9.9",
			type: "module",
			bin: { cf: "./bin/cf.mjs" },
			exports: {
				"./package.json": "./package.json",
			},
		}),
		"node_modules/cf/bin/cf.mjs": opts.script,
	});
}

describe("resolveDelegateTarget", () => {
	runInTempDir();

	it("returns a target when a different local cf is installed", async () => {
		await seedLocalCf({ version: "1.2.3", script: "process.exit(0)\n" });

		const target = resolveDelegateTarget({
			cwd: process.cwd(),
			ownPackageJsonPath: OWN_PKG,
			env: {},
		});

		expect(target).not.toBeNull();
		expect(target?.version).toBe("1.2.3");
		expect(target?.binPath).toMatch(/node_modules\/cf\/bin\/cf\.mjs$/);
	});

	it("returns null when the resolved install is the running install", () => {
		// No fixture: cf/package.json resolves back to OWN_PKG → same
		// realpath → we're already the pinned copy, nothing to delegate to.
		expect(
			resolveDelegateTarget({
				cwd: process.cwd(),
				ownPackageJsonPath: OWN_PKG,
				env: {},
			})
		).toBeNull();
	});

	it("returns null when the local install IS us (explicit same path)", async () => {
		await seedLocalCf({ script: "process.exit(0)\n" });
		const localPkg = resolve(process.cwd(), "node_modules/cf/package.json");

		expect(
			resolveDelegateTarget({
				cwd: process.cwd(),
				ownPackageJsonPath: localPkg,
				env: {},
			})
		).toBeNull();
	});

	it("returns null when the loop-guard sentinel is set", async () => {
		await seedLocalCf({ script: "process.exit(0)\n" });

		expect(
			resolveDelegateTarget({
				cwd: process.cwd(),
				ownPackageJsonPath: OWN_PKG,
				env: { CF_DELEGATION: "1" },
			})
		).toBeNull();
	});

	// Ephemeral one-shot execs (`npx cf@x`, `npx <url>`, `pnpm dlx cf@x`)
	// run from the package manager's throwaway cache. The user asked for
	// *that* copy, so cf must NOT delegate to a project-local pin — even
	// though one is present and would otherwise be the delegation target.
	// The running install is identified by its own package.json path,
	// which carries the manager's cache segment (`_npx` / `dlx`); the
	// synthesised paths below don't need to exist on disk.
	it("returns null when running from npm's _npx cache (npx cf@x / npx <url>)", async () => {
		await seedLocalCf({ version: "1.2.3", script: "process.exit(0)\n" });

		expect(
			resolveDelegateTarget({
				cwd: process.cwd(),
				ownPackageJsonPath:
					"/Users/x/.npm/_npx/0ba4002b88dd17fc/node_modules/cf/package.json",
				env: {},
			})
		).toBeNull();
	});

	it("returns null when running from pnpm's dlx temp dir (pnpm dlx / pnpx)", async () => {
		await seedLocalCf({ version: "1.2.3", script: "process.exit(0)\n" });

		expect(
			resolveDelegateTarget({
				cwd: process.cwd(),
				ownPackageJsonPath:
					"/Users/x/Library/pnpm/store/v3/tmp/dlx-39181/node_modules/cf/package.json",
				env: {},
			})
		).toBeNull();
	});

	it("returns null when running from pnpm's dlx cache dir", async () => {
		await seedLocalCf({ version: "1.2.3", script: "process.exit(0)\n" });

		expect(
			resolveDelegateTarget({
				cwd: process.cwd(),
				ownPackageJsonPath:
					"/Users/x/Library/Caches/pnpm/dlx/deadbeefdeadbeef/node_modules/cf/package.json",
				env: {},
			})
		).toBeNull();
	});

	it("still delegates for a normal global install path", async () => {
		await seedLocalCf({ version: "1.2.3", script: "process.exit(0)\n" });

		const target = resolveDelegateTarget({
			cwd: process.cwd(),
			ownPackageJsonPath: "/usr/local/lib/node_modules/cf/package.json",
			env: {},
		});

		expect(target).not.toBeNull();
		expect(target?.version).toBe("1.2.3");
	});

	it("matches the exec-cache token only as a full path segment", async () => {
		// A directory whose name merely *contains* "dlx" as a substring
		// (here the segment `sandlx`) must not be mistaken for a pnpm dlx
		// cache — the token has to be its own path segment.
		await seedLocalCf({ version: "1.2.3", script: "process.exit(0)\n" });

		const target = resolveDelegateTarget({
			cwd: process.cwd(),
			ownPackageJsonPath: "/Users/x/code/sandlx/node_modules/cf/package.json",
			env: {},
		});

		expect(target).not.toBeNull();
		expect(target?.version).toBe("1.2.3");
	});

	it("supports a bare-string bin field", async () => {
		await seed({
			"node_modules/cf/package.json": JSON.stringify({
				name: "cf",
				version: "2.0.0",
				type: "module",
				bin: "./bin/cf.mjs",
			}),
			"node_modules/cf/bin/cf.mjs": "process.exit(0)\n",
		});

		const target = resolveDelegateTarget({
			cwd: process.cwd(),
			ownPackageJsonPath: OWN_PKG,
			env: {},
		});
		expect(target?.binPath).toMatch(/node_modules\/cf\/bin\/cf\.mjs$/);
	});
});

describe("maybeDelegateToLocalInstall", () => {
	runInTempDir();

	it("does not delegate when there is no local cf", async () => {
		const result = await maybeDelegateToLocalInstall({
			cwd: process.cwd(),
			argv: [],
			env: {},
			ownPackageJsonPath: OWN_PKG,
		});
		expect(result).toEqual({ delegated: false });
	});

	it("spawns the local cf and propagates its exit code", async () => {
		await seedLocalCf({ script: "process.exit(7)\n" });

		const result = await maybeDelegateToLocalInstall({
			cwd: process.cwd(),
			argv: ["kv", "namespaces", "list"],
			env: process.env,
			ownPackageJsonPath: OWN_PKG,
		});

		expect(result.delegated).toBe(true);
		expect(result.exitCode).toBe(7);
	});

	it("forwards argv verbatim to the local cf", async () => {
		await seedLocalCf({
			script:
				`import { writeFileSync } from "node:fs";\n` +
				`writeFileSync("delegated-argv.json", JSON.stringify(process.argv.slice(2)));\n` +
				`process.exit(0)\n`,
		});

		const result = await maybeDelegateToLocalInstall({
			cwd: process.cwd(),
			argv: ["dns", "records", "list", "--zone", "example.com"],
			env: process.env,
			ownPackageJsonPath: OWN_PKG,
		});

		expect(result.exitCode).toBe(0);
		const recorded = JSON.parse(
			readFileSync(resolve(process.cwd(), "delegated-argv.json"), "utf-8")
		);
		expect(recorded).toEqual([
			"dns",
			"records",
			"list",
			"--zone",
			"example.com",
		]);
	});

	it("marks the delegated child with the CF_DELEGATION sentinel", async () => {
		// The child records the sentinel the parent injected; the banner
		// reads the same var to show its "this project's pinned cf" line,
		// and the child's own loop guard reads it to refuse re-delegation.
		await seedLocalCf({
			script:
				`import { writeFileSync } from "node:fs";\n` +
				`writeFileSync("delegation.txt", String(process.env.CF_DELEGATION ?? ""));\n` +
				`process.exit(0)\n`,
		});

		const result = await maybeDelegateToLocalInstall({
			cwd: process.cwd(),
			argv: [],
			env: process.env,
			ownPackageJsonPath: OWN_PKG,
		});

		expect(result.delegated).toBe(true);
		expect(
			readFileSync(resolve(process.cwd(), "delegation.txt"), "utf-8")
		).toBe("1");
	});

	it("maps a signal-killed local cf to 128 + signal number", async () => {
		await seedLocalCf({
			// Keep the event loop alive so the self-sent SIGTERM is what
			// terminates the process (exit code 128 + 15 = 143).
			script:
				`setTimeout(() => process.exit(0), 100000);\n` +
				`process.kill(process.pid, "SIGTERM");\n`,
		});

		const result = await maybeDelegateToLocalInstall({
			cwd: process.cwd(),
			argv: [],
			env: process.env,
			ownPackageJsonPath: OWN_PKG,
		});

		expect(result.exitCode).toBe(143);
	});

	it("does not delegate when the loop-guard sentinel is set", async () => {
		await seedLocalCf({ script: "process.exit(5)\n" });

		const result = await maybeDelegateToLocalInstall({
			cwd: process.cwd(),
			argv: [],
			env: { CF_DELEGATION: "1" },
			ownPackageJsonPath: OWN_PKG,
		});
		expect(result).toEqual({ delegated: false });
	});
});

describe("maybeDelegateFromProcess", () => {
	runInTempDir();

	it("skips delegation for the shell-completion callback", async () => {
		// A fixture is present and would otherwise be delegated to, but the
		// completion path must opt out (stays fast, stdout stays parseable).
		await seedLocalCf({ script: "process.exit(1)\n" });
		const original = process.argv;
		process.argv = ["node", "cf", "complete", "--", "kv"];
		try {
			expect(await maybeDelegateFromProcess()).toEqual({ delegated: false });
		} finally {
			process.argv = original;
		}
	});

	it("delegates a normal command read from process.argv", async () => {
		await seedLocalCf({ script: "process.exit(8)\n" });
		const original = process.argv;
		process.argv = ["node", "cf", "kv", "namespaces", "list", "--quiet"];
		try {
			const result = await maybeDelegateFromProcess();
			expect(result.delegated).toBe(true);
			expect(result.exitCode).toBe(8);
		} finally {
			process.argv = original;
		}
	});
});

describe("delegation through the built bin/cf", () => {
	runInTempDir();

	// Spawns the actual published entry — `node bin/cf` — the way an
	// installed user runs it, in a temp project that pins a fake local cf.
	// bin/cf must re-exec that pin (before importing its own bundle) and
	// propagate its exit code. This is the one test that proves the real
	// artifact is wired up; everything else above unit-tests the functions
	// directly. Requires a built dist (see DIST_BUILT).
	it.skipIf(!DIST_BUILT)(
		"re-execs a project-local pin and propagates its exit code",
		async () => {
			await seedLocalCf({ script: "process.exit(19)\n" });

			const result = spawnSync(process.execPath, [BIN, "--version"], {
				cwd: process.cwd(),
				encoding: "utf8",
			});

			expect(result.status).toBe(19);
		}
	);
});
