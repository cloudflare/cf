import $routes from "./routes/index.js";
import $subnets from "./subnets/index.js";
import $virtualnetworks from "./virtual-networks/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * network command
 * @generated from apis/overlays/network.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "network",
	describe: "network",

	builder: (yargs) => {
		return yargs
			.command($routes)
			.command($subnets)
			.command($virtualnetworks)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
