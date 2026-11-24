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
/**
 * waiting-rooms command
 * @generated from apis/overlays/waiting-rooms.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "waiting-rooms",
	describe:
		"Virtual queues that throttle traffic to your site during peak demand with customizable waiting pages",

	routes: {
		create: $create,
		delete: $delete,
		edit: $edit,
		get: $get,
		update: $update,
		"account-waiting-rooms": $accountwaitingrooms,
		events: $events,
		page: $page,
		rules: $rules,
		settings: $settings,
		statuses: $statuses,
	},
});

export default command;
