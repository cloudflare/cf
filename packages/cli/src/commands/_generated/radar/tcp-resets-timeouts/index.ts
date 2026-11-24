import $summary from "./summary.js";
import $timeseriesgroups from "./timeseries-groups.js";
/**
 * tcp-resets-timeouts command group
 * @generated from apis/overlays/radar.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "tcp-resets-timeouts",
	describe:
		"TCP connection reset and timeout statistics indicating network health issues",

	routes: {
		summary: $summary,
		"timeseries-groups": $timeseriesgroups,
	},
});

export default command;
