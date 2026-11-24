import { setTimeout as sleep } from "node:timers/promises";
// Generated commands (each entry is a lazy CommandModule shell — the
// actual product/group/leaf modules are dynamically imported on demand
// when the parser selects the command).
import { generatedCommands } from "./commands/_generated/index.js";
import { appendApiSchemaHelp } from "./commands/api-schema-help.js";
import {
	rootCommandName,
	rootHandWrittenCommands,
} from "./commands/hand-written.js";
import { loadableRootCommands } from "./commands/root-commands.js";
import { detectAgentContext } from "./lib/agent-context.js";
import { hasQuietFlag } from "./lib/args.js";
import { CliExit } from "./lib/cli-exit.js";
import {
	applyCloudflareDotEnv,
	shouldApplyCloudflareDotEnv,
} from "./lib/dotenv.js";
import { handleError } from "./lib/errors.js";
import { BUILTIN_OPTIONS, GLOBAL_OPTIONS } from "./lib/global-options.js";
import { withHandWrittenDryRun } from "./lib/hand-written-dry-run.js";
import { lazyCommand, type LazyCommandImporter } from "./lib/lazy-command.js";
import { disposeLocalRuntime } from "./lib/local.js";
import { setProjectConfigMode } from "./lib/project-settings.js";
import { openSession, printActiveProfileLine } from "./lib/session.js";
import { createParser } from "./lib/stricli.js";
import {
	allTelemetryDispatchesSettled,
	beginTelemetryRun,
	wasCommandReported,
} from "./lib/telemetry/lifecycle.js";
import { renderPromptIntro } from "./lib/ui/banner.js";
import { theme } from "./lib/ui/index.js";
import { VERSION as version } from "./version.js";
import type * as TelemetryModule from "./lib/telemetry/index.js";
import type { CommandResolutionFailure } from "./lib/telemetry/types.js";
import type { UpdateNotice } from "./lib/update-check.js";
import type { Options } from "yargs";

export { CliExit } from "./lib/cli-exit.js";

function globalOptionNames(name: string, option: Options): string[] {
	const alias = option.alias;
	return [
		name,
		...(Array.isArray(alias) ? alias : alias === undefined ? [] : [alias]),
	];
}

function flagToken(name: string): string {
	return name.length === 1 ? `-${name}` : `--${name}`;
}

const GLOBAL_FLAGS_LIST = Object.entries<Options>({
	...GLOBAL_OPTIONS,
	...BUILTIN_OPTIONS,
})
	.filter(([, option]) => !option.hidden)
	.map(
		([name, option]) =>
			`  ${globalOptionNames(name, option)
				.sort((left, right) => left.length - right.length)
				.map(flagToken)
				.join(", ")}`
	)
	.join("\n");

function globalFlagTakesValue(arg: string, nextArg?: string): boolean {
	return Object.entries<Options>(GLOBAL_OPTIONS).some(([name, option]) => {
		if (
			option.type === "boolean" &&
			nextArg !== "true" &&
			nextArg !== "false"
		) {
			return false;
		}
		return globalOptionNames(name, option).some(
			(flag) => arg === flagToken(flag)
		);
	});
}

/**
 * Hand-written commands. Lazy-loaded for the same reason the generated
 * tree is lazy-loaded: keep `cf --help`, splash, version, and any
 * single-command path from pulling in OAuth, config readers, MCP-tool
 * metadata, etc. The `describe` string is supplied eagerly so help
 * output works without dynamically importing the underlying module.
 */
const handWrittenRoots = loadableRootCommands().map((command) =>
	withHandWrittenDryRun(
		lazyCommand(
			command.command,
			command.describe,
			command.load as LazyCommandImporter,
			command.telemetry
		),
		command.dryRun
	)
);

const HAND_WRITTEN_ROOTS = new Set(
	rootHandWrittenCommands().map(rootCommandName)
);

const AGENT_DISCOVERY_HELP = [
	"=== STOP: AGENT COMMAND DISCOVERY ===",
	"AGENTS: Do not explore commands by chaining nested --help calls.",
	"Your first port of call and the best way to discover commands is:",
	"AGENTS: Keep cf cli search and cf docs search queries anonymous; describe the action and resource type only.",
	"Never include names, email addresses, domains, account or resource IDs, tokens, or other identifying values.",
	'  cf cli search "<describe the task you want to accomplish>"',
	"It returns five compact JSON matches with short descriptions. Pick the best match instead of repeating similar searches.",
	"Run `<discovered command> --help` for detailed command help.",
	"For API request details, replace the result's leading `cf` with `cf schema`.",
	'For Cloudflare documentation, guides, and examples, use cf docs search "<question>".',
	"It returns ranked JSON results. Fetch a result's URL with Accept: text/markdown to read the full page.",
	"=== END AGENT COMMAND DISCOVERY ===",
].join("\n");

function prependAgentDiscoveryHelp(help: string): string {
	return detectAgentContext().isAgentic
		? `${AGENT_DISCOVERY_HELP}\n${help}`
		: help;
}

function decorateHelp(help: string, command: string | undefined): string {
	return prependAgentDiscoveryHelp(appendApiSchemaHelp(help, command));
}

/**
 * Print a one-line hint about shell completions on the first TTY run.
 *
 * Persists `completions.prompted: true` in cf's global state before
 * printing, so a state file cf cannot write suppresses the hint rather
 * than repeating it on every run. Suppressed when stderr isn't a TTY,
 * in CI, when `--quiet` is set, the user is running `cf complete`, or
 * they've already been hinted. Modelled after `gh` / `git`.
 */
async function maybeShowCompletionsHint(quiet = false): Promise<void> {
	if (!process.stderr.isTTY) {
		return;
	}
	if (quiet || hasQuietFlag(process.argv.slice(2))) {
		return;
	}
	if (commandName() === "complete") {
		return;
	}
	const { isCI } = await import("./lib/interactive.js");
	if (isCI) {
		return;
	}
	const { readState, updateState } = await import("./lib/state.js");
	if (readState().completions?.prompted) {
		return;
	}
	updateState({ completions: { prompted: true } });
	const { log } = await import("./lib/ui/log.js");
	log.info(
		`Tip: run ${theme.code("cf complete <bash|zsh|fish|powershell>")} to install shell completions.`
	);
}

let telemetryModulePromise: Promise<typeof TelemetryModule> | undefined;

function loadTelemetry() {
	telemetryModulePromise ??= import("./lib/telemetry/index.js");
	return telemetryModulePromise;
}

function commandName(args = process.argv.slice(2)): string | undefined {
	return commandPath(args, 1)[0];
}

function commandPath(args = process.argv.slice(2), depth = 2): string[] {
	const path: string[] = [];
	for (let index = 0; index < args.length && path.length < depth; index++) {
		const arg = args[index];
		if (arg === undefined || arg === "--") {
			break;
		}
		if (globalFlagTakesValue(arg, args[index + 1])) {
			index++;
			continue;
		}
		if (!arg.startsWith("-")) {
			path.push(arg);
		}
	}
	return path;
}

async function maybeShowTelemetryNotice(quiet = false): Promise<void> {
	if (!process.stderr.isTTY) {
		return;
	}
	const args = process.argv.slice(2);
	if (quiet || hasQuietFlag(args)) {
		return;
	}
	if (args.includes("--help") || args.includes("-h")) {
		return;
	}
	if (excludesTelemetry(commandPath(args).join(" "))) {
		return;
	}
	const { getBannerLastShown, getTelemetryDispatcher, setBannerLastShown } =
		await loadTelemetry();
	if (!getTelemetryDispatcher().enabled) {
		return;
	}
	if (getBannerLastShown() === version) {
		return;
	}

	const { log } = await import("./lib/ui/log.js");
	log.info(
		`Cloudflare collects anonymous cf usage telemetry. Run ${theme.code("cf cli telemetry disable")} to opt out.`
	);
	setBannerLastShown(version);
}

async function flushTelemetry(): Promise<void> {
	try {
		await Promise.race([
			allTelemetryDispatchesSettled(),
			sleep(1000, undefined, { ref: false }),
		]);
	} catch {
		// Telemetry must not affect command behavior.
	}
}

function isUnknownCommandError(error: unknown): boolean {
	return error instanceof Error && error.message.startsWith("Unknown command:");
}

class CliUsageError extends Error {
	constructor(
		message: string,
		readonly helpCommand: string
	) {
		super(message);
	}
}

function helpCommandFor(command: string | undefined): string {
	return `cf${command ? ` ${command}` : ""} --help`;
}

function excludesTelemetry(command: string): boolean {
	const [root, subcommand] = command.split(" ");
	return root === "complete" || (root === "cli" && subcommand === "telemetry");
}

/**
 * The command the user most likely meant: the recognised path, then the
 * suggestion in place of the mistyped word. A typo such as
 * `cf clii telemetry disable` still expresses telemetry opt-out intent.
 */
function intendedCommand(failure: CommandResolutionFailure): string {
	const [first, ...rest] = failure.unknownTokens;
	const next = failure.suggestedCommand ?? first;
	return [
		...failure.knownCommand,
		...(next === undefined ? [] : [next]),
		...rest,
	]
		.join(" ")
		.toLowerCase();
}

async function reportParseErrorIfUnreported(
	error: unknown,
	resolvedCommand: string | undefined,
	resolutionFailure?: CommandResolutionFailure
): Promise<void> {
	if (wasCommandReported() || error instanceof CliExit) {
		return;
	}
	// Failures below the root keep the bucketing they had before resolution
	// detail was added, so existing per-command data stays comparable: only
	// The singular "Unknown command:" becomes an unknown command, while a
	// suggestion or several unknown words keep the resolved command's name.
	// Root failures had no command name and were dropped; they are now
	// reported as unknown commands.
	const isUnknownCommand =
		isUnknownCommandError(error) ||
		resolutionFailure?.knownCommand.length === 0;
	const command = isUnknownCommand ? undefined : resolvedCommand;
	if (
		(command === undefined && !isUnknownCommand) ||
		excludesTelemetry(command ?? commandPath().join(" ")) ||
		(resolutionFailure !== undefined &&
			excludesTelemetry(intendedCommand(resolutionFailure)))
	) {
		return;
	}

	try {
		const { getTelemetryDispatcher, UNKNOWN_COMMAND_EVENT } =
			await loadTelemetry();
		const { sanitizeError } =
			await import("./lib/telemetry/error-sanitization.js");
		const dispatcher = getTelemetryDispatcher();
		if (!dispatcher.enabled) {
			return;
		}
		const resolution = resolutionFailure
			? await describeResolutionFailure(resolutionFailure)
			: { argsUsed: [], argsCombination: "" };
		const telemetryEventName = command ?? UNKNOWN_COMMAND_EVENT;
		const base = {
			command: telemetryEventName,
			sanitizedArgs: {},
			...resolution,
		};
		dispatcher.sendCommandEvent("cf command started", base);
		dispatcher.sendCommandEvent("cf command finished", {
			...base,
			outcome: "error",
			durationMs: 0,
			...sanitizeError(error),
		});
	} catch {
		// Telemetry must not interfere with error reporting.
	}
}

async function describeResolutionFailure(failure: CommandResolutionFailure) {
	const { loadCommandVocabulary, sanitizeCommandResolution } =
		await import("./lib/telemetry/command-resolution.js");
	return sanitizeCommandResolution(
		failure,
		process.argv.slice(2),
		loadCommandVocabulary(Object.keys(GLOBAL_OPTIONS))
	);
}

async function reportHelpShown(command: string | undefined): Promise<void> {
	if (!command || excludesTelemetry(command)) {
		return;
	}
	try {
		const { getTelemetryDispatcher } = await loadTelemetry();
		getTelemetryDispatcher().sendAdhocEvent("cf help shown", { command });
	} catch {
		// Telemetry must not affect help or command behavior.
	}
}

/** Print the branded banner to stderr and the parseable version to stdout. */
function maybeHandleVersionEarly(update?: UpdateNotice): boolean {
	const rawArgs = process.argv.slice(2);
	const separator = rawArgs.indexOf("--");
	const args = separator === -1 ? rawArgs : rawArgs.slice(0, separator);
	if (!args.includes("--version") && !args.includes("-v")) {
		return false;
	}
	openSession(version, { quiet: hasQuietFlag(args), update });
	console.log(version);
	return true;
}

/**
 * Welcome screen for bare `cf` with no arguments.
 *
 * Yargs' default `demandCommand` failure prints a generic "You need
 * to specify a command" + the full --help. With ~6,400 generated
 * commands, that's unreadable. Instead, show a branded landing card:
 * the slim headline, a one-line tagline, a handful of "getting
 * started" pointers, and a link to docs. Users discover the full
 * command surface via `cf --help`, tab-completion, or the docs.
 */
function maybeShowSplash(update?: UpdateNotice): boolean {
	if (process.argv.slice(2).length > 0) {
		return false;
	}
	const lines = [
		renderPromptIntro(version, update),
		"",
		"The Cloudflare CLI — manage your account, zones, and developer platform.",
		"",
		`${theme.bold("Get started:")}`,
		`  ${theme.code("cf auth login")}        ${theme.muted("Authenticate with Cloudflare")}`,
		`  ${theme.code("cf --help")}            ${theme.muted("Browse all commands")}`,
		`  ${theme.code("cf <command> --help")}  ${theme.muted("Per-command help")}`,
		`  ${theme.code("cf migrate")}           ${theme.muted("Migrate a Wrangler project to cf")}`,
		`  ${theme.code("cf complete bash")}     ${theme.muted("Install shell completions")}`,
		"",
		`${theme.bold("Docs:")}      ${theme.brand("https://developers.cloudflare.com/")}`,
		"",
	];
	console.log(lines.join("\n"));
	return true;
}

/**
 * Print the cf banner above every command's output, unless suppressed.
 *
 * Suppressed when:
 *   - `--quiet` / `-q` is passed
 *   - stderr isn't a TTY (CI, pipes, redirects — banner is noise)
 *   - the command is the `cf complete` shell-completion hook (output
 *     must be parseable, no decoration). Covers both the init-script
 *     form (`cf complete bash`) and the runtime callback form
 *     (`cf complete -- <words…>`).
 *   - the command is bare `cf` (the splash renders its own headline)
 *     or `cf --version` (handled before normal command dispatch)
 */
function maybeOpenSession(quiet = false, update?: UpdateNotice): void {
	const rawArgs = process.argv.slice(2);
	const separator = rawArgs.indexOf("--");
	const args = separator === -1 ? rawArgs : rawArgs.slice(0, separator);
	if (args.length === 0) {
		return;
	}
	if (args.includes("--version") || args.includes("-v")) {
		return;
	}
	if (commandName(args) === "complete") {
		return;
	}
	openSession(version, { quiet: quiet || hasQuietFlag(args), update });
}

interface PreparedUpdateCheck {
	notice?: UpdateNotice;
	start(): void;
}

interface BuildCliOptions {
	onCommandResolved?: (command: string) => void;
	/** Receives the error `.fail` is about to throw for a resolution failure. */
	onCommandResolutionFailed?: (
		failure: CommandResolutionFailure,
		error: Error
	) => void;
	onHelpShown?: (command: string) => void;
	updateCheck?: PreparedUpdateCheck;
}

/**
 * Load the cached update result only when a branded banner is visible. The
 * returned starter detaches the registry refresh after that banner renders.
 */
async function prepareUpdateCheck(): Promise<PreparedUpdateCheck | undefined> {
	const args = process.argv.slice(2);
	if (hasQuietFlag(args)) {
		return undefined;
	}
	const command = commandName(args);
	if (command === "complete" || command === "update") {
		return undefined;
	}
	const bannerWritesToStdout = args.length === 0;
	if (
		bannerWritesToStdout
			? process.stdout.isTTY !== true
			: process.stderr.isTTY !== true
	) {
		return undefined;
	}
	// CI can attach pseudo-TTYs, so the stream checks above are not sufficient
	// on their own. Avoid reading update state or starting a registry refresh in
	// CI even when the banner would otherwise be interactive.
	const { isCI } = await import("./lib/interactive.js");
	if (isCI) {
		return undefined;
	}
	const { getUpdateNotice, maybeStartBackgroundUpdateCheck } =
		await import("./lib/update-check.js");
	let started = false;
	return {
		notice: getUpdateNotice(version),
		start() {
			if (started) {
				return;
			}
			started = true;
			maybeStartBackgroundUpdateCheck();
		},
	};
}

export function buildCli(rawArgs: string[], options: BuildCliOptions = {}) {
	const {
		onCommandResolved,
		onCommandResolutionFailed,
		onHelpShown,
		updateCheck,
	} = options;
	let restoreCloudflareDotEnv: (() => void) | undefined;
	const delimiter = rawArgs.indexOf("--");
	const cfArgs = delimiter === -1 ? rawArgs : rawArgs.slice(0, delimiter);
	const localWasSpecified = cfArgs.some(
		(arg) =>
			arg === "--local" || arg === "--no-local" || arg.startsWith("--local=")
	);

	const cli = createParser(
		rawArgs,
		[
			...handWrittenRoots,
			...generatedCommands.map((gc) =>
				gc.hideCommand
					? { ...gc.command, describe: false as const }
					: gc.command
			),
		],
		{
			resolve(command) {
				onCommandResolved?.(command);
			},
			help: decorateHelp,
			shown(command) {
				onHelpShown?.(command);
			},
			fail(message, command, failure) {
				maybeOpenSession(false, updateCheck?.notice);
				updateCheck?.start();
				const error = new CliUsageError(message, helpCommandFor(command));
				if (failure) {
					onCommandResolutionFailed?.(failure, error);
				}
				throw error;
			},
			async startup(argv, resolvedCommand) {
				// Command middleware can suppress decoration before startup output.
				maybeOpenSession(argv.quiet, updateCheck?.notice);
				updateCheck?.start();
				try {
					await maybeShowTelemetryNotice(argv.quiet);
				} catch {
					// Telemetry must not affect command behavior.
				}
				try {
					await maybeShowCompletionsHint(argv.quiet);
				} catch {
					// Completion hints must not affect command behavior.
				}
				setProjectConfigMode(argv.mode);
				const rootCommand = String(argv._[0] ?? "");
				const persistTo = argv.persistTo ?? argv["persist-to"];
				if (
					!argv.help &&
					((rootCommand === "dev" && localWasSpecified) ||
						(argv.local && HAND_WRITTEN_ROOTS.has(rootCommand)))
				) {
					throw new Error(`--local is not supported by cf ${rootCommand}.`);
				}

				if (!argv.help && rootCommand === "dev" && persistTo !== undefined) {
					throw new Error("--persist-to is not supported by cf dev.");
				}

				if (persistTo === "") {
					throw new Error("--persist-to requires a non-empty directory.");
				}

				if (persistTo !== undefined && !argv.local) {
					throw new Error("--persist-to can only be used with --local.");
				}

				if (argv["temporary-account"] && argv.local) {
					throw new Error("--temporary-account cannot be used with --local.");
				}
				const eventCode = argv["event-code"];
				// Never silently ignore an event code when real credentials apply.
				if (eventCode !== undefined && !argv["temporary-account"]) {
					throw new Error("--event-code requires --temporary-account.");
				}

				if (
					resolvedCommand !== undefined &&
					shouldApplyCloudflareDotEnv(resolvedCommand, argv.local)
				) {
					restoreCloudflareDotEnv = await applyCloudflareDotEnv(argv);
				}

				// Local mode bypasses profile credentials, so resolving and displaying
				// an active profile would be misleading.
				if (!argv.local) {
					const { resolveProfile, setTemporaryAccountRequested } =
						await import("./lib/oauth/index.js");
					setTemporaryAccountRequested(
						argv["temporary-account"],
						eventCode === undefined ? undefined : { eventCode }
					);
					const profile = resolveProfile(argv.profile);
					printActiveProfileLine(profile);
				}
			},
		}
	);

	return {
		cli,
		dispose: () => {
			restoreCloudflareDotEnv?.();
			restoreCloudflareDotEnv = undefined;
		},
	};
}

/**
 * Run cf with an explicit argv (post-`hideBin`) — i.e. just the command +
 * flag tokens, NOT including `node bin/cf`. Wraps `main()` by stubbing
 * `process.argv` for the duration of the call. Used by integration tests
 * that don't want to mutate `process.argv` themselves.
 */
export async function runMain(argv: string[]): Promise<void> {
	const original = process.argv;
	process.argv = ["node", "cf", ...argv];
	try {
		await main();
	} finally {
		process.argv = original;
	}
}

/**
 * Entry point for the CLI. Reads `process.argv`, dispatches to the lazy
 * command graph, and short-circuits via `CliExit` for early-exit paths
 * (--version, bare-cf splash).
 *
 * Tests stub `process.argv` (and optionally `process.stdin.isTTY`, env
 * vars, etc.) then await `main()`, catching any `CliExit`. Most tests
 * should prefer `runMain(argv)` instead.
 */
export async function main(): Promise<void> {
	// Treat mode as invocation-scoped even when parsing fails before the global
	// middleware has a chance to set it for this invocation.
	setProjectConfigMode(undefined);
	beginTelemetryRun();

	// Delegation lives in bin/cf (before the bundle loads), never here —
	// dev/tests must run this checkout, not whatever a cwd pins.
	const updateCheck = await prepareUpdateCheck();
	if (maybeHandleVersionEarly(updateCheck?.notice)) {
		updateCheck?.start();
		throw new CliExit(0);
	}
	if (maybeShowSplash(updateCheck?.notice)) {
		updateCheck?.start();
		throw new CliExit(0);
	}

	let resolvedCommand: string | undefined;
	let resolutionFailure:
		| { failure: CommandResolutionFailure; error: Error }
		| undefined;
	let helpShown: string | undefined;
	const { cli, dispose } = buildCli(process.argv.slice(2), {
		onCommandResolved: (command) => {
			resolvedCommand = command;
		},
		onCommandResolutionFailed: (failure, error) => {
			resolutionFailure = { failure, error };
		},
		onHelpShown: (command) => {
			helpShown = command;
		},
		updateCheck,
	});
	// Help bypasses command middleware, so retain its startup decoration here.
	const rawArgs = process.argv.slice(2);
	const separator = rawArgs.indexOf("--");
	const args = separator === -1 ? rawArgs : rawArgs.slice(0, separator);
	if (args.includes("--help") || args.includes("-h")) {
		maybeOpenSession(false, updateCheck?.notice);
		updateCheck?.start();
		try {
			await maybeShowCompletionsHint();
		} catch {
			// Completion hints must not affect command behavior.
		}
	}

	// Central error handling: command handlers and validation alike
	// throw uncaught; we render once here.
	// `handleError` is responsible for both rendering and producing the
	// value to rethrow — today that's the input unchanged so tests can
	// assert on the original shape (status, code, message), but routing
	// it through `handleError` lets future versions wrap, normalise, or
	// chain the error in a single place without `main()` needing to
	// change. The binary entry maps any rethrow that isn't a `CliExit`
	// to `process.exit(1)` without re-rendering — `bin/cf` never writes
	// to stderr itself; this catch is the sole render site. `CliExit`
	// flows through unchanged so explicit exit codes (e.g. from
	// `--help` early-exits) survive.
	try {
		await cli.parse(process.argv.slice(2));
		await reportHelpShown(helpShown);
	} catch (err) {
		if (err instanceof CliExit) {
			throw err;
		}
		if (resolvedCommand === undefined) {
			try {
				await maybeShowTelemetryNotice();
			} catch {
				// Telemetry must not affect command behavior.
			}
			try {
				await maybeShowCompletionsHint();
			} catch {
				// Completion hints must not affect command behavior.
			}
		}
		// Only use the captured failure for the error `.fail` threw with it.
		const failure =
			resolutionFailure !== undefined && resolutionFailure.error === err
				? resolutionFailure.failure
				: undefined;
		await reportParseErrorIfUnreported(err, resolvedCommand, failure);
		const handledError = handleError(err);
		if (err instanceof CliUsageError) {
			if (
				err.helpCommand === "cf --help" &&
				/^Unknown arguments?:/.test(err.message)
			) {
				console.error(`\nGlobal flags:\n${GLOBAL_FLAGS_LIST}`);
			}
			console.error(
				"\n" +
					theme.italic(
						`For more information, run ${theme.code(err.helpCommand)}`
					)
			);
		}
		throw handledError;
	} finally {
		dispose();
		// Miniflare keeps workerd and a loopback server alive. The disposer is
		// registered lazily, so non-local commands do not import Miniflare.
		await disposeLocalRuntime();
		await flushTelemetry();
	}
}
