import $configs from "./configs/index.js";
import $list from "./list.js";
import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * history command group
 * @generated from apis/overlays/zaraz.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "history",
	describe:
		"Configuration version history — browse and restore previous Zaraz configurations",

	builder: (yargs) => {
		return yargs
			.command($list)
			.command($update)
			.command($configs)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
