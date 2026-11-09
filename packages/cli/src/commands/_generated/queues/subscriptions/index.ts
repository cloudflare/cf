import $create from "./create.js";
import $delete from "./delete.js";
import $edit from "./edit.js";
import $get from "./get.js";
import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * subscriptions command group
 * @generated from apis/overlays/queues.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "subscriptions",
	describe: "Manage queue subscriptions for event-driven message routing",

	builder: (yargs) => {
		return yargs
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
