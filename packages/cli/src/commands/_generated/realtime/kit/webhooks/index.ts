import $create from "./create.js";
import $delete from "./delete.js";
import $edit from "./edit.js";
import $events from "./events/index.js";
import $get from "./get.js";
import $list from "./list.js";
import $replace from "./replace.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * webhooks command group
 * @generated from apis/overlays/realtime.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "webhooks",
	describe:
		"Webhook endpoints and supported events for RealtimeKit notifications",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($edit)
			.command($get)
			.command($list)
			.command($replace)
			.command($events)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
