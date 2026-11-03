import $usagelimit from "./usage-limit/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * observability command
 * @generated from apis/overlays/observability.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "observability",
	describe: "observability",

	builder: (yargs) => {
		return yargs
			.command($usagelimit)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
