import $get from "./get.js";
import $queue from "./queue.js";
import $update from "./update.js";
/**
 * maintenance-configs command group
 * @generated from apis/overlays/basin-catalog.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "maintenance-configs",
	describe: "Table-level maintenance configurations and operations",

	routes: {
		get: $get,
		queue: $queue,
		update: $update,
	},
});

export default command;
