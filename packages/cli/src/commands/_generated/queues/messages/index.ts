import $ack from "./ack.js";
import $bulkpush from "./bulk-push.js";
import $extendleases from "./extend-leases.js";
import $peek from "./peek.js";
import $pull from "./pull.js";
import $purge from "./purge.js";
import $push from "./push.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * messages command group
 * @generated from apis/overlays/queues.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "messages",
	describe:
		"Push messages to a queue and pull or acknowledge them from consumers",

	builder: (yargs) => {
		return yargs
			.command($ack)
			.command($bulkpush)
			.command($extendleases)
			.command($peek)
			.command($pull)
			.command($purge)
			.command($push)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
