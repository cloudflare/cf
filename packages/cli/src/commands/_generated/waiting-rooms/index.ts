import $accountwaitingrooms from "./account-waiting-rooms/index.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $edit from "./edit.js";
import $events from "./events/index.js";
import $get from "./get.js";
import $page from "./page/index.js";
import $rules from "./rules/index.js";
import $settings from "./settings/index.js";
import $statuses from "./statuses/index.js";
import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * waiting-rooms command
 * @generated from apis/overlays/waiting-rooms.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "waiting-rooms",
	describe:
		"Virtual queues that throttle traffic to your site during peak demand with customizable waiting pages",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($edit)
			.command($get)
			.command($update)
			.command($accountwaitingrooms)
			.command($events)
			.command($page)
			.command($rules)
			.command($settings)
			.command($statuses)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
