import $groups from "./groups/index.js";
import $permissions from "./permissions/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * access command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "access",
	describe: "Operations for threat-intel.datasets.access",

	builder: (yargs) => {
		return yargs
			.command($groups)
			.command($permissions)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
