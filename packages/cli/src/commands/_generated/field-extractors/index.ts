import $delete from "./delete.js";
import $get from "./get.js";
import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * field-extractors command
 * @generated from apis/overlays/field-extractors.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "field-extractors",
	describe: "field-extractors",

	builder: (yargs) => {
		return yargs
			.command($delete)
			.command($get)
			.command($update)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
