import $create from "./create.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * tokens command group
 * @generated from apis/overlays/network-quality.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "tokens",
	describe: "Operations for tokens",

	builder: (yargs) => {
		return yargs
			.command($create)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
