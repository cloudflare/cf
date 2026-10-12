import $prefixbindings from "./prefix-bindings/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * regional-services command group
 * @generated from apis/overlays/dls.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "regional-services",
	describe: "Operations for regional-services",

	builder: (yargs) => {
		return yargs
			.command($prefixbindings)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
