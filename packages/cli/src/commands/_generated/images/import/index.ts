import $abort from "./abort.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $logs from "./logs.js";
import $progress from "./progress.js";
import $sources from "./sources/index.js";
import $start from "./start.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * import command group
 * @generated from apis/overlays/images.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "import",
	describe: "Import images from S3",

	builder: (yargs) => {
		return yargs
			.command($abort)
			.command($create)
			.command($delete)
			.command($get)
			.command($list)
			.command($logs)
			.command($progress)
			.command($start)
			.command($sources)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
