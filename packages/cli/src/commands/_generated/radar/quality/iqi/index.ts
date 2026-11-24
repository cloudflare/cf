import $summary from "./summary.js";
import $timeseriesgroups from "./timeseries-groups.js";
/**
 * iqi command group
 * @generated from apis/overlays/radar.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "iqi",
	describe: "Operations for quality.iqi",

	routes: {
		summary: $summary,
		"timeseries-groups": $timeseriesgroups,
	},
});

export default command;
