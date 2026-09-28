/**
 * `cf dev` — delegating dev-server command.
 *
 * cf does not run a dev server itself. It first uses autoconfig to route to a
 * detected framework command. Otherwise it discovers an allowlisted
 * Cloudflare implementation from the project's npm, PyPI, or Cargo manifest
 * and spawns its delegate with inherited stdio and forwarded signals.
 */
import { prepareProject, runProjectCommand } from "../../lib/autoconfig.js";
import { CliExit } from "../../lib/cli-exit.js";
import { getCloudflareRegistryEnvironment } from "../../lib/registry.js";
import { theme } from "../../lib/ui/index.js";
import { resolveProjectImpl } from "./impl.js";
import { spawnImpl } from "./spawn.js";
import type { CommonYargsOptions } from "../../lib/cli-types.js";
import type { ArgumentsCamelCase, Argv, CommandModule } from "yargs";

interface DevArgs extends CommonYargsOptions {
	/**
	 * Variadic capture of every token after `cf dev`. yargs'
	 * `unknown-options-as-args` parser config means unknown flags are
	 * treated as positional args, so this catches both `--my-flag` and
	 * `bare-positional` arguments and forwards them verbatim to the
	 * impl. cf does not parse impl-specific flags.
	 */
	implArgs?: (string | number)[];
}

const devCommand: CommandModule<CommonYargsOptions, DevArgs> = {
	command: "dev [implArgs..]",
	describe: "Run the project's Cloudflare dev server",

	builder: (yargs: Argv): Argv<DevArgs> => {
		return (
			yargs
				.positional("implArgs", {
					type: "string",
					array: true,
					describe: "Arguments forwarded to the dev-server implementation",
				})
				// Forward unknown flags to the impl. Without this, yargs'
				// global `.strict()` (set in src/index.ts) would reject any
				// flag that isn't a cf-defined option, defeating the
				// "everything after `cf dev` goes to the impl" contract.
				.parserConfiguration({
					"unknown-options-as-args": true,
					// Don't camelCase forwarded args — the impl is responsible
					// for its own flag parsing and we shouldn't double-translate.
					"camel-case-expansion": false,
				})
				.epilogue(
					`cf dev starts the appropriate development server for your project. ` +
						`It runs your framework's dev command when available, falling back to an installed Cloudflare dev server.\n\n` +
						`Only ${theme.brand("--mode")} is forwarded to supported framework development servers. ` +
						`Other arguments are forwarded only to Cloudflare dev-server implementations.`
				) as Argv<DevArgs>
		);
	},

	handler: async (argv: ArgumentsCamelCase<DevArgs>): Promise<void> => {
		const cwd = process.cwd();
		const { details } = await prepareProject(cwd);

		// Coerce yargs' (string | number)[] back to string[] for the
		// child_process call. Numbers come from yargs auto-detecting
		// numeric positional values (e.g. `cf dev --port 8080` after
		// the parser turns `--port` into a positional pair); we
		// stringify on the way through because the impl expects argv
		// to be strings.
		const implArgs = (argv.implArgs ?? []).map(String);
		const modeArgs = argv.mode ? ["--mode", argv.mode] : [];
		if (details?.devCommand) {
			if (implArgs.length > 0) {
				throw new Error(
					`Arguments cannot currently be forwarded to the detected dev command \`${details.devCommand}\`. Run that command directly with the required arguments.`
				);
			}
			if (argv.mode && !details.framework?.supportsMode) {
				throw new Error(
					`The detected command \`${details.devCommand}\` does not currently support \`--mode\`.`
				);
			}
			const result = await runProjectCommand(details.devCommand, cwd, {
				env: {
					...details.env,
					...getCloudflareRegistryEnvironment(),
				},
				args: modeArgs,
			});
			throw new CliExit(result.exitCode, { signal: result.signal });
		}

		const picked = resolveProjectImpl(cwd);

		// Spawn and propagate the impl's exit code and termination signal.
		// CliExit flows up to main() which lets bin/cf map to process.exit(code).
		const result = await spawnImpl(picked, "dev", [...modeArgs, ...implArgs]);
		throw new CliExit(result.exitCode, { signal: result.signal });
	},
};

export default devCommand;
