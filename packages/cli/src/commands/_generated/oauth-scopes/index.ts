import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * oauth-scopes command
 * @generated from apis/overlays/oauth-scopes.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "oauth-scopes",
	describe: "oauth-scopes",

	builder: (yargs) => {
		return yargs.command($list).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
