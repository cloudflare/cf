import $create from "./create.js";
import $delete from "./delete.js";
import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * members command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "members",
	describe: "Operations for threat-intel.datasets.access.groups.members",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($list)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
