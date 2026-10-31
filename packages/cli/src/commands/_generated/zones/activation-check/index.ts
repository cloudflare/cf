import $activate from "./activate.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * activation-check command group
 * @generated from apis/overlays/zones.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "activation-check",
	describe: "Operations for activation-check",

	builder: (yargs) => {
		return yargs
			.command($activate)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
