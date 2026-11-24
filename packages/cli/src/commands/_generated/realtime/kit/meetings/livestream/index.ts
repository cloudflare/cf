import $get from "./get.js";
import $listactive from "./list-active.js";
/**
 * livestream command group
 * @generated from apis/overlays/realtime.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "livestream",
	describe: "Livestream operations associated with RealtimeKit meetings",

	routes: {
		get: $get,
		"list-active": $listactive,
	},
});

export default command;
