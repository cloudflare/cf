import $create from "./create.js";
import $delete from "./delete.js";
import $edit from "./edit.js";
import $events from "./events/index.js";
import $get from "./get.js";
import $list from "./list.js";
import $replace from "./replace.js";
/**
 * webhooks command group
 * @generated from apis/overlays/realtime.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "webhooks",
	describe:
		"Webhook endpoints and supported events for RealtimeKit notifications",

	routes: {
		create: $create,
		delete: $delete,
		edit: $edit,
		get: $get,
		list: $list,
		replace: $replace,
		events: $events,
	},
});

export default command;
