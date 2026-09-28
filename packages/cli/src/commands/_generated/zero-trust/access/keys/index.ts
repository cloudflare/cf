import $get from "./get.js";
import $rotate from "./rotate.js";
import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * keys command group
 * @generated from apis/overlays/zero-trust.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "keys",
	describe: "Operations for access.keys",

	builder: (yargs) => {
		return yargs
			.command($get)
			.command($rotate)
			.command($update)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
