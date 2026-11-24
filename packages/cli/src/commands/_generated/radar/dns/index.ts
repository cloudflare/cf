import $summary from "./summary.js";
import $timeseriesgroups from "./timeseries-groups.js";
import $timeseries from "./timeseries.js";
import $top from "./top/index.js";
/**
 * dns command group
 * @generated from apis/overlays/radar.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "dns",
	describe:
		"Global DNS query trends — top domains, resolver stats, and DNSSEC adoption",

	routes: {
		summary: $summary,
		timeseries: $timeseries,
		"timeseries-groups": $timeseriesgroups,
		top: $top,
	},
});

export default command;
