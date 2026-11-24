import $get from "./get.js";
/**
 * active command group
 * @generated from apis/overlays/realtime.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "active",
	describe: "Active recordings for RealtimeKit meetings",

	routes: {
		get: $get,
	},
});

export default command;
