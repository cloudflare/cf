import $create from "./create.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * miscategorizations command group
 * @generated from apis/overlays/intel.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "miscategorizations",
	describe: "Report and track domain miscategorization corrections",

	builder: (yargs) => {
		return yargs
			.command($create)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
