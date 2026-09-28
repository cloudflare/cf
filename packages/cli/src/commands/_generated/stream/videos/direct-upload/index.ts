import $create from "./create.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * direct-upload command group
 * @generated from apis/overlays/stream.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "direct-upload",
	describe: "Operations for videos.direct-upload",

	builder: (yargs) => {
		return yargs
			.command($create)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
