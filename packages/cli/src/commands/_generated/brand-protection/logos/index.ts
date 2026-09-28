import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * logos command group
 * @generated from apis/overlays/brand-protection.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "logos",
	describe: "Operations for logos",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($get)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
