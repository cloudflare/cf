import $configs from "./configs/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * advanced-dns-protection command group
 * @generated from apis/overlays/magic-transit.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "advanced-dns-protection",
	describe: "Advanced Dns Protection operations",

	builder: (yargs) => {
		return yargs
			.command($configs)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
