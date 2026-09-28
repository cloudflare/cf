import { existsSync, mkdirSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { loadAndParseConfig } from "@cloudflare/config";
import { DEFAULT_COMPAT_DATE } from "@cloudflare/workers-utils";
import {
	mockConsoleMethods,
	runInTempDir,
	seed,
} from "@cloudflare/workers-utils/test-helpers";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { WORKER_TEMPLATE_DEV_DEPENDENCIES } from "../../commands/init/template.js";
import {
	generateWorkerTypes,
	TYPES_OUTPUT_PATH,
} from "../../commands/workers/types/generate.js";
import { configureProject, runProjectCommand } from "../../lib/autoconfig.js";
import { isEphemeralExecRun } from "../../lib/delegate.js";
import { prompt, select } from "../../lib/dialog.js";
import { isNonInteractiveOrCI } from "../../lib/interactive.js";
import { VERSION } from "../../version.js";
import { runCf } from "../helpers/run-cf.js";
import type { AutoConfigSummary } from "@cloudflare/autoconfig";

vi.mock("../../lib/autoconfig.js", { spy: true });
vi.mock("../../lib/delegate.js", { spy: true });
vi.mock("../../lib/dialog.js", { spy: true });
vi.mock("../../lib/interactive.js", { spy: true });
vi.mock("../../commands/workers/types/generate.js", { spy: true });

const TEMPLATE_FILES = [
	".gitignore",
	"cloudflare.config.ts",
	"package.json",
	"src",
	"tsconfig.json",
	"vite.config.ts",
];

const PNPM_USER_AGENT = "pnpm/10.27.0 npm/? node/v24.15.0 darwin arm64";

describe("cf init", () => {
	runInTempDir();
	const std = mockConsoleMethods();
	let stdout: () => string;

	beforeEach(() => {
		vi.clearAllMocks();
		const write = vi
			.spyOn(process.stdout, "write")
			.mockImplementation(() => true);
		stdout = () => write.mock.calls.map(([chunk]) => String(chunk)).join("");
		vi.mocked(isNonInteractiveOrCI).mockReturnValue(true);
		vi.mocked(isEphemeralExecRun).mockReturnValue(false);
		vi.mocked(runProjectCommand).mockResolvedValue({ exitCode: 0 });
		vi.mocked(configureProject).mockResolvedValue({
			scripts: {},
			outputDir: ".",
		} satisfies AutoConfigSummary);
		vi.mocked(generateWorkerTypes).mockImplementation(async ({ configPath }) =>
			join(dirname(configPath), TYPES_OUTPUT_PATH)
		);
	});

	function readJson(path: string): Record<string, unknown> {
		return JSON.parse(readFileSync(path, "utf8")) as Record<string, unknown>;
	}

	describe("help", () => {
		it("lists cf init workers as the default initializer", async () => {
			const result = await runCf(["init", "--help"]);

			expect(result.exitCode).toBe(0);
			expect(std.out).toMatch(/Commands\n\s+cf init workers \[directory\]/);
			expect(std.out).toMatch(/set up an\s+existing one \[default\]/);
			expect(std.out).toContain("--package-manager");
			expect(std.out).toContain(
				"Running cf init without a subcommand runs cf init workers."
			);
		});
	});

	describe("new projects", () => {
		it("creates a hello-world Worker in a new directory", async () => {
			const result = await runCf(["init", "my-app", "--no-install"], {
				npm_config_user_agent: undefined,
			});

			expect(result.exitCode).toBe(0);
			expect(readdirSync("my-app").sort()).toEqual(TEMPLATE_FILES);
			expect(readdirSync("my-app/src")).toEqual(["index.ts"]);
			expect(readJson("my-app/package.json")).toEqual({
				name: "my-app",
				private: true,
				type: "module",
				scripts: {
					dev: "cf dev",
					build: "cf build",
					deploy: "cf deploy",
					typecheck: "cf workers types && tsc",
				},
				devDependencies: {
					"@cloudflare/vite-plugin":
						WORKER_TEMPLATE_DEV_DEPENDENCIES["@cloudflare/vite-plugin"],
					cf: `^${VERSION}`,
					typescript: WORKER_TEMPLATE_DEV_DEPENDENCIES.typescript,
					vite: WORKER_TEMPLATE_DEV_DEPENDENCIES.vite,
				},
			});
			const config = readFileSync("my-app/cloudflare.config.ts", "utf8");
			expect(config).toContain(
				'import { bindings, defineConfig } from "cf/config";'
			);
			expect(config).toContain('name: "my-app"');
			expect(config).toContain(`compatibilityDate: "${DEFAULT_COMPAT_DATE}"`);
			expect(config).toContain('WORLD: bindings.text("World")');
			expect(readFileSync("my-app/src/index.ts", "utf8")).toContain(
				"return new Response(`Hello ${env.WORLD}!`);"
			);
			expect(readFileSync("my-app/vite.config.ts", "utf8")).toContain(
				"plugins: [cloudflare()]"
			);
			expect(readFileSync("my-app/.gitignore", "utf8")).toContain(
				".cloudflare/"
			);
			expect(readJson("my-app/tsconfig.json").include).toEqual([
				"src",
				"cloudflare.config.ts",
				".cloudflare/types",
			]);
			expect(runProjectCommand).not.toHaveBeenCalled();
			expect(generateWorkerTypes).not.toHaveBeenCalled();
			expect(select).not.toHaveBeenCalled();
			expect(stdout()).toContain(
				`Creating a new Worker in ${resolve("my-app")}`
			);
			expect(stdout()).toContain("Next steps");
			expect(stdout()).toContain("cd my-app");
			expect(stdout()).toMatch(/npm install\s+Install dependencies/);
			expect(stdout()).toMatch(/cf dev\s+Start a local development server/);
			expect(stdout()).toMatch(/cf deploy\s+Deploy to Cloudflare/);
			expect(stdout()).not.toContain("npm run dev");
		});

		it("uses the Vite plugin beta dist-tag without Wrangler", async () => {
			await runCf(["init", "my-app", "--no-install"]);

			const packageJson = readJson("my-app/package.json");
			expect(packageJson.devDependencies).not.toHaveProperty("wrangler");
			expect(WORKER_TEMPLATE_DEV_DEPENDENCIES["@cloudflare/vite-plugin"]).toBe(
				"beta"
			);
		});

		it("treats cf init workers as the same initializer", async () => {
			const result = await runCf([
				"init",
				"workers",
				"other-app",
				"--no-install",
			]);

			expect(result.exitCode).toBe(0);
			expect(readdirSync("other-app").sort()).toEqual(TEMPLATE_FILES);
			expect(existsSync("workers")).toBe(false);
		});

		it("requires a directory when it cannot ask for one", async () => {
			mkdirSync("hello");
			process.chdir("hello");

			await expect(runCf(["init", "workers", "--no-install"])).rejects.toThrow(
				/Pass the directory to initialize.*cf init \./
			);
			expect(readdirSync(".")).toEqual([]);
		});

		it("asks which directory to initialize, defaulting to the current one", async () => {
			mkdirSync("hello");
			process.chdir("hello");
			vi.mocked(isNonInteractiveOrCI).mockReturnValue(false);
			vi.mocked(prompt).mockResolvedValueOnce(".");

			const result = await runCf(["init", "--no-install"]);

			expect(result.exitCode).toBe(0);
			expect(prompt).toHaveBeenCalledExactlyOnceWith(
				"Which directory do you want to initialize?",
				expect.objectContaining({
					defaultValue: ".",
					placeholder: ". (the current directory)",
				})
			);
			expect(readdirSync(".").sort()).toEqual(TEMPLATE_FILES);
			expect(readJson("package.json").name).toBe("hello");
			expect(stdout()).toContain(`Creating a new Worker in ${process.cwd()}`);
			expect(stdout()).not.toContain("cd ");
		});

		it("initializes the directory named at the prompt", async () => {
			vi.mocked(isNonInteractiveOrCI).mockReturnValue(false);
			vi.mocked(prompt).mockResolvedValueOnce(" prompted-app ");

			const result = await runCf(["init", "--no-install"]);

			expect(result.exitCode).toBe(0);
			expect(readdirSync("prompted-app").sort()).toEqual(TEMPLATE_FILES);
			expect(stdout()).toContain("cd prompted-app");
		});

		it("does not ask for a directory that was passed", async () => {
			vi.mocked(isNonInteractiveOrCI).mockReturnValue(false);

			const result = await runCf(["init", "my-app", "--no-install"]);

			expect(result.exitCode).toBe(0);
			expect(prompt).not.toHaveBeenCalled();
		});

		it("suggests npx cf when cf was launched with a one-shot runner", async () => {
			vi.mocked(isEphemeralExecRun).mockReturnValue(true);

			await runCf(["init", "my-app", "--no-install"]);

			expect(stdout()).toMatch(/npx cf dev\s+Start a local development server/);
			expect(stdout()).toMatch(/npx cf deploy\s+Deploy to Cloudflare/);
		});

		it("derives a valid Worker name from the directory", async () => {
			const result = await runCf(["init", "My Cool_App", "--no-install"]);

			expect(result.exitCode).toBe(0);
			expect(readJson("My Cool_App/package.json").name).toBe("my-cool-app");
			expect(stdout()).toContain('cd "My Cool_App"');
		});

		it("initializes a directory that only contains .git", async () => {
			await seed({ "repo/.git/HEAD": "ref: refs/heads/main\n" });

			const result = await runCf(["init", "repo", "--no-install"]);

			expect(result.exitCode).toBe(0);
			expect(readdirSync("repo").sort()).toEqual(
				[".git", ...TEMPLATE_FILES].sort()
			);
			expect(readFileSync("repo/.git/HEAD", "utf8")).toBe(
				"ref: refs/heads/main\n"
			);
			expect(configureProject).not.toHaveBeenCalled();
		});

		it("errors when the target is a file", async () => {
			await seed({ "notes.txt": "hello" });

			await expect(
				runCf(["init", "notes.txt", "--no-install"])
			).rejects.toThrow(
				"Cannot initialize notes.txt because it is not a directory."
			);
		});

		it("generates a config that @cloudflare/config loads", async () => {
			await runCf(["init", "my-app", "--no-install"]);
			const publicEntry = resolveCloudflareConfigPublicEntry();
			await seed({
				"my-app/node_modules/cf/package.json": JSON.stringify({
					name: "cf",
					type: "module",
					exports: { "./config": "./config.mjs" },
				}),
				"my-app/node_modules/cf/config.mjs": `export * from ${JSON.stringify(
					pathToFileURL(publicEntry).href
				)};\n`,
			});

			const { result } = await loadAndParseConfig(
				resolve("my-app/cloudflare.config.ts"),
				{ isPreview: false, mode: undefined }
			);

			expect(result.success).toBe(true);
			if (!result.success) {
				return;
			}
			expect(result.data.worker).toMatchObject({
				name: "my-app",
				compatibilityDate: DEFAULT_COMPAT_DATE,
				entrypoint: resolve("my-app/src/index.ts"),
				env: { WORLD: { type: "text", value: "World" } },
			});
		});
	});

	describe("dependency installation", () => {
		it("installs with the package manager that launched cf", async () => {
			const result = await runCf(["init", "my-app"], {
				npm_config_user_agent: PNPM_USER_AGENT,
			});

			expect(result.exitCode).toBe(0);
			expect(runProjectCommand).toHaveBeenCalledExactlyOnceWith(
				"pnpm install",
				resolve("my-app")
			);
			expect(stdout()).toMatch(/cf dev\s+Start a local development server/);
			expect(stdout()).not.toContain("Install dependencies");
		});

		it("shows the target directory when prompting for the package manager", async () => {
			let outputBeforePrompt = "";
			vi.mocked(select).mockImplementationOnce(async () => {
				outputBeforePrompt = stdout();
				return "yarn";
			});

			const result = await runCf(["init", "my-app"], {
				npm_config_user_agent: PNPM_USER_AGENT,
			});

			expect(result.exitCode).toBe(0);
			expect(outputBeforePrompt).toContain(
				`Creating a new Worker in ${resolve("my-app")}`
			);
			expect(select).toHaveBeenCalledExactlyOnceWith(
				"Which package manager do you want to use?",
				{
					choices: [
						{ title: "npm", value: "npm" },
						{ title: "pnpm", value: "pnpm" },
						{ title: "yarn", value: "yarn" },
						{ title: "bun", value: "bun" },
					],
					defaultOption: 1,
				}
			);
			expect(runProjectCommand).toHaveBeenCalledExactlyOnceWith(
				"yarn install",
				resolve("my-app")
			);
		});

		it("uses --package-manager without prompting", async () => {
			const result = await runCf(
				["init", "my-app", "--package-manager", "bun"],
				{ npm_config_user_agent: PNPM_USER_AGENT }
			);

			expect(result.exitCode).toBe(0);
			expect(select).not.toHaveBeenCalled();
			expect(runProjectCommand).toHaveBeenCalledExactlyOnceWith(
				"bun install",
				resolve("my-app")
			);
		});

		it("rejects unknown package managers", async () => {
			await expect(
				runCf(["init", "my-app", "--package-manager", "deno"])
			).rejects.toThrow(/Invalid values/);
			expect(existsSync("my-app")).toBe(false);
		});

		it("keeps the files and reports a failed install", async () => {
			vi.mocked(runProjectCommand).mockResolvedValueOnce({ exitCode: 7 });

			const result = await runCf(["init", "my-app"], {
				npm_config_user_agent: undefined,
			});

			expect(result.exitCode).toBe(7);
			expect(readdirSync("my-app").sort()).toEqual(TEMPLATE_FILES);
			expect(stdout()).toContain("Dependency installation failed");
			expect(stdout()).toContain("npm install");
			expect(generateWorkerTypes).not.toHaveBeenCalled();
		});
	});

	describe("type generation", () => {
		it("generates types after installing dependencies", async () => {
			const result = await runCf(["init", "my-app"], {
				npm_config_user_agent: PNPM_USER_AGENT,
			});

			expect(result.exitCode).toBe(0);
			expect(generateWorkerTypes).toHaveBeenCalledExactlyOnceWith({
				configPath: resolve("my-app/cloudflare.config.ts"),
				mode: undefined,
				includeRuntime: true,
			});
			expect(
				vi.mocked(runProjectCommand).mock.invocationCallOrder[0]
			).toBeLessThan(
				vi.mocked(generateWorkerTypes).mock.invocationCallOrder[0] ?? 0
			);
			expect(stdout()).toContain(
				`Generated types in ${join("my-app", TYPES_OUTPUT_PATH)}`
			);
		});

		it("evaluates the config with --mode", async () => {
			const result = await runCf(["init", "my-app", "--mode", "staging"], {
				npm_config_user_agent: PNPM_USER_AGENT,
			});

			expect(result.exitCode).toBe(0);
			expect(generateWorkerTypes).toHaveBeenCalledExactlyOnceWith(
				expect.objectContaining({ mode: "staging" })
			);
		});

		it("warns and continues when type generation fails", async () => {
			vi.mocked(generateWorkerTypes).mockRejectedValueOnce(
				new Error("workerd exited")
			);

			const result = await runCf(["init", "my-app"], {
				npm_config_user_agent: PNPM_USER_AGENT,
			});

			expect(result.exitCode).toBe(0);
			expect(stdout()).toContain("Could not generate types: workerd exited");
			expect(stdout()).toContain("cf workers types");
			expect(stdout()).toMatch(/cf dev\s+Start a local development server/);
		});

		it("suggests npx cf when retrying after a one-shot runner", async () => {
			vi.mocked(isEphemeralExecRun).mockReturnValue(true);
			vi.mocked(generateWorkerTypes).mockRejectedValueOnce(
				new Error("workerd exited")
			);

			await runCf(["init", "my-app"], {
				npm_config_user_agent: PNPM_USER_AGENT,
			});

			expect(stdout()).toContain("npx cf workers types");
		});
	});

	describe("existing projects", () => {
		it("sets up a detected project with autoconfig from inside it", async () => {
			await seed({ "site/index.html": "<h1>Hello</h1>" });
			const startingCwd = process.cwd();
			let cwdDuringSetup: string | undefined;
			vi.mocked(configureProject).mockImplementationOnce(async () => {
				cwdDuringSetup = process.cwd();
				return { scripts: {}, outputDir: "." };
			});

			const result = await runCf(["init", "site"]);

			expect(result.exitCode).toBe(0);
			expect(configureProject).toHaveBeenCalledOnce();
			expect(vi.mocked(configureProject).mock.calls[0]?.[0]).toMatchObject({
				configured: false,
				projectPath: resolve("site"),
			});
			expect(cwdDuringSetup).toBe(resolve("site"));
			expect(process.cwd()).toBe(startingCwd);
			expect(existsSync("site/vite.config.ts")).toBe(false);
			expect(runProjectCommand).not.toHaveBeenCalled();
			expect(generateWorkerTypes).not.toHaveBeenCalled();
			expect(select).not.toHaveBeenCalled();
			expect(stdout()).toContain(
				`Setting up the existing project in ${resolve("site")}`
			);
			expect(stdout()).toContain("Set up site for Cloudflare");
			expect(stdout()).toContain("cd site");
			expect(stdout()).toMatch(/cf dev\s+Start a local development server/);
		});

		it("leaves an already configured project unchanged", async () => {
			await seed({
				"configured/cloudflare.config.ts": "export default {};",
				"configured/package.json": JSON.stringify({ name: "configured" }),
			});

			const result = await runCf(["init", "configured"]);

			expect(result.exitCode).toBe(0);
			expect(configureProject).not.toHaveBeenCalled();
			expect(readdirSync("configured").sort()).toEqual([
				"cloudflare.config.ts",
				"package.json",
			]);
			expect(stdout()).toContain("Found an existing Cloudflare configuration");
			expect(stdout()).toContain("cd configured");
			expect(stdout()).toMatch(/cf dev\s+Start a local development server/);
		});

		it("errors without writing when nothing can be detected", async () => {
			await seed({ "misc/.DS_Store": "" });

			await expect(runCf(["init", "misc"])).rejects.toThrow(
				"cf could not detect a project to set up in misc"
			);
			expect(readdirSync("misc")).toEqual([".DS_Store"]);
			expect(configureProject).not.toHaveBeenCalled();
			expect(stdout()).not.toContain("Next steps");
		});

		it("warns that new-project install flags do not apply", async () => {
			await seed({ "site/index.html": "<h1>Hello</h1>" });

			const result = await runCf(["init", "site", "--no-install"]);

			expect(result.exitCode).toBe(0);
			expect(stdout()).toContain("only apply when creating a new project");
			expect(configureProject).toHaveBeenCalledOnce();
		});
	});
});

function resolveCloudflareConfigPublicEntry(): string {
	const packageRoot = resolve(
		__dirname,
		"../../../node_modules/@cloudflare/config"
	);
	const packageJson = JSON.parse(
		readFileSync(join(packageRoot, "package.json"), "utf8")
	) as { exports: { "./public": { import: string } } };
	return join(packageRoot, packageJson.exports["./public"].import);
}
