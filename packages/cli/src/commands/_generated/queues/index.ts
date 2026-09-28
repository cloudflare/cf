import $consumers from "./consumers/index.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $edit from "./edit.js";
import $get from "./get.js";
import $list from "./list.js";
import $messages from "./messages/index.js";
import $metrics from "./metrics/index.js";
import $purge from "./purge/index.js";
import $subscriptions from "./subscriptions/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * queues command
 * @generated from apis/overlays/queues.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "queues",
	describe:
		"Reliable message queuing between Workers — produce, consume, and batch-process messages at scale",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($edit)
			.command($get)
			.command($list)
			.command($consumers)
			.command($messages)
			.command($metrics)
			.command($purge)
			.command($subscriptions)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
