import $actors from "./actors/index.js";
import $categories from "./categories/index.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $indicators from "./indicators/index.js";
import $list from "./list.js";
import $relationships from "./relationships/index.js";
import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * tags command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "tags",
	describe: "Operations for threat-intel.tags",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($get)
			.command($list)
			.command($update)
			.command($actors)
			.command($categories)
			.command($indicators)
			.command($relationships)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
