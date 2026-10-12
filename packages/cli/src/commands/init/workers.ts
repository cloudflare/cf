import { mkdir, readdir, stat, writeFile } from "node:fs/promises";
import {
	basename,
	dirname,
	isAbsolute,
	join,
	relative,
	resolve,
} from "node:path";
import * as clack from "@clack/prompts";
import {
	DEFAULT_COMPAT_DATE,
	toValidWorkerName,
} from "@cloudflare/workers-utils";
import { CliExit } from "../../index.js";
import {
	analyzeProject,
	configureProject,
	runProjectCommand,
} from "../../lib/autoconfig.js";
import { isEphemeralExecRun } from "../../lib/delegate.js";
import { prompt, select } from "../../lib/dialog.js";
import { withProgress } from "../../lib/progress.js";
import { CLOUDFLARE_CONFIG_FILENAME } from "../../lib/project-settings.js";
import { theme } from "../../lib/ui/index.js";
import { VERSION } from "../../version.js";
import { renderWorkerTemplate } from "./template.js";
import type { CommonYargsOptions, InferArgs } from "../../lib/cli-types.js";
import type { Argv, CommandModule } from "yargs";

export const PACKAGE_MANAGERS = ["npm", "pnpm", "yarn", "bun"] as const;

export type PackageManager = (typeof PACKAGE_MANAGERS)[number];

export const INIT_TELEMETRY_SAFE_FLAGS = ["install", "package-manager"];

const IGNORED_DIRECTORY_ENTRIES = new Set([".git"]);

export function initBuilder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.positional("directory", {
			type: "string",
			describe:
				"Directory to initialize; created when missing (prompts when omitted; use . for the current directory)",
		})
		.option("install", {
			type: "boolean",
			default: true,
			describe:
				"Install dependencies after creating a new project (use --no-install to skip)",
		})
		.option("package-manager", {
			type: "string",
			choices: PACKAGE_MANAGERS,
			describe: "Package manager for a new project (prompts when interactive)",
		});
}

export type InitArgs = InferArgs<typeof initBuilder>;

export interface InitWorkersOptions {
	directory?: string;
	install: boolean;
	packageManager?: PackageManager;
	mode?: string;
}

type TargetState = "missing" | "empty" | "not-empty";

interface NextStep {
	command: string;
	description?: string;
}

export async function initWorkers(options: InitWorkersOptions): Promise<void> {
	const target = resolve(options.directory ?? (await promptForDirectory()));
	const state = await inspectTarget(target);
	if (state === "not-empty") {
		await setUpExistingProject(target, options);
		return;
	}
	await createWorkerProject(target, options);
}

async function promptForDirectory(): Promise<string> {
	const answer = await prompt("Which directory do you want to initialize?", {
		defaultValue: ".",
		placeholder: ". (the current directory)",
		fallbackError: `Pass the directory to initialize, for example ${theme.code("cf init my-worker")}, or ${theme.code("cf init .")} for the current directory.`,
	});
	return answer.trim() || ".";
}

export function toInitWorkersOptions(argv: {
	directory?: string;
	install?: boolean;
	packageManager?: string;
	mode?: string;
}): InitWorkersOptions {
	return {
		directory: argv.directory,
		install: argv.install ?? true,
		packageManager: parsePackageManager(argv.packageManager),
		mode: argv.mode,
	};
}

export function detectPackageManager(
	userAgent = process.env.npm_config_user_agent
): PackageManager | undefined {
	return parsePackageManager(userAgent?.split("/", 1)[0]);
}

function parsePackageManager(
	value: string | undefined
): PackageManager | undefined {
	return PACKAGE_MANAGERS.find((packageManager) => packageManager === value);
}

async function inspectTarget(target: string): Promise<TargetState> {
	let isDirectory: boolean;
	try {
		isDirectory = (await stat(target)).isDirectory();
	} catch (error) {
		if (isNodeError(error) && error.code === "ENOENT") {
			return "missing";
		}
		throw error;
	}
	if (!isDirectory) {
		throw new Error(
			`Cannot initialize ${describeTarget(target)} because it is not a directory.`
		);
	}
	const entries = await readdir(target);
	return entries.every((entry) => IGNORED_DIRECTORY_ENTRIES.has(entry))
		? "empty"
		: "not-empty";
}

async function createWorkerProject(
	target: string,
	options: InitWorkersOptions
): Promise<void> {
	clack.log.info(`Creating a new Worker in ${theme.bold(target)}`, {
		spacing: 0,
	});
	const packageManager = await resolvePackageManager(options);
	const name = toValidWorkerName(
		basename(target).toLowerCase().replace(/\s+/g, "-")
	).replace(/-+$/, "");
	const files = renderWorkerTemplate({
		name,
		compatibilityDate: DEFAULT_COMPAT_DATE,
		cfVersion: VERSION,
		packageManager,
	});

	for (const [path, contents] of Object.entries(files)) {
		const filePath = join(target, path);
		await mkdir(dirname(filePath), { recursive: true });
		await writeFile(filePath, contents, { flag: "wx" });
	}
	clack.log.success(
		`Created the ${theme.bold(name)} Worker in ${describeTarget(target)}`,
		{ spacing: 0 }
	);

	if (options.install) {
		const installCommand = `${packageManager} install`;
		const result = await runProjectCommand(installCommand, target);
		if (result.exitCode !== 0 || result.signal) {
			clack.log.error(
				`Dependency installation failed. Run ${theme.code(installCommand)} in ${describeTarget(target)} to try again.`,
				{ spacing: 0 }
			);
			throw new CliExit(result.exitCode, { signal: result.signal });
		}
		// Loading cloudflare.config.ts resolves `cf/config` from the project,
		// so types can only be generated once dependencies are installed.
		await generateProjectTypes(target, options.mode);
	}

	logNextSteps(target, [
		...(options.install
			? []
			: [
					{
						command: `${packageManager} install`,
						description: "Install dependencies",
					},
				]),
		...projectSteps(),
	]);
}

async function generateProjectTypes(
	target: string,
	mode: string | undefined
): Promise<void> {
	try {
		// Imported lazily: runtime type generation loads Miniflare.
		const { generateWorkerTypes } =
			await import("../workers/types/generate.js");
		const outputPath = await withProgress("Generating types", () =>
			generateWorkerTypes({
				configPath: join(target, CLOUDFLARE_CONFIG_FILENAME),
				mode,
				includeRuntime: true,
			})
		);
		clack.log.success(`Generated types in ${describeTarget(outputPath)}`, {
			spacing: 0,
		});
	} catch (error) {
		// The project is usable without types, and `cf dev` regenerates them.
		const reason = error instanceof Error ? error.message : String(error);
		clack.log.warn(
			`Could not generate types: ${reason}\nRun ${theme.code(`${cfInvocation()} workers types`)} in ${describeTarget(target)} to try again.`,
			{ spacing: 0 }
		);
	}
}

async function resolvePackageManager(
	options: InitWorkersOptions
): Promise<PackageManager> {
	if (options.packageManager) {
		return options.packageManager;
	}
	const detected = detectPackageManager() ?? "npm";
	if (!options.install) {
		return detected;
	}
	return select("Which package manager do you want to use?", {
		choices: PACKAGE_MANAGERS.map((packageManager) => ({
			title: packageManager,
			value: packageManager,
		})),
		defaultOption: PACKAGE_MANAGERS.indexOf(detected),
	});
}

async function setUpExistingProject(
	target: string,
	options: InitWorkersOptions
): Promise<void> {
	const description = describeTarget(target);
	clack.log.info(`Setting up the existing project in ${theme.bold(target)}`, {
		spacing: 0,
	});
	if (!options.install || options.packageManager) {
		clack.log.warn(
			`${theme.code("--no-install")} and ${theme.code("--package-manager")} only apply when creating a new project. Setting up an existing project uses its own package manager.`,
			{ spacing: 0 }
		);
	}

	const previousCwd = process.cwd();
	process.chdir(target);
	let alreadyConfigured = false;
	try {
		const details = await analyzeProject(target);
		if (!details) {
			throw new Error(
				`cf could not detect a project to set up in ${description}, and the directory is not empty.\n` +
					`Run ${theme.code("cf init")} in an empty directory, or pass a new directory name (for example, ${theme.code("cf init my-worker")}).`
			);
		}
		alreadyConfigured = details.configured;
		if (!alreadyConfigured) {
			await configureProject(details);
		}
	} finally {
		process.chdir(previousCwd);
	}

	if (alreadyConfigured) {
		clack.log.info(
			`Found an existing Cloudflare configuration in ${description}.`,
			{ spacing: 0 }
		);
	} else {
		clack.log.success(`Set up ${description} for Cloudflare.`, {
			spacing: 0,
		});
	}
	logNextSteps(target, projectSteps());
}

function cfInvocation(): string {
	return isEphemeralExecRun() ? "npx cf" : "cf";
}

function projectSteps(): NextStep[] {
	const cf = cfInvocation();
	return [
		{
			command: `${cf} dev`,
			description: "Start a local development server",
		},
		{ command: `${cf} deploy`, description: "Deploy to Cloudflare" },
	];
}

function logNextSteps(target: string, steps: NextStep[]): void {
	const allSteps: NextStep[] = [
		...changeDirectoryStep(target).map((command) => ({ command })),
		...steps,
	];
	const width = Math.max(
		...allSteps
			.filter((step) => step.description)
			.map((step) => step.command.length)
	);
	const lines = allSteps.map(({ command, description }) =>
		description
			? `  ${theme.code(command)}${" ".repeat(width - command.length + 2)}${theme.muted(description)}`
			: `  ${theme.code(command)}`
	);
	clack.log.message([theme.bold("Next steps"), ...lines].join("\n"), {
		symbol: theme.muted("├"),
	});
}

function changeDirectoryStep(target: string): string[] {
	const relativePath = relative(process.cwd(), target);
	if (relativePath === "") {
		return [];
	}
	const path = isOutside(relativePath) ? target : relativePath;
	return [`cd ${/\s/.test(path) ? JSON.stringify(path) : path}`];
}

function describeTarget(target: string): string {
	const relativePath = relative(process.cwd(), target);
	if (relativePath === "") {
		return "the current directory";
	}
	return isOutside(relativePath) ? target : relativePath;
}

function isOutside(relativePath: string): boolean {
	return relativePath.startsWith("..") || isAbsolute(relativePath);
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
	return error instanceof Error && "code" in error;
}

const workersCommand: CommandModule<CommonYargsOptions, InitArgs> & {
	describe: string;
} = {
	command: "workers [directory]",
	describe: "Create a new Workers project or set up an existing one",
	builder: initBuilder,
	handler: async (argv) => {
		await initWorkers(toInitWorkersOptions(argv));
	},
};

export default workersCommand;
