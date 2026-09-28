import $assets from "./assets/index.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $list from "./list.js";
import $public from "./public/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * finetunes command group
 * @generated from apis/overlays/ai.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "finetunes",
	describe: "Operations for finetunes",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($list)
			.command($assets)
			.command($public)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
