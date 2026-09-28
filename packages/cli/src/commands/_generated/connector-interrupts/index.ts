import $create from "./create.js";
import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * connector-interrupts command
 * @generated from apis/overlays/connector-interrupts.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "connector-interrupts",
	describe: "connector-interrupts",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($list)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
