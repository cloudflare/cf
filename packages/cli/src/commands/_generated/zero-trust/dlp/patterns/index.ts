import $validate from "./validate.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * patterns command group
 * @generated from apis/overlays/zero-trust.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "patterns",
	describe:
		"Data Loss Prevention - validate regular expressions used for content detection",

	builder: (yargs) => {
		return yargs
			.command($validate)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
