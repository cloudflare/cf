import $create from "./create.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * trial command group
 * @generated from apis/overlays/brand-protection.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "trial",
	describe: "Operations for trial",

	builder: (yargs) => {
		return yargs
			.command($create)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
