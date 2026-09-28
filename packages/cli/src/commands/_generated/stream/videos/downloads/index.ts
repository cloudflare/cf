import $create from "./create.js";
import $delete from "./delete.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * downloads command group
 * @generated from apis/overlays/stream.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "downloads",
	describe: "Operations for videos.downloads",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
