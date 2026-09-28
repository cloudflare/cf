import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $update from "./update.js";
import $validate from "./validate.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * custom-pages command group
 * @generated from apis/overlays/zero-trust.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "custom-pages",
	describe: "Operations for access.custom-pages",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($get)
			.command($list)
			.command($update)
			.command($validate)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
