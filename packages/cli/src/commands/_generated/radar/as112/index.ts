import $summary from "./summary.js";
import $timeseriesgroups from "./timeseries-groups.js";
import $timeseries from "./timeseries.js";
import $top from "./top/index.js";
/**
 * as112 command group
 * @generated from apis/overlays/radar.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "as112",
	describe:
		"AS112 DNS sinkhole statistics — reverse DNS query volumes for private address space",

	routes: {
		summary: $summary,
		timeseries: $timeseries,
		"timeseries-groups": $timeseriesgroups,
		top: $top,
	},
});

export default command;
