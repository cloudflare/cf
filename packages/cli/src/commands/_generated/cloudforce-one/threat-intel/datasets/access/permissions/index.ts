import $create from "./create.js";
import $delete from "./delete.js";
import $list from "./list.js";
import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * permissions command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "permissions",
	describe: "Operations for threat-intel.datasets.access.permissions",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($list)
			.command($update)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
