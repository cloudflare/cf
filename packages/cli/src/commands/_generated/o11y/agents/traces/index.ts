import $events from "./events.js";
import $get from "./get.js";
import $list from "./list.js";
/**
 * traces command group
 * @generated from apis/overlays/o11y.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "traces",
	describe: "Operations for agents.traces",

	routes: {
		events: $events,
		get: $get,
		list: $list,
	},
});

export default command;
