import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * oauth-scopes command group
 * @generated from apis/overlays/iam.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "oauth-scopes",
	describe: "Operations for oauth-scopes",

	builder: (yargs) => {
		return yargs.command($list).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
