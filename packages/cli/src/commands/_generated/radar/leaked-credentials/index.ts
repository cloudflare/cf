import $summary from "./summary.js";
import $timeseriesgroups from "./timeseries-groups.js";
/**
 * leaked-credentials command group
 * @generated from apis/overlays/radar.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "leaked-credentials",
	describe: "Leaked credential detection trends and exposure statistics",

	routes: {
		summary: $summary,
		"timeseries-groups": $timeseriesgroups,
	},
});

export default command;
