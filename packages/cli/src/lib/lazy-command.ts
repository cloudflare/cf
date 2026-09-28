import type { CommandTelemetryMeta } from "./telemetry/run.js";
/**
 * Lazy command registration.
 *
 * Wraps a deferred CommandModule import so the underlying code is only
 * loaded when yargs needs to parse or run the command. The shell exposes
 * the eager `command` + `describe` strings yargs needs at registration
 * time and forwards everything else to the real module.
 *
 * Without this, every CLI invocation eagerly chains through
 * `commands/_generated/index.ts` → ~110 product index files → ~600 leaf
 * command modules → the Cloudflare SDK + lib helpers, even for fast paths
 * like `cf --help`, `cf --version`, or `cf <product> --help`. With it,
 * each invocation only loads the modules along the chosen command path.
 */
import type { Argv, CommandModule } from "yargs";

/**
 * A function that imports a yargs command module on demand. The returned
 * module must expose a CommandModule as its default export.
 */
export type LazyCommandImporter<T = object, U = object> = () => Promise<{
	default: CommandModule<T, U>;
}>;

/**
 * Build a deferred CommandModule shell. Yargs registers the shell with
 * the supplied `command` + `describe` strings, but the real module is
 * only imported when the user actually navigates into the command (yargs
 * awaits the async builder/handler).
 *
 * The shell deliberately does NOT cache the import itself — modules are
 * cached by the host module loader (Node ESM / the bundler runtime), so
 * repeated `await importer()` calls are cheap after the first one and
 * the shell stays stateless.
 *
 * `describe` accepts `string | false`; `false` matches yargs' "hide
 * this command from --help" semantic (no hidden hand-written commands
 * today, but the option is preserved for future use).
 *
 * Telemetry is required: pass metadata to report this shell's handler, or
 * `null` when the imported command reports itself or the
 * shell is a command group whose leaves report themselves. Group help is
 * reported by the CLI entrypoint after yargs renders it.
 *
 * The return type preserves whatever was passed in for `describe` so
 * callers can pass the result through `satisfies { describe: string }`
 * checks (the top-level CLI uses one to guarantee help text on every
 * surfaced hand-written command).
 */
export function lazyCommand<
	T = object,
	U = object,
	D extends string | false = string,
>(
	command: string,
	describe: D,
	importer: LazyCommandImporter<T, U>,
	telemetry: CommandTelemetryMeta | null
): CommandModule<T, U> & { describe: D } {
	return {
		command,
		describe,
		builder: async (yargs) => {
			const mod = await importer();
			const builder = mod.default.builder;
			if (typeof builder === "function") {
				return builder(yargs);
			}
			// No builder on the real module — yargs treats this as a leaf
			// command with no options of its own.
			return yargs as unknown as Argv<U>;
		},
		handler: async (argv) => {
			const mod = await importer();
			if (telemetry === null) {
				await mod.default.handler(argv);
				return;
			}
			const { runWithTelemetry } = await import("./telemetry/run.js");
			await runWithTelemetry(telemetry, argv as Record<string, unknown>, () =>
				mod.default.handler(argv)
			);
		},
	};
}
