import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $status from "./status/index.js";
import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * worker command group
 * @generated from apis/overlays/zero-trust.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "worker",
	describe: "Data Loss Prevention - manage Worker validators",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($get)
			.command($list)
			.command($update)
			.command($status)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
