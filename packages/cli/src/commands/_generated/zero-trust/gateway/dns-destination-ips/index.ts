import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * dns-destination-ips command group
 * @generated from apis/overlays/zero-trust.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "dns-destination-ips",
	describe: "Operations for gateway.dns-destination-ips",

	builder: (yargs) => {
		return yargs.command($list).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
