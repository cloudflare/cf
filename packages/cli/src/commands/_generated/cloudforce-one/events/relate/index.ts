import $create from "./create/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * relate command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "relate",
	describe: "Operations for events.relate",

	builder: (yargs) => {
		return yargs
			.command($create)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
