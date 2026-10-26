import $access from "./access/index.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $populate from "./populate.js";
import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * datasets command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "datasets",
	describe: "Operations for threat-intel.datasets",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($get)
			.command($list)
			.command($populate)
			.command($update)
			.command($access)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
