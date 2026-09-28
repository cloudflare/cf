import $create from "./create.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * populate command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "populate",
	describe: "Operations for events.datasets.populate",

	builder: (yargs) => {
		return yargs
			.command($create)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
