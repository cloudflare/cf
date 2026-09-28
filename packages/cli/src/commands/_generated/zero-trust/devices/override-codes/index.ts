import $create from "./create.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * override-codes command group
 * @generated from apis/overlays/zero-trust.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "override-codes",
	describe: "Operations for devices.override-codes",

	builder: (yargs) => {
		return yargs
			.command($create)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
