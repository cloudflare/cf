import { setTimeout as sleep } from "node:timers/promises";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
// Generated commands (each entry is a lazy CommandModule shell — the
// actual product/group/leaf modules are dynamically imported on demand
// when yargs navigates into the command).
import { generatedCommands } from "./commands/_generated/index.js";
import { appendApiSchemaHelp } from "./commands/api-schema-help.js";
import {
	rootCommandName,
	rootHandWrittenCommands,
} from "./commands/hand-written.js";
import { isLeafCommand } from "./commands/is-leaf-command.js";
import { detectAgentContext } from "./lib/agent-context.js";
import { hasQuietFlag } from "./lib/args.js";
import { CliExit } from "./lib/cli-exit.js";
import {
	applyCloudflareDotEnv,
	shouldApplyCloudflareDotEnv,
} from "./lib/dotenv.js";
import { handleError } from "./lib/errors.js";
import { lazyCommand, type LazyCommandImporter } from "./lib/lazy-command.js";
import { disposeLocalRuntime } from "./lib/local.js";
import { setProjectConfigMode } from "./lib/project-settings.js";
import { openSession, printActiveProfileLine } from "./lib/session.js";
import {
	allTelemetryDispatchesSettled,
	beginTelemetryRun,
	wasCommandReported,
} from "./lib/telemetry/lifecycle.js";
import { renderPromptIntro } from "./lib/ui/banner.js";
import { theme } from "./lib/ui/index.js";
import { VERSION as version } from "./version.js";
import type * as TelemetryModule from "./lib/telemetry/index.js";
import type { UpdateNotice } from "./lib/update-check.js";
import type { Options } from "yargs";

export { CliExit } from "./lib/cli-exit.js";

const GLOBAL_OPTIONS = {
	quiet: {
		type: "boolean",
		alias: "q",
		description: "Suppress non-essential output",
		global: true,
		default: false,
	},
	zone: {
		type: "string",
		alias: "z",
		description: "Zone ID or domain name (overrides CLOUDFLARE_ZONE_ID)",
		global: true,
	},
	profile: {
		type: "string",
		description: "Use a specific auth profile",
		requiresArg: true,
		global: true,
	},
	mode: {
		type: "string",
		alias: "m",
		description: "Mode used to evaluate project configuration",
		requiresArg: true,
		global: true,
		coerce: (mode) => {
			if (Array.isArray(mode)) {
				throw new Error("--mode can only be specified once.");
			}
			if (mode === "") {
				throw new Error("--mode requires a non-empty value.");
			}
			return mode;
		},
	},
	// `--local` runs the command against cf's on-disk Miniflare state
	// instead of the production API: cf spawns its own Miniflare over
	// `--persist-to` (default `~/.config/cloudflare/state/v3`), dispatches to the
	// local-explorer worker, and disposes it before exiting. No dev
	// session needs to be running. Endpoints the explorer doesn't
	// implement surface as a "no local equivalent" error.
	local: {
		type: "boolean",
		description: "Use local resource simulations",
		global: true,
		default: false,
	},
	"persist-to": {
		type: "string",
		description:
			"Directory holding local persisted state (default: ~/.config/cloudflare/state)",
		requiresArg: true,
		global: true,
	},
} satisfies Record<string, Options>;

function globalOptionNames(name: string, option: Options): string[] {
	const alias = option.alias;
	return [
		name,
		...(Array.isArray(alias) ? alias : alias === undefined ? [] : [alias]),
	];
}

const ROOT_OPTION_NAMES = new Set([
	"help",
	"h",
	"version",
	"v",
	...Object.entries<Options>(GLOBAL_OPTIONS).flatMap(([name, option]) =>
		globalOptionNames(name, option)
	),
]);

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
			(flag) => arg === (flag.length === 1 ? `-${flag}` : `--${flag}`)
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
const handWrittenRoots = rootHandWrittenCommands().map((command) =>
	lazyCommand(
		command.command,
		command.describe,
		command.load as LazyCommandImporter,
		command.telemetry
	)
);

const HAND_WRITTEN_ROOTS = new Set(
	rootHandWrittenCommands().map(rootCommandName)
);

const AGENT_DISCOVERY_HELP = [
	"=== STOP: AGENT COMMAND DISCOVERY ===",
	"AGENTS: Do not explore commands by chaining nested --help calls.",
	"Your first port of call and the best way to discover commands is:",
	"AGENTS: Keep cf cli search queries anonymous; describe the action and resource type only.",
	"Never include names, email addresses, domains, account or resource IDs, tokens, or other identifying values.",
	'  cf cli search "<describe the task you want to accomplish>"',
	"It returns five compact JSON matches with short descriptions. Pick the best match instead of repeating similar searches.",
	"Run `<discovered command> --help` for detailed command help.",
	"For API request details, replace the result's leading `cf` with `cf schema`.",
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
 * Persists `completions.prompted: true` in cf's global state so
 * subsequent runs stay silent. Suppressed when stderr isn't a TTY,
 * `--quiet` is set, the user is running `cf complete`, or they've
 * already been hinted. Modelled after `gh` / `git`.
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
	const { readState, updateState } = await import("./lib/state.js");
	if (readState().completions?.prompted) {
		return;
	}
	process.stderr.write(
		theme.muted(
			"Tip: run `cf complete <bash|zsh|fish>` to install shell completions.\n"
		)
	);
	updateState({ completions: { prompted: true } });
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

	process.stderr.write(
		theme.muted(
			"Cloudflare collects anonymous cf usage telemetry. Run `cf cli telemetry disable` to opt out.\n"
		)
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

function resolvedCommandName(yargsInstance: unknown): string | undefined {
	try {
		const commands = (
			yargsInstance as {
				getInternalMethods(): {
					getContext(): { commands: unknown };
				};
			}
		)
			.getInternalMethods()
			.getContext().commands;
		if (
			!Array.isArray(commands) ||
			commands.length === 0 ||
			!commands.every((command) => typeof command === "string")
		) {
			return undefined;
		}
		return commands.join(" ");
	} catch {
		return undefined;
	}
}

class CliUsageError extends Error {
	constructor(
		message: string,
		readonly helpCommand: string,
		readonly helpOutput?: string
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

async function reportParseErrorIfUnreported(
	error: unknown,
	resolvedCommand: string | undefined
): Promise<void> {
	if (wasCommandReported() || error instanceof CliExit) {
		return;
	}
	const command = isUnknownCommandError(error) ? undefined : resolvedCommand;
	if (
		(command === undefined && !isUnknownCommandError(error)) ||
		excludesTelemetry(command ?? commandPath().join(" "))
	) {
		return;
	}

	try {
		const { getTelemetryDispatcher, UNKNOWN_COMMAND_EVENT } =
			await loadTelemetry();
		const { sanitizeError } =
			await import("./lib/telemetry/error-sanitization.js");
		const dispatcher = getTelemetryDispatcher();
		const telemetryEventName = command ?? UNKNOWN_COMMAND_EVENT;
		const base = {
			command: telemetryEventName,
			sanitizedArgs: {},
			argsUsed: [],
			argsCombination: "",
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
	if (commandName(args) === "complete") {
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

/**
 * Construct the yargs CLI and its invocation disposer for a given argv.
 * Exposed so tests can build the CLI in isolation without triggering
 * auto-parsing.
 *
 * Yargs renders all help / group-help / per-command help itself; cf
 * only customises the section headings (brand-orange instead of the
 * yargs default `Commands:` / `Options:` / `Positionals:`) and groups
 * global flags into a `GLOBAL FLAGS` bucket so they don't intermix
 * with per-command options. Wrangler does the same thing.
 *
 * ## Global flags (live)
 *
 *   --help, -h            Show help
 *   --version, -v         Show plain version on stdout (banner on stderr)
 *   --quiet, -q           Suppress non-essential output
 *   --zone, -z            Zone ID or domain
 *   --profile             Use a specific auth profile
 *   --mode, -m            Mode used to evaluate project configuration
 *   --local               Route via a cf-spawned Miniflare session
 *   --persist-to          Directory holding the local persisted state
 *
 * ## Reserved (future)
 *
 * The following names are reserved for upcoming features. Do NOT
 * register them as per-command or new cross-product flags. If a
 * generated command's OpenAPI schema collides, forge / the generator
 * must rename or scope the op-level flag rather than shadow these.
 *
 *   --remote              Force production routing when local
 *                         auto-discovery is the default.
 *   --cwd                 Run as if from a different working
 *                         directory.
 *   --config, -c          Explicit Cloudflare config-file path.
 *   --experimental-*      Namespace for opt-in feature gates.
 *   --json                Output-format toggle. Output is all-JSON
 *   --ndjson              today; these names are claimed so a future
 *   --pretty              change of default doesn't collide.
 *
 * See `AGENTS.md` (root) and `packages/cli/AGENTS.md` for the same
 * list in prose form.
 */
export function buildCli(rawArgs: string[], options: BuildCliOptions = {}) {
	const { onCommandResolved, onHelpShown, updateCheck } = options;
	let restoreCloudflareDotEnv: (() => void) | undefined;
	const orange = (s: string) => theme.brand(s);
	const delimiter = rawArgs.indexOf("--");
	const cfArgs = delimiter === -1 ? rawArgs : rawArgs.slice(0, delimiter);
	const localWasSpecified = cfArgs.some(
		(arg) =>
			arg === "--local" || arg === "--no-local" || arg.startsWith("--local=")
	);

	const cli = yargs(rawArgs)
		.scriptName("cf")
		.parserConfiguration({ "sort-commands": true })
		// Yargs caps help at 80 columns by default, even in wider terminals.
		.wrap(process.stdout.columns || 80)
		.usage("$0 <command> [options]")
		.usage("\nThe Cloudflare CLI - manage your Cloudflare resources")
		// Brand the yargs section headers without rewriting the help
		// renderer. Same approach as wrangler: `updateStrings` rewrites
		// yargs's built-in labels in-place, so the rest of the help
		// layout (alignment, wrapping, `[boolean]` annotations) stays.
		.updateStrings({
			"Commands:": orange("Commands"),
			"Options:": orange("Options"),
			"Positionals:": orange("Positionals"),
			"Examples:": orange("Examples"),
		})
		.help("help", "Show help")
		.alias("h", "help")
		.options(GLOBAL_OPTIONS)
		// Bucket the cross-cutting flags into one block so they don't
		// intermix with per-command options on each --help screen.
		.group(
			[...Object.keys(GLOBAL_OPTIONS), "help", "version"],
			orange("Global flags")
		);

	// Hand-written commands. `lazyCommand` narrows the return type so
	// every registered command has its describe string surfaced eagerly
	// at registration time (so yargs help renders without dynamically
	// importing the underlying module).
	for (const command of handWrittenRoots) {
		cli.command(command);
	}

	// Register every generated product. Hidden products (those with
	// `hideCommand: true`, e.g. early-access kv/r2/d1 surfaces) are
	// invokable but suppressed from `--help` by passing
	// `describe: false` to yargs — same mechanism `tools` uses.
	for (const gc of generatedCommands) {
		if (gc.hideCommand) {
			cli.command({ ...gc.command, describe: false });
		} else {
			cli.command(gc.command);
		}
	}

	cli
		.middleware(async (argv) => {
			// Command middleware can suppress decoration before startup output.
			maybeOpenSession(argv.quiet, updateCheck?.notice);
			updateCheck?.start();
			const resolvedCommand = resolvedCommandName(cli);
			if (resolvedCommand !== undefined) {
				onCommandResolved?.(resolvedCommand);
			}
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
			if (
				!argv.help &&
				((rootCommand === "dev" && localWasSpecified) ||
					(argv.local && HAND_WRITTEN_ROOTS.has(rootCommand)))
			) {
				throw new Error(`--local is not supported by cf ${rootCommand}.`);
			}

			if (argv.persistTo === "") {
				throw new Error("--persist-to requires a non-empty directory.");
			}

			if (argv.persistTo !== undefined && !argv.local) {
				throw new Error("--persist-to can only be used with --local.");
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
				const { resolveProfile } = await import("./lib/oauth/index.js");
				const profile = resolveProfile(argv.profile);
				printActiveProfileLine(profile);
			}
		})
		.demandCommand(1, "You need to specify a command")
		// Keep these separate so runtime-schema commands can accept dynamic
		// options without also accepting surplus positional arguments.
		.strictCommands()
		.strictOptions()
		.recommendCommands()
		.version(version)
		.alias("v", "version")
		.epilogue("For more information, visit https://developers.cloudflare.com/")
		// Don't call process.exit on parse failures — surface as a thrown
		// error so callers (bin/cf, dev.ts, tests) can handle it.
		.exitProcess(false)
		.fail((msg, err, yargsInstance) => {
			maybeOpenSession(false, updateCheck?.notice);
			updateCheck?.start();
			const resolvedCommand = resolvedCommandName(cli);
			if (resolvedCommand !== undefined) {
				onCommandResolved?.(resolvedCommand);
			}
			if (err) {
				throw err;
			}
			// Yargs checks the missing command before strict options. Let its
			// next validation report an unknown global flag when one is present.
			if (msg === "You need to specify a command" && cli.parsed) {
				const hasUnknownOption = Object.keys(cli.parsed.argv).some(
					(name) =>
						name !== "_" &&
						name !== "$0" &&
						!ROOT_OPTION_NAMES.has(
							name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)
						)
				);
				if (hasUnknownOption) {
					return;
				}
			}
			// Yargs considers hidden commands when matching recommendations.
			// Its usage list contains only commands visible at the current depth,
			// so let parsing continue to the normal unknown-command failure when
			// the recommendation is hidden.
			const recommendation = /^Did you mean (.+)\?$/.exec(msg)?.[1];
			if (recommendation) {
				const visibleCommands = (
					yargsInstance as unknown as {
						getCommands(): Array<[string, ...unknown[]]>;
					}
				).getCommands();
				const isVisible = visibleCommands.some(
					([command]) => command.split(" ")[0] === recommendation
				);
				if (!isVisible) {
					return;
				}
			}
			// A group invoked without a subcommand (e.g. `cf dns`, or a
			// nested `cf r2 buckets`) fails its `.demandCommand(1, …)`
			// with our distinct "Please specify a subcommand" message —
			// both the hand-written groups and the generated index shells
			// use it. Show the relevant `--help` instead of a bare error
			// (same UX wrangler's `subHelp` provides), using
			// `yargsInstance`'s rendered help so each group shows its own
			// subcommand list.
			if (msg === "Please specify a subcommand") {
				if (resolvedCommand !== undefined) {
					onHelpShown?.(resolvedCommand);
				}
				yargsInstance.showHelp("log");
				return;
			}
			let helpOutput: string | undefined;
			if (
				msg.startsWith("Unknown argument:") &&
				resolvedCommand !== undefined &&
				isLeafCommand(resolvedCommand)
			) {
				yargsInstance.showHelp((help) => {
					helpOutput = decorateHelp(help, resolvedCommand);
				});
			}
			throw new CliUsageError(msg, helpCommandFor(resolvedCommand), helpOutput);
		});

	// Every depth can replace `.usage()`, so add the notice at the point
	// yargs emits help rather than relying on a root-level usage string.
	const showHelp = cli.showHelp.bind(cli);
	cli.showHelp = (level?: string | ((help: string) => void)) => {
		// Yargs bypasses strict command validation for automatic --help.
		// Compare its parsed positionals with the command it resolved. A leaf
		// may also have positional values, such as a bucket name or model.
		if (typeof level === "function") {
			const parsed = cli.parsed as false | { argv: { _: unknown[] } };
			const resolved = resolvedCommandName(cli);
			const next = parsed && parsed.argv._[resolved?.split(" ").length ?? 0];
			if (
				(typeof next === "string" || typeof next === "number") &&
				(resolved === undefined || !isLeafCommand(resolved))
			) {
				throw new CliUsageError(
					`Unknown command: ${next}`,
					helpCommandFor(resolved)
				);
			}
		}
		return showHelp((help) => {
			const command = resolvedCommandName(cli);
			if (command !== undefined) {
				onCommandResolved?.(command);
			}
			onHelpShown?.(command ?? "cf");
			const message = decorateHelp(help, command);
			if (typeof level === "function") {
				level(message);
			} else if (level === "log") {
				console.log(message);
			} else {
				console.error(message);
			}
		});
	};
	const getHelp = cli.getHelp.bind(cli);
	cli.getHelp = async () =>
		decorateHelp(await getHelp(), resolvedCommandName(cli));

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
 * Entry point for the CLI. Reads `process.argv`, dispatches to the yargs
 * command graph, and short-circuits via `CliExit` for early-exit paths
 * (--version, bare-cf splash).
 *
 * Help / group-help / per-command help are rendered by yargs itself;
 * cf only customises the section headings via `updateStrings`.
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
	let helpShown: string | undefined;
	const { cli, dispose } = buildCli(hideBin(process.argv), {
		onCommandResolved: (command) => {
			resolvedCommand = command;
		},
		onHelpShown: (command) => {
			helpShown = command;
		},
		updateCheck,
	});
	// Help bypasses command middleware, so retain its startup decoration here.
	const rawArgs = hideBin(process.argv);
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
	// throw uncaught; yargs `.fail()` rethrows; we render once here.
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
		// Like Wrangler, check unknown top-level commands before yargs handles
		// --help, since yargs skips strict command validation for help requests.
		const rootCommand = commandPath(args, 1)[0];
		if (
			(args.includes("--help") || args.includes("-h")) &&
			rootCommand !== undefined &&
			!HAND_WRITTEN_ROOTS.has(rootCommand) &&
			!generatedCommands.some(({ command }) => command.command === rootCommand)
		) {
			throw new CliUsageError(
				`Unknown command: ${rootCommand}`,
				helpCommandFor(undefined)
			);
		}
		await cli.parse(hideBin(process.argv));
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
		await reportParseErrorIfUnreported(
			err,
			resolvedCommand ?? resolvedCommandName(cli)
		);
		const handledError = handleError(err);
		if (err instanceof CliUsageError) {
			if (err.helpOutput) {
				console.error(`\n${err.helpOutput}`);
			} else {
				const detail =
					err.helpCommand === "cf --help" &&
					err.message.startsWith("Unknown argument:")
						? " to list global flags"
						: "";
				console.error(
					"\n" +
						theme.italic(
							`For more information, run ${theme.code(err.helpCommand)}${detail}`
						)
				);
			}
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
