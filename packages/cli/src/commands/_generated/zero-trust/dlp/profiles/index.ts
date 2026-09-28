import $custom from "./custom/index.js";
import $get from "./get.js";
import $list from "./list.js";
import $predefined from "./predefined/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * profiles command group
 * @generated from apis/overlays/zero-trust.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "profiles",
	describe: "Data Loss Prevention - list and retrieve profiles",

	builder: (yargs) => {
		return yargs
			.command($get)
			.command($list)
			.command($custom)
			.command($predefined)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
