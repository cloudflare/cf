import $edit from "./edit.js";
import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * origin-max-http-version command group
 * @generated from apis/overlays/zones.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "origin-max-http-version",
	describe: "Origin Max Http Version operations",

	builder: (yargs) => {
		return yargs
			.command($edit)
			.command($get)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
