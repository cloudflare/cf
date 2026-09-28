import $create from "./create/index.js";
import $delete from "./delete/index.js";
import $get from "./get/index.js";
import $list from "./list/index.js";
import $update from "./update/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * assets command group
 * @generated from apis/overlays/custom-pages.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "assets",
	describe: "Manage account- and zone-level custom assets",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($get)
			.command($list)
			.command($update)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
