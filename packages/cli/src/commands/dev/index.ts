/**
 * `cf dev` — delegating dev-server command.
 *
 * cf does not run a dev server itself. It first uses autoconfig to route to a
 * detected framework command. Otherwise it discovers an allowlisted
 * Cloudflare implementation from the project's npm, PyPI, or Cargo manifest
 * and spawns its delegate with inherited stdio and forwarded signals.
 */
import { assertProjectCommandsAvailable } from "@cloudflare/autoconfig";
import { prepareProject, runProjectCommand } from "../../lib/autoconfig.js";
import { CliExit } from "../../lib/cli-exit.js";
import { theme } from "../../lib/ui/index.js";
import { resolveProjectImpl, validateVitePluginCompatibility } from "./impl.js";
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
	implArgs?: string[];
	"--"?: string[];
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
					describe: "Arguments forwarded to the selected development server",
				})
				// Forward unknown flags to the impl. Without this, yargs'
				// global `.strict()` (set in src/index.ts) would reject any
				// flag that isn't a cf-defined option, defeating the
				// "everything after `cf dev` goes to the impl" contract.
				.parserConfiguration({
					"unknown-options-as-args": true,
					"populate--": true,
					"parse-positional-numbers": false,
					// Don't camelCase forwarded args — the impl is responsible
					// for its own flag parsing and we shouldn't double-translate.
					"camel-case-expansion": false,
				})
				.epilogue(
					`cf dev starts the appropriate development server for your project. ` +
						`It runs your framework's dev command when available, falling back to an installed Cloudflare dev server.\n\n` +
						`Arguments are forwarded to the selected development server. ` +
						`Supported arguments depend on that server. ` +
						`Use ${theme.brand("--")} to separate server arguments from cf options; ` +
						`it does not bypass server validation. ` +
						`${theme.brand("--mode")} is forwarded when the selected framework supports it.`
				) as Argv<DevArgs>
		);
	},

	handler: async (argv: ArgumentsCamelCase<DevArgs>): Promise<void> => {
		const cwd = process.cwd();
		const { details } = await prepareProject(cwd);
		if (details) {
			assertProjectCommandsAvailable(details);
		}
		validateVitePluginCompatibility(cwd, details?.nodeModulesPaths);

		const implArgs = [...(argv.implArgs ?? []), ...(argv["--"] ?? [])];
		const modeArgs = argv.mode ? ["--mode", argv.mode] : [];
		const profileEnv: Record<string, string> =
			argv.profile !== undefined
				? { CLOUDFLARE_AUTH_PROFILE: argv.profile }
				: {};
		if (details?.devCommand) {
			if (argv.mode && !details.framework?.supportsMode) {
				throw new Error(
					`The detected command \`${details.devCommand}\` does not currently support \`--mode\`.`
				);
			}
			const result = await runProjectCommand(details.devCommand, cwd, {
				preferLocal: true,
				nodeModulesPaths: details.nodeModulesPaths,
				env: { ...details.env, ...profileEnv },
				args: [...modeArgs, ...implArgs],
				output: "inherit",
			});
			throw new CliExit(result.exitCode, { signal: result.signal });
		}

		const picked = resolveProjectImpl(cwd);

		// Spawn and propagate the impl's exit code and termination signal.
		// CliExit flows up to main() which lets bin/cf map to process.exit(code).
		const result = await spawnImpl(picked, "dev", [...modeArgs, ...implArgs], {
			env: profileEnv,
			output: "inherit",
		});
		throw new CliExit(result.exitCode, { signal: result.signal });
	},
};

export default devCommand;
