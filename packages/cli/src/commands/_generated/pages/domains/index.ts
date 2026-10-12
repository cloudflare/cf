import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $validation from "./validation/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * domains command group
 * @generated from apis/overlays/pages.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "domains",
	describe: "Operations for domains",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($get)
			.command($list)
			.command($validation)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
