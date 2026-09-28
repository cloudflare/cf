import $list from "./list.js";
import $managed from "./managed/index.js";
import $user from "./user/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * labels command group
 * @generated from apis/overlays/web-assets.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "labels",
	describe: "Operations for labels",

	builder: (yargs) => {
		return yargs
			.command($list)
			.command($managed)
			.command($user)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
