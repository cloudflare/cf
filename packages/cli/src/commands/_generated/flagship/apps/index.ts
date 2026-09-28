import $create from "./create.js";
import $definitions from "./definitions/index.js";
import $delete from "./delete.js";
import $evaluate from "./evaluate/index.js";
import $flags from "./flags/index.js";
import $get from "./get.js";
import $list from "./list.js";
import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * apps command group
 * @generated from apis/overlays/flagship.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "apps",
	describe: "Operations for apps",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($get)
			.command($list)
			.command($update)
			.command($definitions)
			.command($evaluate)
			.command($flags)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
