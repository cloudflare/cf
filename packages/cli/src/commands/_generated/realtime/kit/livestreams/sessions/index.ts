import $get from "./get.js";
import $listactive from "./list-active.js";
/**
 * sessions command group
 * @generated from apis/overlays/realtime.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "sessions",
	describe: "Sessions for RealtimeKit livestreams",

	routes: {
		get: $get,
		"list-active": $listactive,
	},
});

export default command;
