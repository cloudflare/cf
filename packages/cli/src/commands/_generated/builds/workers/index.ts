import $create from "./create.js";
import $delete from "./delete.js";
import $edit from "./edit.js";
import $get from "./get.js";
import $migratetopreviews from "./migrate-to-previews.js";
import $purgecache from "./purge-cache.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * workers command group
 * @generated from apis/overlays/builds.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "workers",
	describe: "Manage repository-backed build configuration for Workers.",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($edit)
			.command($get)
			.command($migratetopreviews)
			.command($purgecache)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
