import $grant from "./grant.js";
import $list from "./list.js";
import $revoke from "./revoke.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * permissions command group
 * @generated from apis/overlays/intel.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "permissions",
	describe: "Operations for indicator-feeds.permissions",

	builder: (yargs) => {
		return yargs
			.command($grant)
			.command($list)
			.command($revoke)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
