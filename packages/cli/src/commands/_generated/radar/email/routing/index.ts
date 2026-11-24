import $summary from "./summary.js";
import $timeseriesgroups from "./timeseries-groups.js";
/**
 * routing command group
 * @generated from apis/overlays/radar.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "routing",
	describe: "Operations for email.routing",

	routes: {
		summary: $summary,
		"timeseries-groups": $timeseriesgroups,
	},
});

export default command;
