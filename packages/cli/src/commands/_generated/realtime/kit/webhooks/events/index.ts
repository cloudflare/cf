import $list from "./list.js";
/**
 * events command group
 * @generated from apis/overlays/realtime.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "events",
	describe: "Supported events for RealtimeKit webhooks",

	routes: {
		list: $list,
	},
});

export default command;
