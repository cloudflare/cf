import $summary from "./summary.js";
import $timeseriesgroups from "./timeseries-groups.js";
/**
 * origin command group
 * @generated from apis/overlays/radar.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "origin",
	describe: "Operations for post-quantum.origin",

	routes: {
		summary: $summary,
		"timeseries-groups": $timeseriesgroups,
	},
});

export default command;
