import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * events command group
 * @generated from apis/overlays/realtime.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "events",
	describe: "Supported events for RealtimeKit webhooks",

	builder: (yargs) => {
		return yargs.command($list).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
