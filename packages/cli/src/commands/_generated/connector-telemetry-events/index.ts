import $get from "./get.js";
import $list from "./list.js";
/**
 * connector-telemetry-events command
 * @generated from apis/overlays/connector-telemetry-events.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "connector-telemetry-events",
	describe: "connector-telemetry-events",

	routes: {
		get: $get,
		list: $list,
	},
});

export default command;
