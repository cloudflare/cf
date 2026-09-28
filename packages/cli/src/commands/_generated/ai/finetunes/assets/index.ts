import $create from "./create.js";
import $download from "./download.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * assets command group
 * @generated from apis/overlays/ai.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "assets",
	describe: "Operations for finetunes.assets",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($download)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
