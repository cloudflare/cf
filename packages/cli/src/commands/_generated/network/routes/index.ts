import $cidr from "./cidr/index.js";
import $hostname from "./hostname/index.js";
import $resolve from "./resolve.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * routes command group
 * @generated from apis/overlays/network.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "routes",
	describe: "Operations for routes",

	builder: (yargs) => {
		return yargs
			.command($resolve)
			.command($cidr)
			.command($hostname)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
