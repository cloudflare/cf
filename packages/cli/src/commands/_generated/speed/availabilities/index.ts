import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * availabilities command group
 * @generated from apis/overlays/speed.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "availabilities",
	describe:
		"Check which speed test regions and configurations are available for your zone",

	builder: (yargs) => {
		return yargs.command($list).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
