import $get from "./get.js";
import $list from "./list.js";
import $maintenanceconfigs from "./maintenance-configs/index.js";
import $maintenanceruns from "./maintenance-runs/index.js";
/**
 * tables command group
 * @generated from apis/overlays/basin-catalog.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "tables",
	describe: "Tables within catalog namespaces",

	routes: {
		get: $get,
		list: $list,
		"maintenance-configs": $maintenanceconfigs,
		"maintenance-runs": $maintenanceruns,
	},
});

export default command;
