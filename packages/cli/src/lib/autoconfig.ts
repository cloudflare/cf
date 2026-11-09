import { constants } from "node:os";
import { delimiter, dirname, join, resolve } from "node:path";
import {
	AutoConfigDetectionError,
	getDetailsForAutoConfig,
	runAutoConfig,
} from "@cloudflare/autoconfig";
import { parse as parseShell } from "shell-quote";
import { x } from "tinyexec";
import { CliExit } from "./cli-exit.js";
import { confirm, prompt, select } from "./dialog.js";
import { isNonInteractiveOrCI } from "./interactive.js";
import { resolveNpmLauncher } from "./npm-launcher.js";
import { createChildProcessController } from "./process.js";
import { log } from "./ui/log.js";
import { maybeApplyVinextCommandOverrides } from "./vinext.js";
import { maybeMigrateWranglerProject } from "./wrangler-migration.js";
import type {
	AutoConfigContext,
	AutoConfigDetails,
	AutoConfigSummary,
} from "@cloudflare/autoconfig";

/**
 * Where a project command's own output goes. cf's messages go to stderr
 * unless silent; "inherit" hands the terminal to the command, as `cf dev`
 * does.
 */
export type CommandOutput = "inherit" | "stderr" | "silent";
export interface CommandOutputOptions {
	output?: CommandOutput;
}

interface ProjectPreparationOptions extends CommandOutputOptions {
	dryRun?: boolean;
}

export interface RunProjectCommandOptions extends CommandOutputOptions {
	env?: Readonly<Record<string, string>>;
	args?: readonly string[];
	preferLocal?: boolean;
}

export interface ProjectCommandResult {
	exitCode: number;
	signal?: NodeJS.Signals;
}

export function shouldRelayProjectCommandSignal(
	signal: NodeJS.Signals,
	platform: NodeJS.Platform = process.platform
): boolean {
	return platform !== "win32" || signal !== "SIGINT";
}

export function normalizeProjectCommandExit(
	exitCode: number | null | undefined,
	observedSignal: string | undefined,
	forwardedSignal?: NodeJS.Signals
): ProjectCommandResult {
	const signal =
		(observedSignal && observedSignal in constants.signals
			? (observedSignal as NodeJS.Signals)
			: undefined) ?? forwardedSignal;
	return {
		exitCode: exitCode ?? (signal ? 128 + (constants.signals[signal] ?? 1) : 1),
		...(signal ? { signal } : {}),
	};
}

export async function analyzeProject(
	cwd: string,
	options: CommandOutputOptions = {}
): Promise<AutoConfigDetails | undefined> {
	const context = createAutoConfigContext(options);
	try {
		const details = await getDetailsForAutoConfig({
			projectPath: cwd,
			target: "cf",
			context,
		});
		return maybeApplyVinextCommandOverrides(details);
	} catch (error) {
		if (error instanceof AutoConfigDetectionError) {
			context.logger.debug("Autoconfig could not detect this project:", error);
			return;
		}
		throw error;
	}
}

/**
 * Run framework autoconfig after detection, applying or dry-running setup
 * without building.
 */
export async function configureProject(
	details: AutoConfigDetails,
	options: ProjectPreparationOptions = {}
): Promise<AutoConfigSummary> {
	return runAutoConfig(details, {
		target: "cf",
		context: createAutoConfigContext(options),
		dryRun: options.dryRun,
		runBuild: false,
	});
}

/**
 * Choose project setup before a build: an accepted Wrangler config conversion
 * takes precedence over framework setup. After either route is applied, the
 * returned details describe the configured project. In a dry run,
 * `setupNeeded` means a setup route was selected but not applied, so callers
 * must skip the build.
 */
export async function prepareProject(
	cwd: string,
	options: ProjectPreparationOptions = {}
): Promise<{
	details: AutoConfigDetails | undefined;
	configuration?: AutoConfigSummary;
	setupNeeded?: true;
}> {
	let details = await analyzeProject(cwd, options);
	if (details?.configured) {
		return { details };
	}

	const context = createAutoConfigContext(options);
	const migrationRan = await maybeMigrateWranglerProject(
		cwd,
		(text, confirmOptions) => context.dialogs.confirm(text, confirmOptions),
		options.output === "silent" ? "silent" : "stderr",
		options.dryRun
	);
	if (migrationRan) {
		if (options.dryRun) {
			return { details, setupNeeded: true };
		}
		details = await analyzeProject(cwd, options);
		return { details };
	}

	if (!details) {
		return { details };
	}

	const configuration = await configureProject(details, options);
	if (options.dryRun) {
		return { details, configuration, setupNeeded: true };
	}

	// Setup can change which tools the project uses, so callers need the
	// details of the configured project rather than the pre-setup analysis.
	return {
		details: (await analyzeProject(cwd, options)) ?? details,
		configuration,
	};
}

export async function runProjectCommand(
	command: string,
	cwd: string,
	options: RunProjectCommandOptions = {}
): Promise<ProjectCommandResult> {
	const output = options.output ?? "stderr";
	// Internal environment overrides are only listed when debugging delegation.
	const environmentOverrides = process.env.DEBUG
		? Object.entries(options.env ?? {})
		: [];
	const formattedEnv = environmentOverrides
		.map(([name, value]) => `  ${name}=${value}`)
		.join("\n");
	const environmentSuffix = formattedEnv
		? ` with environment override${environmentOverrides.length === 1 ? "" : "s"}:\n${formattedEnv}`
		: "";
	const formattedArgs = options.args
		?.map((arg) => JSON.stringify(arg))
		.join(" ");
	if (output !== "silent") {
		log.message(
			`Delegating to ${command}${formattedArgs ? ` ${formattedArgs}` : ""}${environmentSuffix}`
		);
	}
	const env = projectCommandEnvironment(cwd, options.env);
	// Match the child's environment when resolving npm's Windows launcher.
	const [file, ...commandArgs] = resolveNpmLauncher(
		parseProjectCommand(command),
		cwd,
		env
	);
	const subprocess = x(file, [...commandArgs, ...(options.args ?? [])], {
		nodePath: options.preferLocal ?? false,
		nodeOptions: {
			cwd,
			env,
			// Launchers can start another tool process (for example, vp starts
			// Vite). Give the command a group so signals reach that tool too.
			detached: process.platform !== "win32",
			// Inherited stdin/stderr preserve console Ctrl+C on Windows even
			// with tinyexec's windowsHide default.
			stdio: [
				"inherit",
				output === "inherit"
					? "inherit"
					: output === "silent"
						? "ignore"
						: process.stderr,
				"inherit",
			],
		},
	});
	// Retain the five-second forced-shutdown fallback for framework commands.
	const controller = subprocess.process
		? createChildProcessController(subprocess.process, { processGroup: true })
		: undefined;
	let forwardedSignal: NodeJS.Signals | undefined;
	const relay = (signal: NodeJS.Signals) => () => {
		const repeated = forwardedSignal !== undefined;
		forwardedSignal ??= signal;
		// Windows broadcasts Ctrl+C to every process sharing the console.
		// Resending SIGINT would forcefully terminate the framework command
		// before its own Ctrl+C handler can finish graceful shutdown.
		if (shouldRelayProjectCommandSignal(signal)) {
			const childSignal = repeated ? "SIGKILL" : signal;
			if (controller) {
				controller.terminate(childSignal);
			} else {
				subprocess.kill(childSignal);
			}
		}
	};
	const onSigInt = relay("SIGINT");
	const onSigTerm = relay("SIGTERM");
	const onSigHup = relay("SIGHUP");
	const onExit = () => {
		// Parent exit cannot wait for the graceful-shutdown timer.
		try {
			if (controller) {
				controller.terminate("SIGKILL");
			} else {
				subprocess.kill("SIGKILL");
			}
		} catch {
			// Cleanup is best effort once the parent is already exiting.
		}
	};
	process.on("SIGINT", onSigInt);
	process.on("SIGTERM", onSigTerm);
	process.on("SIGHUP", onSigHup);
	process.on("exit", onExit);

	try {
		const result = await subprocess;
		return normalizeProjectCommandExit(
			result.exitCode,
			subprocess.process?.signalCode ?? undefined,
			forwardedSignal
		);
	} finally {
		process.off("SIGINT", onSigInt);
		process.off("SIGTERM", onSigTerm);
		process.off("SIGHUP", onSigHup);
		process.off("exit", onExit);
	}
}

function projectCommandEnvironment(
	cwd: string,
	overrides: Readonly<Record<string, string>> = {}
): NodeJS.ProcessEnv {
	const env: NodeJS.ProcessEnv = {
		...process.env,
		...overrides,
		CLOUDFLARE_CF_AUTH: "true",
	};
	const pathKey = Object.keys(env).find((key) => /^path$/i.test(key)) ?? "PATH";
	const directories: string[] = [];
	let directory = resolve(cwd);
	// Bare framework commands use the application's toolchain, including binaries
	// hoisted into an enclosing workspace. Never add cf's own node_modules.
	while (true) {
		directories.push(join(directory, "node_modules", ".bin"));
		const parent = dirname(directory);
		if (parent === directory) {
			break;
		}
		directory = parent;
	}
	env[pathKey] = [...directories, env[pathKey]].filter(Boolean).join(delimiter);
	return env;
}

function parseProjectCommand(command: string): [string, ...string[]] {
	const tokens = parseShell(command, (name) => `$${name}`).map((token) => {
		if (typeof token === "string") {
			return token;
		}
		if ("op" in token && token.op === "glob") {
			return token.pattern;
		}
		throw new Error(
			"Project commands cannot contain shell operators or comments."
		);
	});
	const [file, ...args] = tokens;
	if (!file) {
		throw new Error("Project command cannot be empty.");
	}
	return [file, ...args];
}

function createAutoConfigContext(
	commandOptions: CommandOutputOptions = {}
): AutoConfigContext {
	const output = commandOptions.output ?? "stderr";
	const info = output === "silent" ? () => {} : console.error;
	return {
		logger: {
			log: info,
			info,
			warn: console.error,
			debug: (...args) => {
				if (process.env.DEBUG && output !== "silent") {
					console.error(...args);
				}
			},
			error: console.error,
		},
		dialogs: {
			confirm: (text, options) =>
				confirm(text, {
					defaultValue: options?.defaultValue ?? true,
					fallbackValue:
						options?.fallbackValue ?? options?.defaultValue ?? true,
				}),
			prompt: (text, options) =>
				prompt(text, {
					initialValue: options?.defaultValue,
					fallbackValue: options?.defaultValue,
					fallbackError:
						"This command cannot be run in a non-interactive context",
					validate: options?.validate,
				}),
			select: (text, options) =>
				select(text, {
					choices: options.choices,
					defaultOption: options.defaultOption,
					fallbackError:
						"This command cannot be run in a non-interactive context",
				}),
		},
		runCommand: async (command, cwd, label) => {
			info(`${label} Running: ${command}`);
			const result = await runProjectCommand(command, cwd, {
				...commandOptions,
				preferLocal: true,
			});
			if (result.exitCode !== 0 || result.signal) {
				throw new CliExit(result.exitCode, { signal: result.signal });
			}
		},
		isNonInteractiveOrCI,
	};
}
