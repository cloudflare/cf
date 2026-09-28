import $activate from "./activate.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * zone command
 * @generated from apis/overlays/zone.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "zone",
	describe: "zone",

	builder: (yargs) => {
		return yargs
			.command($activate)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
