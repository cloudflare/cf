import $summary from "./summary.js";
import $timeseriesgroups from "./timeseries-groups.js";
import $timeseries from "./timeseries.js";
import $top from "./top/index.js";
/**
 * layer3 command group
 * @generated from apis/overlays/radar.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "layer3",
	describe: "Operations for attacks.layer3",

	routes: {
		summary: $summary,
		timeseries: $timeseries,
		"timeseries-groups": $timeseriesgroups,
		top: $top,
	},
});

export default command;
