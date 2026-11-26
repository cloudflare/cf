import { spawn } from "node:child_process";
import { mkdir, realpath } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runInTempDir, seed } from "@cloudflare/workers-utils/test-helpers";
import { x } from "tinyexec";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { findOwnPackageJson } from "../../lib/delegate.js";
import { createChildProcessController } from "../../lib/process.js";
import { mockOutputStreams } from "../helpers/capture-output.js";
import { runCf } from "../helpers/run-cf.js";
import type { ChildProcess } from "node:child_process";
import type * as FsPromises from "node:fs/promises";

vi.mock("node:child_process", { spy: true });
vi.mock("node:fs/promises", { spy: true });
vi.mock("tinyexec", { spy: true });
vi.mock("../../lib/delegate.js", { spy: true });
vi.mock("../../lib/process.js", { spy: true });

const { realpath: realpathActual } =
	await vi.importActual<typeof FsPromises>("node:fs/promises");

const installedPackage = JSON.stringify({ name: "cf", version: "1.2.3" });

function preview(): unknown {
	return JSON.parse(String(vi.mocked(console.log).mock.lastCall?.[0]));
}

function probeResult(stdout: string, exitCode: number) {
	return Promise.resolve({
		stdout,
		stderr: "",
		exitCode,
	}) as unknown as ReturnType<typeof x>;
}

describe("cf update", () => {
	runInTempDir();
	const std = mockOutputStreams();

	beforeEach(() => {
		vi.mocked(spawn).mockReset();
		vi.mocked(x)
			.mockReset()
			.mockImplementation(() => probeResult("", 1));
		vi.mocked(findOwnPackageJson).mockReset();
		vi.mocked(createChildProcessController).mockReset();
		vi.mocked(realpath).mockReset();
	});

	async function mockLocalInstall(files: Record<string, string> = {}) {
		await seed({
			"package.json": JSON.stringify({ devDependencies: { cf: "^1.2.3" } }),
			"node_modules/cf/package.json": installedPackage,
			...files,
		});
		vi.mocked(findOwnPackageJson).mockReturnValue(
			join(process.cwd(), "node_modules", "cf", "package.json")
		);
	}

	function mockUpdateExit(code: number | null, signal: NodeJS.Signals | null) {
		vi.mocked(spawn).mockReturnValue({} as ChildProcess);
		vi.mocked(createChildProcessController).mockReturnValue({
			exited: Promise.resolve({ code, signal }),
			terminationRequested: false,
			terminate: vi.fn(),
			waitForShutdown: vi.fn(async () => {}),
		});
	}

	it("shows the update command in help without probing", async () => {
		await expect(runCf(["update", "--help"])).resolves.toEqual({ exitCode: 0 });
		expect(std.out).toContain("update [target]");
		expect(std.out).toContain("Update the current installation of cf");
		expect(std.out).toContain("--dry-run");
		expect(x).not.toHaveBeenCalled();
	});

	it.each([
		["package-lock.json", ["npm", "install", "cf@latest", "--save-dev"]],
		["pnpm-lock.yaml", ["pnpm", "update", "cf@latest"]],
		[
			"yarn.lock",
			["yarn", "add", "cf@latest", "--dev", "--ignore-workspace-root-check"],
		],
		["bun.lock", ["bun", "add", "cf@latest", "--dev"]],
	])(
		"uses the owning project's %s from a subdirectory",
		async (lockfile, command) => {
			await mockLocalInstall({ [lockfile]: "" });
			const cwd = process.cwd();
			await mkdir("src");
			process.chdir("src");

			await expect(runCf(["update", "--dry-run"])).resolves.toEqual({
				exitCode: 0,
			});

			expect(preview()).toEqual({
				dryRun: true,
				scope: "local",
				cwd,
				command,
			});
			expect(x).not.toHaveBeenCalled();
			expect(spawn).not.toHaveBeenCalled();
		}
	);

	it("uses install metadata before the manifest and lockfile", async () => {
		await mockLocalInstall({
			"package.json": JSON.stringify({
				packageManager: "npm@11.0.0",
				dependencies: { cf: "1.2.3" },
			}),
			"package-lock.json": "{}",
			"node_modules/.pnpm/.modules.yaml": "",
		});

		await runCf(["update", "next", "--dry-run"]);

		expect(preview()).toMatchObject({
			command: ["pnpm", "update", "cf@next"],
		});
	});

	it("updates the workspace that declares the hoisted dependency", async () => {
		await mockLocalInstall({
			"package.json": JSON.stringify({
				packageManager: "yarn@4.0.0",
				workspaces: ["apps/*"],
			}),
			"apps/web/package.json": JSON.stringify({
				optionalDependencies: { cf: "latest" },
			}),
		});
		process.chdir(join("apps", "web"));

		await runCf(["update", "1.2.4", "--dry-run"]);

		expect(preview()).toMatchObject({
			cwd: process.cwd(),
			command: ["yarn", "add", "cf@1.2.4", "--optional", "--exact"],
		});
	});

	it("names a malformed project manifest from a subdirectory", async () => {
		await mockLocalInstall({ "package.json": "{" });
		const manifest = join(process.cwd(), "package.json");
		await mkdir("src");
		process.chdir("src");

		const result = runCf(["update"]);
		await expect(result).rejects.toThrow(manifest);
		await expect(result).rejects.toThrow("Fix the file or update cf manually.");
		expect(x).not.toHaveBeenCalled();
		expect(spawn).not.toHaveBeenCalled();
	});

	it.each([
		{
			manager: "npm",
			output: (root: string) => join(root, "node_modules"),
			args: ["install", "--global"],
		},
		{
			manager: "pnpm",
			output: (root: string) => `${root}\n${join(root, "node_modules", "cf")}`,
			args: ["add", "--global"],
		},
		{
			manager: "yarn",
			output: (root: string) => root,
			args: ["global", "add"],
		},
		{
			manager: "bun",
			output: (root: string) => `${root} node_modules (1)\n└── cf@1.2.3`,
			args: ["add", "--global"],
		},
	])(
		"verifies a global $manager install matches the running copy",
		async ({ manager, output, args }) => {
			await seed({
				"global install/node_modules/cf/package.json": installedPackage,
				"global install/package.json": JSON.stringify({
					dependencies: { cf: "1.2.3" },
				}),
			});
			const root = join(process.cwd(), "global install");
			vi.mocked(findOwnPackageJson).mockReturnValue(
				join(root, "node_modules", "cf", "package.json")
			);
			vi.mocked(x).mockImplementation((name) =>
				name === manager ? probeResult(output(root), 0) : probeResult("", 1)
			);
			await expect(
				runCf(["update", "1.2.4", "--dry-run"], {
					npm_config_user_agent: "npm/11.0.0",
				})
			).resolves.toEqual({ exitCode: 0 });

			expect(preview()).toEqual({
				dryRun: true,
				scope: "global",
				cwd: tmpdir(),
				command: [manager, ...args, "cf@1.2.4"],
			});
			expect(spawn).not.toHaveBeenCalled();
			expect(x).toHaveBeenCalledWith(
				manager,
				expect.any(Array),
				expect.objectContaining({
					nodeOptions: expect.objectContaining({ cwd: tmpdir() }),
				})
			);
		}
	);

	it("uses pnpm's global latest selector for a standalone install", async () => {
		const root = join(process.cwd(), "global");
		const install = join(root, "node_modules", "cf");
		await seed({
			"global/node_modules/cf/package.json": installedPackage,
			"global/package.json": JSON.stringify({ dependencies: { cf: "1.2.3" } }),
		});
		vi.mocked(findOwnPackageJson).mockReturnValue(
			join(install, "package.json")
		);
		vi.mocked(x).mockImplementation((name) =>
			name === "pnpm"
				? probeResult(`${root}\n${install}`, 0)
				: probeResult("", 1)
		);

		await runCf(["update", "--dry-run"]);

		expect(preview()).toMatchObject({
			command: ["pnpm", "update", "--global", "--latest", "cf"],
		});
	});

	const vpInstallId = "97da9e35-a49d-465e-9aae-2df784be832f";

	async function mockVpInstall(prefix: string, listedInstallId: string) {
		const install = join(prefix, "cf");
		await seed({ [join(install, "package.json")]: installedPackage });
		vi.mocked(findOwnPackageJson).mockReturnValue(
			join(process.cwd(), install, "package.json")
		);
		vi.mocked(x).mockImplementation((name) =>
			name === "vp"
				? probeResult(
						JSON.stringify([
							{ name: "cf", version: "1.2.3", installId: listedInstallId },
							{ name: "typescript", version: "5.0.0", installId: "" },
						]),
						0
					)
				: probeResult("", 1)
		);
	}

	it.each([
		["Unix", join("vp", "packages", "cf", vpInstallId, "lib", "node_modules")],
		["Windows", join("vp", "packages", "cf", vpInstallId, "node_modules")],
		[
			"legacy suffixed",
			join("vp", "packages", `cf#${vpInstallId}`, "lib", "node_modules"),
		],
		["legacy unversioned", join("vp", "packages", "cf", "lib", "node_modules")],
	])(
		"verifies a global Vite+ install in the %s layout",
		async (layout, prefix) => {
			const listedInstallId = layout.startsWith("legacy")
				? layout === "legacy suffixed"
					? `#${vpInstallId}`
					: ""
				: vpInstallId;
			await mockVpInstall(prefix, listedInstallId);

			await runCf(["update", "1.2.4", "--dry-run"]);

			expect(preview()).toEqual({
				dryRun: true,
				scope: "global",
				cwd: tmpdir(),
				command: ["vp", "add", "--global", "cf@1.2.4"],
			});
			expect(x).toHaveBeenCalledWith(
				"vp",
				["list", "--global", "--json"],
				expect.any(Object)
			);
			expect(spawn).not.toHaveBeenCalled();
		}
	);

	it("verifies a global Vite+ install from a Windows path on any OS", async () => {
		const manifest = `C:\\Users\\me\\AppData\\Local\\vite-plus\\packages\\cf\\${vpInstallId}\\node_modules\\cf\\package.json`;
		vi.mocked(findOwnPackageJson).mockReturnValue(manifest);
		// realpath would reject this made-up path, so return it unchanged.
		vi.mocked(realpath).mockImplementation(async (path) =>
			path === manifest ? manifest : realpathActual(path)
		);
		vi.mocked(x).mockImplementation((name) =>
			name === "vp"
				? probeResult(
						JSON.stringify([
							{ name: "cf", version: "1.2.3", installId: vpInstallId },
						]),
						0
					)
				: probeResult("", 1)
		);

		await runCf(["update", "1.2.4", "--dry-run"]);

		expect(preview()).toMatchObject({
			command: ["vp", "add", "--global", "cf@1.2.4"],
		});
	});

	it("drops a pinned Vite+ version spec when updating to latest", async () => {
		await mockVpInstall(
			join("vp", "packages", "cf", vpInstallId, "lib", "node_modules"),
			vpInstallId
		);

		await runCf(["update", "--dry-run"]);

		expect(preview()).toMatchObject({
			command: ["vp", "update", "--global", "--latest", "cf"],
		});
	});

	it("does not update a Vite+ install that vp does not report", async () => {
		await mockVpInstall(
			join("vp", "packages", "cf", vpInstallId, "lib", "node_modules"),
			"0f8fad5b-d9cb-469f-a165-70867728950e"
		);

		await expect(runCf(["update"])).rejects.toThrow(
			"Could not identify the package manager"
		);
		expect(spawn).not.toHaveBeenCalled();
	});

	it("refuses to update a shared pnpm global install group", async () => {
		const root = join(process.cwd(), "global");
		const install = join(root, "node_modules", "cf");
		await seed({
			"global/node_modules/cf/package.json": installedPackage,
			"global/package.json": JSON.stringify({
				dependencies: { cf: "1.2.3", wrangler: "4.0.0" },
			}),
		});
		vi.mocked(findOwnPackageJson).mockReturnValue(
			join(install, "package.json")
		);
		vi.mocked(x).mockImplementation((name) =>
			name === "pnpm"
				? probeResult(`${root}\n${install}`, 0)
				: probeResult("", 1)
		);

		await expect(runCf(["update"])).rejects.toThrow(
			"own pnpm global install group"
		);
		expect(spawn).not.toHaveBeenCalled();
	});

	it.each(["{", ""])(
		"names a malformed pnpm global group manifest (%j)",
		async (content) => {
			const root = join(process.cwd(), "global");
			const install = join(root, "node_modules", "cf");
			await seed({
				"global/node_modules/cf/package.json": installedPackage,
				"global/package.json": content,
			});
			vi.mocked(findOwnPackageJson).mockReturnValue(
				join(install, "package.json")
			);
			vi.mocked(x).mockImplementation((name) =>
				name === "pnpm"
					? probeResult(`${root}\n${install}`, 0)
					: probeResult("", 1)
			);

			await expect(runCf(["update"])).rejects.toThrow(
				`cf update could not parse ${join(root, "package.json")} as JSON. Fix the file or update cf manually.`
			);
			expect(spawn).not.toHaveBeenCalled();
		}
	);

	it("does not update a different global installation", async () => {
		await seed({
			"elsewhere/cf/package.json": installedPackage,
			"global/node_modules/cf/package.json": installedPackage,
		});
		vi.mocked(findOwnPackageJson).mockReturnValue(
			join(process.cwd(), "elsewhere", "cf", "package.json")
		);
		vi.mocked(x).mockImplementation((name) =>
			name === "npm"
				? probeResult(join(process.cwd(), "global", "node_modules"), 0)
				: probeResult("", 1)
		);

		await expect(runCf(["update"])).rejects.toThrow(
			"Could not identify the package manager"
		);
		expect(spawn).not.toHaveBeenCalled();
	});

	it("refuses to update when multiple global managers match", async () => {
		await seed({ "global/node_modules/cf/package.json": installedPackage });
		const root = join(process.cwd(), "global");
		vi.mocked(findOwnPackageJson).mockReturnValue(
			join(root, "node_modules", "cf", "package.json")
		);
		vi.mocked(x).mockImplementation((name) =>
			name === "npm"
				? probeResult(join(root, "node_modules"), 0)
				: probeResult(root, 0)
		);

		await expect(runCf(["update"])).rejects.toThrow(
			"More than one package manager"
		);
		expect(spawn).not.toHaveBeenCalled();
	});

	it("does not rewrite a non-registry dependency", async () => {
		await mockLocalInstall({
			"package.json": JSON.stringify({
				dependencies: { cf: "https://pkg.pr.new/cf@123" },
			}),
		});

		await expect(runCf(["update"])).rejects.toThrow(
			"non-registry cf dependency"
		);
		expect(spawn).not.toHaveBeenCalled();
	});

	it("does not probe or install for one-shot runs", async () => {
		vi.mocked(findOwnPackageJson).mockReturnValue(
			join(process.cwd(), "_npx", "node_modules", "cf", "package.json")
		);

		await expect(runCf(["update"])).rejects.toThrow(
			"no persistent cf installation"
		);
		expect(x).not.toHaveBeenCalled();
		expect(spawn).not.toHaveBeenCalled();
	});

	it("rejects a URL as an update target before looking for an install", async () => {
		await expect(
			runCf(["update", "https://example.com/cf.tgz", "--dry-run"])
		).rejects.toThrow("Specify a release tag or an exact version");
		expect(findOwnPackageJson).not.toHaveBeenCalled();
	});

	it("forwards package manager output to stderr and preserves its exit status", async () => {
		await mockLocalInstall({
			"bun.lock": "",
			".env": "CLOUDFLARE_API_TOKEN=should-not-be-inherited\n",
		});
		mockUpdateExit(42, null);
		let childToken: string | undefined;
		vi.mocked(spawn).mockImplementationOnce(() => {
			childToken = process.env.CLOUDFLARE_API_TOKEN;
			return {} as ChildProcess;
		});

		await expect(
			runCf(["update", "--quiet"], { CLOUDFLARE_API_TOKEN: undefined })
		).resolves.toEqual({ exitCode: 42 });

		expect(spawn).toHaveBeenCalledWith(
			expect.any(String),
			expect.any(Array),
			expect.objectContaining({
				cwd: process.cwd(),
				stdio: ["inherit", process.stderr, "inherit"],
			})
		);
		expect(childToken).toBeUndefined();
		expect(std.out).toBe("");
		expect(std.err).toContain("bun add cf@latest --dev");
	});
});
