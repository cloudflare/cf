import $create from "./create.js";
import $delete from "./delete.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * references command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "references",
	describe: "Operations for threat-intel.events.legacy.references",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
