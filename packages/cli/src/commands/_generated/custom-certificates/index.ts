import $create from "./create.js";
import $delete from "./delete.js";
import $edit from "./edit.js";
import $get from "./get.js";
import $list from "./list.js";
import $prioritize from "./prioritize/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * custom-certificates command
 * @generated from apis/overlays/custom-certificates.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "custom-certificates",
	describe: "custom-certificates",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($edit)
			.command($get)
			.command($list)
			.command($prioritize)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
