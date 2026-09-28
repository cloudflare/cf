import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * ips command
 * @generated from apis/overlays/ips.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "ips",
	describe: "ips",

	builder: (yargs) => {
		return yargs.command($list).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
