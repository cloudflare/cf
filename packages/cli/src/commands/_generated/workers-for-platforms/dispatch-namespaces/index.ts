import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $scripts from "./scripts/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * dispatch-namespaces command group
 * @generated from apis/overlays/workers-for-platforms.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "dispatch-namespaces",
	describe: "Operations for dispatch-namespaces",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($get)
			.command($list)
			.command($scripts)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
