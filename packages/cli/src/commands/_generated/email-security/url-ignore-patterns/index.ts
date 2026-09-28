import $batch from "./batch.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $edit from "./edit.js";
import $get from "./get.js";
import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * url-ignore-patterns command group
 * @generated from apis/overlays/email-security.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "url-ignore-patterns",
	describe: "Operations for url-ignore-patterns",

	builder: (yargs) => {
		return yargs
			.command($batch)
			.command($create)
			.command($delete)
			.command($edit)
			.command($get)
			.command($list)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
