import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * crawlers command group
 * @generated from apis/overlays/pay-per-crawl.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "crawlers",
	describe: "Operations for crawlers",

	builder: (yargs) => {
		return yargs.command($list).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
