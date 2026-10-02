import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * subscriptions command group
 * @generated from apis/overlays/k2.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "subscriptions",
	describe:
		"Subscriptions that consume a K2 stream, with committed-position lag",

	builder: (yargs) => {
		return yargs.command($list).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
