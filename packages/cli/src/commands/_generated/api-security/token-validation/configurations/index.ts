import $create from "./create.js";
import $credentials from "./credentials/index.js";
import $delete from "./delete.js";
import $edit from "./edit.js";
import $get from "./get.js";
import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * configurations command group
 * @generated from apis/overlays/api-security.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "configurations",
	describe: "Operations for token-validation.configurations",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($edit)
			.command($get)
			.command($list)
			.command($credentials)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
