import $bulkcreate from "./bulk-create.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $relationships from "./relationships/index.js";
import $tags from "./tags/index.js";
import $types from "./types/index.js";
import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * indicators command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "indicators",
	describe: "Operations for threat-intel.indicators",

	builder: (yargs) => {
		return yargs
			.command($bulkcreate)
			.command($create)
			.command($delete)
			.command($get)
			.command($list)
			.command($update)
			.command($relationships)
			.command($tags)
			.command($types)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
