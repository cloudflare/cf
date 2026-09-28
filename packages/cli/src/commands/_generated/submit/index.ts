import $create from "./create.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * submit command
 * @generated from apis/overlays/submit.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "submit",
	describe: "submit",

	builder: (yargs) => {
		return yargs
			.command($create)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
