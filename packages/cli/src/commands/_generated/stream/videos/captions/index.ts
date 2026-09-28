import $language from "./language/index.js";
import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * captions command group
 * @generated from apis/overlays/stream.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "captions",
	describe: "Operations for videos.captions",

	builder: (yargs) => {
		return yargs
			.command($list)
			.command($language)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
