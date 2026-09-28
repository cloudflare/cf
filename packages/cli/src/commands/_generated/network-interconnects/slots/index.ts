import $get from "./get.js";
import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * slots command group
 * @generated from apis/overlays/network-interconnects.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "slots",
	describe:
		"Available interconnect facility slots showing port capacity at Cloudflare data centers",

	builder: (yargs) => {
		return yargs
			.command($get)
			.command($list)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
