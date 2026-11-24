import $get from "./get.js";
import $update from "./update.js";
/**
 * maintenance-configs command group
 * @generated from apis/overlays/basin-catalog.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "maintenance-configs",
	describe:
		"Table maintenance settings — compaction schedules and snapshot expiration policies",

	routes: {
		get: $get,
		update: $update,
	},
});

export default command;
