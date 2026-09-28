import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $repos from "./repos/index.js";
import $tokens from "./tokens/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * namespaces command group
 * @generated from apis/overlays/artifacts.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "namespaces",
	describe: "Operations for namespaces",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($get)
			.command($list)
			.command($repos)
			.command($tokens)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
