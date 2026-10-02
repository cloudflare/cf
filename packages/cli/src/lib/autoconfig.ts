import { Console } from "node:console";
import { constants } from "node:os";
import * as clack from "@clack/prompts";
import {
	AutoConfigDetectionError,
	getDetailsForAutoConfig,
	runAutoConfig,
} from "@cloudflare/autoconfig";
import { execa } from "execa";
import { parse as parseShell } from "shell-quote";
import { CliExit } from "./cli-exit.js";
import { confirm, prompt, select } from "./dialog.js";
import { isNonInteractiveOrCI } from "./interactive.js";
import { maybeApplyVinextCommandOverrides } from "./vinext.js";
import { maybeMigrateWranglerProject } from "./wrangler-migration.js";
import type {
	AutoConfigContext,
	AutoConfigDetails,
	AutoConfigSummary,
} from "@cloudflare/autoconfig";

export type CommandOutput = "stdout" | "stderr" | "silent";
export interface CommandOutputOptions {
	output?: CommandOutput;
}

interface ProjectPreparationOptions extends CommandOutputOptions {
	dryRun?: boolean;
}

export interface RunProjectCommandOptions extends CommandOutputOptions {
	env?: Readonly<Record<string, string>>;
	args?: readonly string[];
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
	if (
		await maybeMigrateWranglerProject(
			cwd,
			(text, confirmOptions) => context.dialogs.confirm(text, confirmOptions),
			options.output,
			options.dryRun
		)
	) {
		if (options.dryRun) {
			return { details, setupNeeded: true };
		}
		details = await analyzeProject(cwd, options);
		return { details };
	}

	return {
		details,
		...(details
			? {
					configuration: await configureProject(details, options),
					...(options.dryRun ? { setupNeeded: true as const } : {}),
				}
			: {}),
	};
}

export async function runProjectCommand(
	command: string,
	cwd: string,
	options: RunProjectCommandOptions = {}
): Promise<ProjectCommandResult> {
	const output = options.output ?? "stdout";
	// The overrides are mostly internal plumbing (registry paths, build-output
	// markers), so they are only listed when debugging delegation.
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
		clack.log.message(
			`Delegating to ${command}${formattedArgs ? ` ${formattedArgs}` : ""}${environmentSuffix}`,
			{
				spacing: 0,
				output: output === "stderr" ? process.stderr : undefined,
			}
		);
	}
	const [file, ...commandArgs] = parseProjectCommand(command);
	const subprocess = execa(file, [...commandArgs, ...(options.args ?? [])], {
		cwd,
		env: options.env,
		stdio: [
			"inherit",
			output === "stderr"
				? process.stderr
				: output === "silent"
					? "ignore"
					: "inherit",
			"inherit",
		],
		reject: false,
	});
	let forwardedSignal: NodeJS.Signals | undefined;
	const relay = (signal: NodeJS.Signals) => () => {
		forwardedSignal ??= signal;
		// Windows broadcasts Ctrl+C to every process sharing the console.
		// Resending SIGINT would forcefully terminate the framework command
		// before its own Ctrl+C handler can finish graceful shutdown.
		if (shouldRelayProjectCommandSignal(signal)) {
			subprocess.kill(signal);
		}
	};
	const onSigInt = relay("SIGINT");
	const onSigTerm = relay("SIGTERM");
	process.on("SIGINT", onSigInt);
	process.on("SIGTERM", onSigTerm);

	try {
		const result = await subprocess;
		return normalizeProjectCommandExit(
			result.exitCode,
			result.signal,
			forwardedSignal
		);
	} finally {
		process.off("SIGINT", onSigInt);
		process.off("SIGTERM", onSigTerm);
	}
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
	const output = commandOptions.output ?? "stdout";
	const outputConsole =
		output === "stderr"
			? new Console({ stdout: process.stderr, stderr: process.stderr })
			: console;
	const log =
		output === "silent" ? () => {} : outputConsole.log.bind(outputConsole);
	const info =
		output === "silent" ? () => {} : outputConsole.info.bind(outputConsole);
	const dialogOutput = output === "stdout" ? undefined : process.stderr;
	return {
		logger: {
			log,
			info,
			warn: outputConsole.warn.bind(outputConsole),
			debug: (...args) => {
				if (process.env.DEBUG && output !== "silent") {
					outputConsole.debug(...args);
				}
			},
			error: outputConsole.error.bind(outputConsole),
		},
		dialogs: {
			confirm: (text, options) =>
				confirm(text, {
					defaultValue: options?.defaultValue ?? true,
					fallbackValue:
						options?.fallbackValue ?? options?.defaultValue ?? true,
					output: dialogOutput,
				}),
			prompt: (text, options) =>
				prompt(text, {
					initialValue: options?.defaultValue,
					fallbackValue: options?.defaultValue,
					fallbackError:
						"This command cannot be run in a non-interactive context",
					validate: options?.validate,
					output: dialogOutput,
				}),
			select: (text, options) =>
				select(text, {
					choices: options.choices,
					defaultOption: options.defaultOption,
					fallbackError:
						"This command cannot be run in a non-interactive context",
					output: dialogOutput,
				}),
		},
		runCommand: async (command, cwd, label) => {
			log(`${label} Running: ${command}`);
			const result = await runProjectCommand(command, cwd, commandOptions);
			if (result.exitCode !== 0 || result.signal) {
				throw new CliExit(result.exitCode, { signal: result.signal });
			}
		},
		isNonInteractiveOrCI,
	};
}
