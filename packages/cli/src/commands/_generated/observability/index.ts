import $usagelimit from "./usage-limit/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * observability command
 * @generated from apis/overlays/observability.ts
 */
import type { CommandModule } from "yargs";
import $tail from "#commands/observability/tail/index.js";
import { withHandWrittenDryRun } from "#lib/hand-written-dry-run.js";

const command: CommandModule<CommonYargsOptions> = {
	command: "observability",
	describe: "observability",

	builder: (yargs) => {
		return yargs
			.command(withHandWrittenDryRun($tail, "native"))
			.command($usagelimit)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
