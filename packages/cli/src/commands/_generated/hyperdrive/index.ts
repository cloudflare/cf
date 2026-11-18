import $create from "./create.js";
import $delete from "./delete.js";
import $edit from "./edit.js";
import $get from "./get.js";
import $integration from "./integration/index.js";
import $list from "./list.js";
import $replace from "./replace.js";
import $restart from "./restart.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * hyperdrive command
 * @generated from apis/overlays/hyperdrive.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "hyperdrive",
	describe:
		"Accelerate access to existing databases by caching queries and pooling connections at the edge",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($edit)
			.command($get)
			.command($list)
			.command($replace)
			.command($restart)
			.command($integration)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
