import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * organizations command group
 * @generated from apis/overlays/accounts.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "organizations",
	describe: "View organizations associated with a Cloudflare account",

	builder: (yargs) => {
		return yargs.command($list).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
