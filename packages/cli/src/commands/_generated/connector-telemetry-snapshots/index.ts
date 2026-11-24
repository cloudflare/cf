import $get from "./get.js";
import $list from "./list.js";
/**
 * connector-telemetry-snapshots command
 * @generated from apis/overlays/connector-telemetry-snapshots.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "connector-telemetry-snapshots",
	describe: "connector-telemetry-snapshots",

	routes: {
		get: $get,
		list: $list,
	},
});

export default command;
