import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $ingresses from "./ingresses/index.js";
import $list from "./list.js";
import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * sinkholes command group
 * @generated from apis/overlays/intel.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "sinkholes",
	describe: "Operations for sinkholes",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($get)
			.command($list)
			.command($update)
			.command($ingresses)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
