import $configs from "./configs/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * advanced-tcp-protection command group
 * @generated from apis/overlays/magic-transit.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "advanced-tcp-protection",
	describe: "Advanced Tcp Protection operations",

	builder: (yargs) => {
		return yargs
			.command($configs)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
