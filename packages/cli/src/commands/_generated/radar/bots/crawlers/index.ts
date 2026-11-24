import $summary from "./summary.js";
import $timeseriesgroups from "./timeseries-groups.js";
/**
 * crawlers command group
 * @generated from apis/overlays/radar.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "crawlers",
	describe: "Operations for bots.crawlers",

	routes: {
		summary: $summary,
		"timeseries-groups": $timeseriesgroups,
	},
});

export default command;
