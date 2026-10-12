import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $subscriptions from "./subscriptions/index.js";
import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * streams command group
 * @generated from apis/overlays/k2.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "streams",
	describe:
		"K2 streams, their retention, and the HTTP and Workers binding inputs used to produce records",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($get)
			.command($list)
			.command($update)
			.command($subscriptions)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
