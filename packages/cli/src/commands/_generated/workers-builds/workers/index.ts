import $migratetopreviews from "./migrate-to-previews.js";
import $previews from "./previews/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * workers command group
 * @generated from apis/overlays/workers-builds.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "workers",
	describe: "Operations for workers",

	builder: (yargs) => {
		return yargs
			.command($migratetopreviews)
			.command($previews)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
