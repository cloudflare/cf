import $config from "./config/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * cmb command group
 * @generated from apis/overlays/logs.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "cmb",
	describe: "Operations for control.cmb",

	builder: (yargs) => {
		return yargs
			.command($config)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
