import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import * as clack from "@clack/prompts";
import {
	mockConsoleMethods,
	runInTempDir,
	seed,
} from "@cloudflare/workers-utils/test-helpers";
import { x } from "tinyexec";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import {
	normalizeProjectCommandExit,
	runProjectCommand,
	shouldRelayProjectCommandSignal,
} from "../../../lib/autoconfig.js";
import { makeExecutable, nodeScript } from "../../helpers/executable.js";
import { runCf } from "../../helpers/run-cf.js";

vi.mock("tinyexec", { spy: true });

/**
 * Integration tests for `cf dev`. We drive the command through
 * `runCf(["dev", ...])` so the full yargs → handler → discover →
 * spawn pipeline is exercised end-to-end, just inside the same
 * process.
 *
 * Each test sets up a tmp project (manifests + optional fake
 * `node_modules/<impl>/bin/<impl-binary>` fixture), invokes the command, and
 * asserts on:
 *   - the exit code
 *   - the captured stderr / stdout
 *
 * `mockConsoleMethods()` captures `console.log` / `console.error` so
 * we can assert against `std.err` / `std.out`. `runInTempDir()`
 * creates a fresh cwd per test.
 */
describe("cf dev", () => {
	runInTempDir();
	const std = mockConsoleMethods();
	afterEach(() => vi.restoreAllMocks());

	describe("no impl declared", () => {
		it("errors with install hints and exits 1 when no manifest exists", async () => {
			const result = await runCf(["dev"]);

			expect(result.exitCode).toBe(1);
			expect(std.err).toMatch(/No Cloudflare dev server is installed/);
			// Should list every known impl as an install option.
			expect(std.err).toMatch(/@cloudflare\/vite-plugin/);
			expect(std.err).toMatch(/wrangler/);
			expect(std.err).toMatch(/cloudflare-py-dev-server/);
			expect(std.err).toMatch(/cloudflare-rs-dev-server/);
			// And surface install commands.
			expect(std.err).toMatch(/npm install --save-dev/);
			expect(std.err).toMatch(/pip install/);
			expect(std.err).toMatch(/cargo install/);
		});

		it("errors with install hints when package.json declares nothing relevant", async () => {
			await seed({
				"package.json": JSON.stringify({
					devDependencies: { "some-unrelated": "^1.0.0" },
				}),
			});

			const result = await runCf(["dev"]);
			expect(result.exitCode).toBe(1);
			expect(std.err).toMatch(/No Cloudflare dev server is installed/);
		});
	});

	describe("multiple impls declared", () => {
		it("errors when two ecosystems each declare an impl", async () => {
			await seed({
				"Cargo.toml": '[dependencies]\ncloudflare-rs-dev-server = "0.1"\n',
				"pyproject.toml": [
					"[project]",
					'name = "x"',
					'dependencies = ["cloudflare-py-dev-server"]',
					"",
				].join("\n"),
			});

			const result = await runCf(["dev"]);
			expect(result.exitCode).toBe(1);
			expect(std.err).toMatch(
				/Multiple Cloudflare dev-server implementations are configured/
			);
			expect(std.err).toMatch(/cloudflare-rs-dev-server/);
			expect(std.err).toMatch(/cloudflare-py-dev-server/);
			expect(std.err).toMatch(/A project can only use one dev-server/);
		});

		it("does not treat wrangler fallback as a second impl", async () => {
			await seed({
				"package.json": JSON.stringify({
					devDependencies: {
						"@cloudflare/vite-plugin": "beta",
						wrangler: "^4.0.0",
					},
				}),
			});

			await expect(runCf(["dev"])).rejects.toThrow("is not installed");
			expect(std.err).not.toMatch(/Multiple Cloudflare dev-server/);
			expect(unframe(std.err)).toMatch(
				/@cloudflare\/vite-plugin .* is not installed/
			);
		});
	});

	describe("declared but not installed", () => {
		it("surfaces an install hint specific to the declared impl", async () => {
			await seed({
				"package.json": JSON.stringify({
					devDependencies: { "@cloudflare/vite-plugin": "beta" },
				}),
				// No node_modules: declared but not installed.
			});

			await expect(runCf(["dev"])).rejects.toThrow("is not installed");
			expect(unframe(std.err)).toMatch(
				/@cloudflare\/vite-plugin .* is not installed/
			);
			expect(std.err).toMatch(
				/npm install --save-dev @cloudflare\/vite-plugin@beta/
			);
		});

		it("surfaces a Vite install hint when the plugin is installed without Vite", async () => {
			await seed({
				"package.json": JSON.stringify({
					devDependencies: { "@cloudflare/vite-plugin": "beta" },
				}),
				"node_modules/@cloudflare/vite-plugin/package.json": JSON.stringify({
					name: "@cloudflare/vite-plugin",
					version: "2.0.0-beta.v.13",
				}),
			});

			await expect(runCf(["dev"])).rejects.toThrow(
				"executable could not be found"
			);
			expect(unframe(std.err)).toMatch(/vite executable could not be found/);
			expect(unframe(std.err)).toMatch(
				/npm install --save-dev @cloudflare\/vite-plugin@beta vite/
			);
			expect(std.err).toMatch(/@cloudflare\/vite-plugin v2 beta/);
			expect(unframe(std.err)).toContain("cf dev");
			expect(unframe(std.err)).toContain("cf build");
			expect(unframe(std.err)).toContain("cf deploy");
			expect(unframe(std.err)).toContain("cf previews deploy");
			expect(unframe(std.err)).not.toMatch(
				/@cloudflare\/vite-plugin .* is not installed/
			);
		});

		it("surfaces the wrangler minimum version when the delegate is missing", async () => {
			await seed({
				"package.json": JSON.stringify({
					devDependencies: { wrangler: "^4.101.0" },
				}),
				"node_modules/wrangler/package.json": JSON.stringify({
					name: "wrangler",
					version: "4.101.0",
				}),
			});

			const result = await runCf(["dev"]);
			expect(result.exitCode).toBe(1);
			expect(unframe(std.err)).toMatch(/does not include the cf delegate/);
			expect(std.err).toMatch(/wrangler@4\.161\.0 or newer/);
			expect(unframe(std.err)).not.toMatch(/wrangler .* is not installed/);
		});

		it("surfaces the cargo hint when the rust impl is declared but missing", async () => {
			await seed({
				"Cargo.toml": [
					"[package]",
					'name = "my-worker"',
					"",
					"[dependencies]",
					'cloudflare-rs-dev-server = "0.1"',
					"",
				].join("\n"),
			});

			const result = await runCf(["dev"]);
			expect(result.exitCode).toBe(1);
			expect(unframe(std.err)).toMatch(
				/cloudflare-rs-dev-server .* is not installed/
			);
			expect(std.err).toMatch(/cargo install cloudflare-rs-dev-server/);
		});
	});

	describe.each([
		{
			name: "@cloudflare/vite-plugin",
			version: "2.0.0-beta.v.12",
			minimum: "2.0.0-beta.v.13",
			bin: "bin/cf-vite",
			install: "npm install --save-dev @cloudflare/vite-plugin@beta",
		},
		{
			name: "wrangler",
			version: "4.160.1",
			minimum: "4.161.0",
			bin: "bin/cf-wrangler.js",
			install: "npm install --save-dev wrangler@latest",
		},
	])(
		"$name profile compatibility",
		({ name, version, minimum, bin, install }) => {
			it.each([
				{ command: "dev", profile: undefined },
				{ command: "dev", profile: "work" },
				{ command: "build", profile: undefined },
				{ command: "build", profile: "work" },
			])(
				"rejects $command with profile $profile before starting an older delegate",
				async ({ command, profile }) => {
					const executable = `node_modules/${name}/${bin}`;
					await seed({
						"package.json": JSON.stringify({
							devDependencies: { [name]: version },
						}),
						[`node_modules/${name}/package.json`]: JSON.stringify({
							name,
							version,
						}),
						[executable]: nodeScript(
							'require("node:fs").writeFileSync("delegate-started.out", "started");'
						),
					});
					makeExecutable(executable);

					const result = await runCf([
						command,
						...(profile ? ["--profile", profile] : []),
					]);

					expect(result.exitCode).toBe(1);
					expect(unframe(std.err)).toContain(`${name}@${version} is installed`);
					expect(unframe(std.err)).toContain(minimum);
					expect(std.err).toContain(install);
					expect(existsSync("delegate-started.out")).toBe(false);
				}
			);
		}
	);

	describe.each([
		{
			name: "@cloudflare/vite-plugin",
			version: "2.0.0-beta.v.13",
			bin: "bin/cf-vite",
		},
		{ name: "wrangler", version: "4.161.0", bin: "bin/cf-wrangler.js" },
	])("$name auth profiles", ({ name, version, bin }) => {
		it.each([
			{ profile: "work", inherited: "personal", expected: "work" },
			{ profile: "default", inherited: "work", expected: "default" },
			{ profile: undefined, inherited: "work", expected: "work" },
			{ profile: undefined, inherited: undefined, expected: null },
		])(
			"passes profile $profile with inherited profile $inherited through the environment",
			async ({ profile, inherited, expected }) => {
				const executable = `node_modules/${name}/${bin}`;
				await seed({
					"package.json": JSON.stringify({
						devDependencies: { [name]: version },
					}),
					[`node_modules/${name}/package.json`]: JSON.stringify({
						name,
						version,
					}),
					[executable]: nodeScript(
						'require("node:fs").writeFileSync("profile.out", JSON.stringify({ argv: process.argv.slice(2), profile: process.env.CLOUDFLARE_AUTH_PROFILE ?? null }));'
					),
				});
				makeExecutable(executable);

				const result = await runCf(
					["dev", ...(profile ? ["--profile", profile] : []), "--port", "3000"],
					{ CLOUDFLARE_AUTH_PROFILE: inherited }
				);

				expect(result.exitCode).toBe(0);
				expect(JSON.parse(readFileSync("profile.out", "utf8"))).toEqual({
					argv: ["dev", "--port", "3000"],
					profile: expected,
				});
				expect(process.env.CLOUDFLARE_AUTH_PROFILE).toBe(inherited);
			}
		);
	});

	describe("happy path", () => {
		it("rejects an installed Vite plugin v1", async () => {
			await seed({
				"package.json": JSON.stringify({
					devDependencies: { "@cloudflare/vite-plugin": "1.61.0" },
				}),
				"node_modules/@cloudflare/vite-plugin/package.json": JSON.stringify({
					name: "@cloudflare/vite-plugin",
					version: "1.61.0",
				}),
				"cloudflare.config.ts": "export default {};",
				"node_modules/vite/package.json": JSON.stringify({
					name: "vite",
					version: "8.1.0",
					bin: { vite: "bin/vite.js" },
				}),
				"node_modules/vite/bin/vite.js": nodeScript("process.exit(0);"),
			});
			makeExecutable("node_modules/vite/bin/vite.js");

			await expect(runCf(["dev"])).rejects.toThrow(
				"cf requires @cloudflare/vite-plugin v2 beta"
			);

			expect(std.err).toMatch(/@cloudflare\/vite-plugin v2 beta/);
			expect(std.err).toMatch(/@cloudflare\/vite-plugin@1\.61\.0 is installed/);
			expect(unframe(std.err)).toContain("cf dev");
			expect(unframe(std.err)).toContain("cf build");
			expect(unframe(std.err)).toContain("cf deploy");
			expect(unframe(std.err)).toContain("cf previews deploy");
		});

		it("runs the detected framework dev command", async () => {
			await seed({
				"cloudflare.config.ts": "export default {};",
				"package.json": JSON.stringify({
					name: "astro-project",
					dependencies: { astro: "^5.0.0" },
				}),
				"package-lock.json": "{}",
				"node_modules/astro/package.json": JSON.stringify({
					name: "astro",
					version: "5.0.0",
				}),
				"node_modules/.bin/astro": nodeScript(
					'require("node:fs").writeFileSync("astro-argv.out", process.argv.slice(2).join("\\n") + "\\n");'
				),
			});
			makeExecutable("node_modules/.bin/astro", { npmBin: true });

			const result = await runCf(["dev", "--mode", "staging"]);

			expect(result.exitCode).toBe(0);
			expect(
				readFileSync(resolve(process.cwd(), "astro-argv.out"), "utf8")
					.trim()
					.split("\n")
			).toEqual(["dev", "--mode", "staging"]);
			// The dev server owns the terminal, stdout included.
			expect(vi.mocked(x).mock.lastCall?.[2]?.nodeOptions?.stdio).toEqual([
				"inherit",
				"inherit",
				"inherit",
			]);
		});

		it.each([
			{
				label: "port and host",
				args: ["--port", "8787", "--host", "127.0.0.1"],
				expected: ["--port", "8787", "--host", "127.0.0.1"],
			},
			{
				label: "equals-form options",
				args: ["--port=8788", "--host=::1"],
				expected: ["--port=8788", "--host=::1"],
			},
			{
				label: "host without an address",
				args: ["--host"],
				expected: ["--host"],
			},
			{
				label: "numeric-looking values",
				args: ["--port", "08080", "--id", "9007199254740993", "1e3"],
				expected: ["--port", "08080", "--id", "9007199254740993", "1e3"],
			},
			{
				label: "arguments after the separator",
				args: ["--", "--port", "8789", "--config", "vite config & extra.ts"],
				expected: ["--port", "8789", "--config", "vite config & extra.ts"],
			},
		])(
			"forwards $label to the detected Vite command",
			async ({ args, expected }) => {
				await seed({
					"cloudflare.config.ts": "export default {};",
					"package.json": JSON.stringify({
						name: "vite-project",
						devDependencies: {
							vite: "^7.0.0",
							"@cloudflare/vite-plugin": "beta",
						},
					}),
					"package-lock.json": "{}",
					"node_modules/vite/package.json": JSON.stringify({
						name: "vite",
						version: "7.0.0",
					}),
					"node_modules/.bin/vite": nodeScript(
						'require("node:fs").writeFileSync("vite-argv.json", JSON.stringify(process.argv.slice(2)));'
					),
				});
				makeExecutable("node_modules/.bin/vite", { npmBin: true });

				const result = await runCf(["dev", "--mode", "staging", ...args]);

				expect(result.exitCode).toBe(0);
				expect(JSON.parse(readFileSync("vite-argv.json", "utf8"))).toEqual([
					"--mode",
					"staging",
					...expected,
				]);
			}
		);

		it.each([{ separator: [] }, { separator: ["--"] }])(
			"forwards arguments when Vite has a dev script with separator $separator",
			async ({ separator }) => {
				await seed({
					"cloudflare.config.ts": "export default {};",
					"package.json": JSON.stringify({
						name: "vite-project",
						scripts: { dev: "vite --clearScreen false" },
						devDependencies: { vite: "^7.0.0" },
					}),
					"package-lock.json": "{}",
					"node_modules/vite/package.json": JSON.stringify({
						name: "vite",
						version: "7.0.0",
					}),
					"node_modules/.bin/vite": nodeScript(
						'require("node:fs").writeFileSync("vite-argv.json", JSON.stringify(process.argv.slice(2)));'
					),
				});
				makeExecutable("node_modules/.bin/vite", { npmBin: true });

				const args = ["--port", "8787", "--host", "127.0.0.1"];
				const result = await runCf([
					"dev",
					"--mode",
					"staging",
					...separator,
					...args,
				]);

				expect(result.exitCode).toBe(0);
				expect(JSON.parse(readFileSync("vite-argv.json", "utf8"))).toEqual([
					"--mode",
					"staging",
					...args,
				]);
			}
		);

		it("runs Vite for a Next.js project with vinext installed", async () => {
			await seed({
				"package.json": JSON.stringify({
					name: "vinext-project",
					dependencies: {
						next: "^16.0.0",
						vinext: "^0.0.1",
					},
				}),
				"package-lock.json": "{}",
				"node_modules/next/package.json": JSON.stringify({
					name: "next",
					version: "16.0.0",
				}),
				"node_modules/vinext/package.json": JSON.stringify({
					name: "vinext",
					version: "0.0.1",
				}),
				"node_modules/.bin/vite": nodeScript(
					'require("node:fs").writeFileSync("vite-argv.out", [...process.argv.slice(2), process.env.CLOUDFLARE_VITE_FORCE_BUILD_OUTPUT, process.env.CLOUDFLARE_AUTH_PROFILE].join("\\n") + "\\n");'
				),
			});
			makeExecutable("node_modules/.bin/vite", { npmBin: true });

			const result = await runCf(
				[
					"dev",
					"--mode",
					"staging",
					"--port",
					"8790",
					"--host",
					"127.0.0.1",
					"--profile",
					"work",
				],
				{ CLOUDFLARE_AUTH_PROFILE: "personal" }
			);

			expect(result.exitCode).toBe(0);
			expect(
				readFileSync(resolve(process.cwd(), "vite-argv.out"), "utf8")
					.trim()
					.split("\n")
			).toEqual([
				"dev",
				"--mode",
				"staging",
				"--port",
				"8790",
				"--host",
				"127.0.0.1",
				"true",
				"work",
			]);
			expect(process.env.CLOUDFLARE_AUTH_PROFILE).toBe("personal");
		});

		it("does not treat an undeclared vinext installation (installed but not present in the project's manifest) as a vinext project", async () => {
			await seed({
				"cloudflare.config.ts": "export default {};",
				"package.json": JSON.stringify({
					name: "next-project",
					dependencies: { next: "^16.0.0" },
				}),
				"package-lock.json": "{}",
				"node_modules/next/package.json": JSON.stringify({
					name: "next",
					version: "16.0.0",
				}),
				"node_modules/vinext/package.json": JSON.stringify({
					name: "vinext",
					version: "0.0.1",
				}),
				"node_modules/.bin/next": nodeScript(
					'require("node:fs").writeFileSync("selected-command.out", "next");'
				),
			});
			makeExecutable("node_modules/.bin/next", { npmBin: true });

			const result = await runCf(["dev"]);

			expect(result.exitCode).toBe(0);
			expect(
				readFileSync(resolve(process.cwd(), "selected-command.out"), "utf8")
			).toBe("next");
		});

		it("rejects mode when the detected framework does not support it", async () => {
			await seed({
				"cloudflare.config.ts": "export default {};",
				"package.json": JSON.stringify({
					name: "angular-project",
					dependencies: {
						"@angular/cli": "^22.0.0",
						"@angular/core": "^22.0.0",
					},
				}),
				"package-lock.json": "{}",
				"node_modules/@angular/core/package.json": JSON.stringify({
					name: "@angular/core",
					version: "22.0.0",
				}),
			});

			await expect(runCf(["dev", "--mode", "staging"])).rejects.toThrow(
				"The detected command `ng serve` does not currently support `--mode`."
			);
		});

		it.each([false, true])(
			"inherits registry settings for a detected Vite dev command (configured: %s)",
			async (configured) => {
				const logMessage = vi
					.spyOn(clack.log, "message")
					.mockImplementation(() => {});
				const registryEnv = {
					CLOUDFLARE_DEV_REGISTRY_PATH: configured
						? "canonical registry"
						: undefined,
					CLOUDFLARE_REGISTRY_PATH: configured
						? "legacy cf registry"
						: undefined,
					WRANGLER_REGISTRY_PATH: configured ? "wrangler registry" : undefined,
					MINIFLARE_REGISTRY_PATH: configured
						? "legacy miniflare registry"
						: undefined,
				};
				for (const [name, value] of Object.entries(registryEnv)) {
					vi.stubEnv(name, value);
				}
				vi.stubEnv("DEBUG", "");
				await seed({
					"cloudflare.config.ts": "export default {};",
					"package.json": JSON.stringify({
						name: "vite-project",
						dependencies: { vite: "^7.0.0" },
					}),
					"package-lock.json": "{}",
					"node_modules/vite/package.json": JSON.stringify({
						name: "vite",
						version: "7.0.0",
					}),
					"node_modules/.bin/vite": nodeScript(
						`require("node:fs").writeFileSync("env.out", JSON.stringify(["CLOUDFLARE_VITE_FORCE_BUILD_OUTPUT", ...${JSON.stringify(Object.keys(registryEnv))}].map(name => process.env[name])));`
					),
				});
				makeExecutable("node_modules/.bin/vite", { npmBin: true });

				const result = await runCf(["dev"]);

				expect(result.exitCode).toBe(0);
				expect(logMessage).toHaveBeenCalledWith("Delegating to vite", {
					output: process.stderr,
					spacing: 0,
				});
				expect(JSON.parse(readFileSync("env.out", "utf8"))).toEqual([
					"true",
					...Object.values(registryEnv).map((value) => value ?? null),
				]);
			}
		);

		it("formats delegation without environment overrides", async () => {
			const logMessage = vi
				.spyOn(clack.log, "message")
				.mockImplementation(() => {});

			expect(await runProjectCommand('node -e ""', process.cwd())).toEqual({
				exitCode: 0,
			});
			expect(logMessage).toHaveBeenCalledWith('Delegating to node -e ""', {
				output: process.stderr,
				spacing: 0,
			});
		});

		it("preserves quoted arguments containing spaces", async () => {
			expect(
				await runProjectCommand(
					`node -e "process.exit(process.argv[1] === 'hello world' ? 0 : 1)" "hello world"`,
					process.cwd()
				)
			).toEqual({ exitCode: 0 });
		});

		it("preserves PATH and environment overrides for project commands", async () => {
			await runProjectCommand(
				`node -e "require('node:fs').writeFileSync('command-env.json', JSON.stringify([process.env.PATH, process.env.CF_TEST_ENV]))"`,
				process.cwd(),
				{ env: { CF_TEST_ENV: "override" } }
			);

			const [path, override] = JSON.parse(
				readFileSync("command-env.json", "utf8")
			);
			expect(path).toContain(resolve("node_modules/.bin"));
			expect(path.endsWith(process.env.PATH ?? "")).toBe(true);
			expect(override).toBe("override");
		});

		it("resolves framework executables from an ancestor's node_modules", async () => {
			await seed({
				"node_modules/.bin/cf-local-framework": nodeScript(
					'require("node:fs").writeFileSync("command.out", process.argv.slice(2).join("\\n"));'
				),
				"packages/app/package.json": "{}",
			});
			makeExecutable("node_modules/.bin/cf-local-framework", { npmBin: true });
			const cwd = resolve("packages/app");

			expect(
				await runProjectCommand("cf-local-framework build", cwd, {
					preferLocal: true,
					args: ["--mode", "staging"],
					output: "silent",
				})
			).toEqual({ exitCode: 0 });
			expect(readFileSync(resolve(cwd, "command.out"), "utf8")).toBe(
				"build\n--mode\nstaging"
			);
		});

		it("propagates non-zero project command exits", async () => {
			expect(
				await runProjectCommand('node -e "process.exit(42)"', process.cwd())
			).toEqual({ exitCode: 42 });
		});

		it.skipIf(process.platform === "win32")(
			"reports signal-killed project commands",
			async () => {
				expect(
					await runProjectCommand(
						`node -e "process.kill(process.pid, 'SIGTERM')"`,
						process.cwd()
					)
				).toEqual({ exitCode: 143, signal: "SIGTERM" });
			}
		);

		it.skipIf(process.platform === "win32")(
			"forwards shutdown to a tool started by the command launcher",
			async () => {
				await seed({
					"tool.cjs": nodeScript(`
const fs = require("node:fs");
process.on("SIGTERM", () => {
  fs.writeFileSync("tool-stopped", "true");
  process.exit(0);
});
setInterval(() => {}, 1000);
fs.writeFileSync("tool-ready", "true");
`),
					"launcher.cjs": nodeScript(`
const { spawn } = require("node:child_process");
spawn(process.execPath, ["tool.cjs"], { stdio: "inherit" });
`),
				});
				const before = new Set(process.listeners("SIGTERM"));
				const execution = runProjectCommand("node launcher.cjs", process.cwd());
				const listener = process
					.listeners("SIGTERM")
					.find((fn) => !before.has(fn));
				if (!listener) {
					throw new Error(
						"Project command did not register its shutdown listener"
					);
				}
				try {
					await vi.waitFor(() => {
						expect(readFileSync("tool-ready", "utf8")).toBe("true");
					});
				} finally {
					listener("SIGTERM");
				}

				await expect(execution).resolves.toMatchObject({ signal: "SIGTERM" });
				await vi.waitFor(() => {
					expect(readFileSync("tool-stopped", "utf8")).toBe("true");
				});
			}
		);

		it("reports missing project commands and restores signal listeners", async () => {
			const sigintListeners = process.listenerCount("SIGINT");
			const sigtermListeners = process.listenerCount("SIGTERM");
			const execution = runProjectCommand(
				"cf-missing-project-command",
				process.cwd(),
				{ output: "silent" }
			);
			if (process.platform === "win32") {
				await expect(execution).resolves.toEqual({ exitCode: 1 });
			} else {
				await expect(execution).rejects.toMatchObject({ code: "ENOENT" });
			}
			expect(process.listenerCount("SIGINT")).toBe(sigintListeners);
			expect(process.listenerCount("SIGTERM")).toBe(sigtermListeners);
		});

		it("hides environment overrides unless DEBUG is set", async () => {
			const logMessage = vi
				.spyOn(clack.log, "message")
				.mockImplementation(() => {});
			vi.stubEnv("DEBUG", "");

			expect(
				await runProjectCommand('node -e ""', process.cwd(), {
					env: { FOO: "bar" },
				})
			).toEqual({ exitCode: 0 });
			expect(logMessage).toHaveBeenCalledWith('Delegating to node -e ""', {
				output: process.stderr,
				spacing: 0,
			});
		});

		it("lists environment overrides when DEBUG is set", async () => {
			const logMessage = vi
				.spyOn(clack.log, "message")
				.mockImplementation(() => {});
			vi.stubEnv("DEBUG", "1");

			expect(
				await runProjectCommand('node -e ""', process.cwd(), {
					env: { FOO: "bar", BAZ: "qux" },
				})
			).toEqual({ exitCode: 0 });
			expect(logMessage).toHaveBeenCalledWith(
				[
					'Delegating to node -e "" with environment overrides:',
					"  FOO=bar",
					"  BAZ=qux",
				].join("\n"),
				{ output: process.stderr, spacing: 0 }
			);
		});

		it("formats a single environment override", async () => {
			const logMessage = vi
				.spyOn(clack.log, "message")
				.mockImplementation(() => {});
			vi.stubEnv("DEBUG", "1");

			expect(
				await runProjectCommand('node -e ""', process.cwd(), {
					env: { FOO: "bar" },
				})
			).toEqual({ exitCode: 0 });
			expect(logMessage).toHaveBeenCalledWith(
				[
					'Delegating to node -e "" with environment override:',
					"  FOO=bar",
				].join("\n"),
				{ output: process.stderr, spacing: 0 }
			);
		});

		it("preserves a forwarded signal when the command exits cleanly", () => {
			expect(normalizeProjectCommandExit(0, undefined, "SIGINT")).toEqual({
				exitCode: 0,
				signal: "SIGINT",
			});
		});

		it("prefers an observed framework termination signal", () => {
			expect(
				normalizeProjectCommandExit(undefined, "SIGKILL", "SIGINT")
			).toEqual({
				exitCode: 137,
				signal: "SIGKILL",
			});
		});

		it("does not resend Ctrl+C to a Windows framework command", () => {
			expect(shouldRelayProjectCommandSignal("SIGINT", "win32")).toBe(false);
			expect(shouldRelayProjectCommandSignal("SIGTERM", "win32")).toBe(true);
			expect(shouldRelayProjectCommandSignal("SIGINT", "linux")).toBe(true);
		});

		it("forwards arguments to a detected framework command", async () => {
			await seed({
				"cloudflare.config.ts": "export default {};",
				"package.json": JSON.stringify({
					name: "astro-project",
					dependencies: { astro: "^5.0.0" },
				}),
				"package-lock.json": "{}",
				"node_modules/astro/package.json": JSON.stringify({
					name: "astro",
					version: "5.0.0",
				}),
				"node_modules/.bin/astro": nodeScript(
					'require("node:fs").writeFileSync("astro-argv.json", JSON.stringify(process.argv.slice(2)));'
				),
			});

			makeExecutable("node_modules/.bin/astro", { npmBin: true });

			const result = await runCf(["dev", "--port", "3000"]);

			expect(result.exitCode).toBe(0);
			expect(JSON.parse(readFileSync("astro-argv.json", "utf8"))).toEqual([
				"dev",
				"--port",
				"3000",
			]);
		});

		it("runs native Vite without a plugin delegate", async () => {
			await seed({
				"package.json": JSON.stringify({
					devDependencies: { "@cloudflare/vite-plugin": "beta" },
				}),
				"node_modules/@cloudflare/vite-plugin/package.json": JSON.stringify({
					name: "@cloudflare/vite-plugin",
					version: "2.0.0-beta.v.13",
				}),
				"cloudflare.config.ts": "export default {};",
				"node_modules/vite/package.json": JSON.stringify({
					name: "vite",
					version: "8.1.0",
					bin: { vite: "bin/vite.js" },
				}),
				"node_modules/vite/bin/vite.js": nodeScript("process.exit(0);"),
			});
			makeExecutable("node_modules/vite/bin/vite.js");

			const result = await runCf(["dev"]);
			expect(result.exitCode).toBe(0);
			// The dev server owns the terminal, stdout included.
			expect(vi.mocked(x).mock.lastCall?.[2]?.nodeOptions?.stdio).toEqual([
				"inherit",
				"inherit",
				"inherit",
			]);
		});

		it("runs the Vite+ executable selected by autoconfig", async () => {
			await seed({
				"cloudflare.config.ts": "export default {};",
				"package.json": JSON.stringify({
					devDependencies: {
						"@cloudflare/vite-plugin": "beta",
						"vite-plus": "1.5.0",
					},
				}),
				"node_modules/@cloudflare/vite-plugin/package.json": JSON.stringify({
					version: "2.0.0-beta.1",
				}),
				"node_modules/vite-plus/package.json": JSON.stringify({
					name: "vite-plus",
					version: "1.5.0",
					bin: { vp: "bin/vp with ' quote.js" },
				}),
				"node_modules/vite-plus/bin/vp with ' quote.js": nodeScript(
					'require("node:fs").writeFileSync("argv.out", JSON.stringify(process.argv.slice(2)));'
				),
			});
			makeExecutable("node_modules/vite-plus/bin/vp with ' quote.js");

			const result = await runCf([
				"dev",
				"--mode",
				"staging",
				"--",
				"--port",
				"03000",
			]);

			expect(result.exitCode).toBe(0);
			expect(JSON.parse(readFileSync("argv.out", "utf8"))).toEqual([
				"dev",
				"--mode",
				"staging",
				"--port",
				"03000",
			]);
		});

		it("rejects future Vite plugin major versions", async () => {
			await seed({
				"package.json": JSON.stringify({
					devDependencies: { "@cloudflare/vite-plugin": "next" },
				}),
				"node_modules/@cloudflare/vite-plugin/package.json": JSON.stringify({
					name: "@cloudflare/vite-plugin",
					version: "3.0.0-beta.1",
				}),
				"cloudflare.config.ts": "export default {};",
				"node_modules/vite/package.json": JSON.stringify({
					name: "vite",
					version: "8.1.0",
					bin: { vite: "bin/vite.js" },
				}),
				"node_modules/vite/bin/vite.js": nodeScript("process.exit(0);"),
			});
			makeExecutable("node_modules/vite/bin/vite.js");

			await expect(runCf(["dev"])).rejects.toThrow(
				"cf requires @cloudflare/vite-plugin v2 beta"
			);
			expect(std.err).toMatch(/@cloudflare\/vite-plugin v2 beta/);
			expect(std.err).toMatch(
				/@cloudflare\/vite-plugin@3\.0\.0-beta\.1 is installed/
			);
		});

		it("propagates a non-zero impl exit code", async () => {
			await seed({
				"package.json": JSON.stringify({
					devDependencies: { "@cloudflare/vite-plugin": "beta" },
				}),
				"node_modules/@cloudflare/vite-plugin/package.json": JSON.stringify({
					name: "@cloudflare/vite-plugin",
					version: "2.0.0-beta.v.13",
				}),
				"cloudflare.config.ts": "export default {};",
				"node_modules/vite/package.json": JSON.stringify({
					name: "vite",
					version: "8.1.0",
					bin: { vite: "bin/vite.js" },
				}),
				"node_modules/vite/bin/vite.js": nodeScript("process.exit(17);"),
			});
			makeExecutable("node_modules/vite/bin/vite.js");

			const result = await runCf(["dev"]);
			expect(result.exitCode).toBe(17);
		});

		it.each([{ separator: [] }, { separator: ["--"] }])(
			"forwards unknown flags to the impl with separator $separator",
			async ({ separator }) => {
				// The delegate inherits stdout, so write argv to a file for inspection.
				await seed({
					"package.json": JSON.stringify({
						devDependencies: { "@cloudflare/vite-plugin": "beta" },
					}),
					"node_modules/@cloudflare/vite-plugin/package.json": JSON.stringify({
						name: "@cloudflare/vite-plugin",
						version: "2.0.0-beta.v.13",
					}),
					"cloudflare.config.ts": "export default {};",
					"node_modules/vite/package.json": JSON.stringify({
						name: "vite",
						version: "8.1.0",
						bin: { vite: "bin/vite.js" },
					}),
					"node_modules/vite/bin/vite.js": nodeScript(
						'require("node:fs").writeFileSync("argv.out", process.argv.slice(2).join("\\n") + "\\n");'
					),
				});
				makeExecutable("node_modules/vite/bin/vite.js");

				const result = await runCf([
					"dev",
					"--mode",
					"staging",
					...separator,
					"--port",
					"03000",
					"--my-vite-flag",
					"9007199254740993",
				]);
				expect(result.exitCode).toBe(0);

				const argv = readFileSync(resolve(process.cwd(), "argv.out"), "utf-8")
					.trim()
					.split("\n");
				// First arg is always `dev` (the subcommand cf inserts);
				// the rest are forwarded verbatim. Note unknown flags pass
				// through because of `unknown-options-as-args` in the dev
				// command's parserConfiguration.
				expect(argv).toEqual([
					"dev",
					"--mode",
					"staging",
					"--port",
					"03000",
					"--my-vite-flag",
					"9007199254740993",
				]);
			}
		);
	});
});

/** Join the lines an error frame wrapped, so a long path can't split a phrase. */
function unframe(text: string): string {
	return text.replaceAll("\n│ ", " ");
}
