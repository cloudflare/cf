import $cmb from "./cmb/index.js";
import $retention from "./retention/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * control command group
 * @generated from apis/overlays/logs.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "control",
	describe: "Log control operations",

	builder: (yargs) => {
		return yargs
			.command($cmb)
			.command($retention)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
