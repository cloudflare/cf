import $create from "./create.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * batch command group
 * @generated from apis/overlays/organization.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "batch",
	describe: "Operations for member.batch",

	builder: (yargs) => {
		return yargs
			.command($create)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
