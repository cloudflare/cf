/**
 * `cf complete` — shell completion command, backed by `@bomb.sh/tab`.
 *
 * Two modes (both invoked through the same handler):
 *
 *   1. Init script: `cf complete <bash|zsh|fish|powershell>` prints the
 *      shell-specific completion bootstrap. Users append it to their rc
 *      file (e.g. `cf complete bash >> ~/.bashrc`).
 *
 *   2. Runtime: when the user presses TAB the shell calls back with
 *      `cf complete -- <words…>`. Tab parses the words against the
 *      registered command/option tree and prints completion candidates.
 *
 * Modelled after wrangler's `complete.ts` (cloudflare/workers-sdk#11113).
 * Previously cf shipped ~1.5k LOC of custom completions plumbing
 * (`__complete.ts`, generator/completions/, lib/completions/,
 * lib/completions-prompt.ts, lib/completion-cache.ts); tab subsumes
 * all of it.
 */

import t from "@bomb.sh/tab";
import { isCommandsMetadata, loadMeta } from "../../lib/metadata.js";
import { runWithTelemetry } from "../../lib/telemetry/run.js";
import type { CommandMeta, OptionMeta } from "../../lib/metadata.js";
import type { Command, RootCommand } from "@bomb.sh/tab";
import type { CommandModule } from "yargs";

/** Global flags that work on every command. Mirrors `src/index.ts:buildCli`. */
const GLOBAL_FLAGS: ReadonlyArray<{
	name: string;
	alias?: string;
	desc: string;
}> = [
	{ name: "quiet", alias: "q", desc: "Suppress non-essential output" },
	{ name: "zone", alias: "z", desc: "Zone ID or domain name" },
	{ name: "profile", desc: "Use a specific auth profile" },
	{
		name: "mode",
		alias: "m",
		desc: "Mode used to evaluate project configuration",
	},
	{
		name: "local",
		desc: "Use local resource simulations",
	},
	{
		name: "persist-to",
		desc: "Directory holding local persisted state (default: ~/.config/cloudflare/state)",
	},
	{ name: "help", alias: "h", desc: "Show help" },
	{ name: "version", alias: "v", desc: "Show version" },
];

function loadCommands(): CommandMeta[] {
	const meta = loadMeta(import.meta.url, "commands.json", isCommandsMetadata);
	return meta?.commands ?? [];
}

/**
 * Get the one-line description shown next to a command in shell completions.
 * Prefers the OpenAPI summary and falls back to the full description.
 */
export function getCompletionDescription(command: CommandMeta): string {
	return command.summary ?? command.description ?? "";
}

/**
 * Walk the registered commands and feed tab's tree builder.
 *
 * Tab calls `t.command("foo bar baz", desc)` to register every leaf
 * and intermediate node. We register:
 *
 *   - Every hand-written command path (including top-level groups).
 *   - Every generated command in `commands.json` plus every parent
 *     prefix along its `fullPath` so the intermediate groups appear
 *     in TAB output even though they don't carry their own metadata.
 *   - Command aliases as sibling leaves with the canonical leaf's options.
 *   - Per-command options and aliases, with `choices` arrays wired into tab's
 *     `complete => candidates.forEach(c => complete(c, c))` handler so
 *     enum-valued flags (e.g. `--type {A|AAAA|CNAME|…}`) complete.
 */
function registerOptions(node: Command, options: OptionMeta[]): void {
	for (const opt of options) {
		const aliases =
			opt.alias === undefined
				? []
				: Array.isArray(opt.alias)
					? opt.alias
					: [opt.alias];
		for (const name of new Set([opt.name, ...aliases])) {
			if (opt.enum && opt.enum.length > 0) {
				node.option(name, opt.description ?? "", (complete) => {
					for (const choice of opt.enum ?? []) {
						complete(choice, choice);
					}
				});
			} else {
				node.option(name, opt.description ?? "");
			}
		}
	}
}

/** Register metadata-backed command and option completions. */
export function registerCompletions(
	root: RootCommand,
	commands: CommandMeta[]
): void {
	// Register global flags on the root so they complete on every command.
	for (const flag of GLOBAL_FLAGS) {
		root.option(flag.name, flag.desc);
		if (flag.alias) {
			root.option(flag.alias, `Alias for --${flag.name}`);
		}
	}

	// Commands metadata: every leaf + every prefix along fullPath.
	const registered = new Set<string>();
	for (const cmd of commands) {
		if (cmd.hideCommand) {
			continue;
		}

		const parentPath = cmd.fullPath.slice(0, -1);
		const commandPaths = [
			cmd.fullPath,
			...(cmd.aliases ?? []).map((alias) => [...parentPath, alias]),
		];
		for (const commandPath of commandPaths) {
			// Register each prefix as a group node so tab can complete
			// `cf dns <TAB>` → `records` even though `dns records` has
			// no row of its own.
			for (let i = 1; i < commandPath.length; i++) {
				const prefix = commandPath.slice(0, i).join(" ");
				if (!registered.has(prefix)) {
					registered.add(prefix);
					root.command(prefix, "");
				}
			}

			const commandName = commandPath.join(" ");
			registered.add(commandName);
			const node = root.command(commandName, getCompletionDescription(cmd));
			registerOptions(node, cmd.options ?? []);
		}
	}
}

function setupCompletions(): void {
	registerCompletions(t, loadCommands());
}

interface CompleteArgs {
	shell?: "bash" | "zsh" | "fish" | "powershell";
	_?: unknown[];
}

const completeCommand: CommandModule<object, CompleteArgs> & {
	describe: string;
} = {
	command: "complete [shell]",
	describe: "Generate and handle shell completions",

	builder: (yargs) =>
		yargs
			.positional("shell", {
				type: "string",
				choices: ["bash", "zsh", "fish", "powershell"] as const,
				description: "Shell type to generate completions for",
			})
			.example(
				"cf complete bash >> ~/.bashrc",
				"Install bash completions (then restart your shell)"
			)
			.example(
				"cf complete zsh >> ~/.zshrc",
				"Install zsh completions (then restart your shell)"
			)
			.example(
				"cf complete fish > ~/.config/fish/completions/cf.fish",
				"Install fish completions"
			),

	handler: (argv) => {
		// Shells call back at completion time with `cf complete -- <words…>`.
		// Yargs collapses everything after `--` into argv._; the first
		// entry is the literal command name when invoked positionally.
		const rawArgs = (argv._ ?? []).map(String);
		const completionArgs = rawArgs.slice(rawArgs[0] === "complete" ? 1 : 0);

		if (completionArgs.length > 0) {
			setupCompletions();
			t.parse(completionArgs);
			return;
		}

		const shell = argv.shell;
		if (!shell) {
			// No shell selected and no completion request → print usage
			// hint to stderr and exit non-zero so a misuse doesn't
			// silently no-op in a script.
			process.stderr.write(
				"Usage: cf complete <bash|zsh|fish|powershell>\n" +
					"       cf complete bash >> ~/.bashrc\n"
			);
			process.exitCode = 1;
			return;
		}

		return runWithTelemetry(
			{ command: "complete", recordArgs: false },
			argv as Record<string, unknown>,
			() => {
				setupCompletions();
				t.setup("cf", "cf", shell);
			}
		);
	},
};

export default completeCommand;
