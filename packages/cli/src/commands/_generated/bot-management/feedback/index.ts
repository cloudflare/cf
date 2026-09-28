import $create from "./create.js";
import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * feedback command group
 * @generated from apis/overlays/bot-management.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "feedback",
	describe: "Operations for feedback",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($list)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
