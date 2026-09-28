import $prefix_bindings from "./prefix_bindings/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * regional_services command group
 * @generated from apis/overlays/dls.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "regional_services",
	describe: "Operations for regional_services",

	builder: (yargs) => {
		return yargs
			.command($prefix_bindings)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
