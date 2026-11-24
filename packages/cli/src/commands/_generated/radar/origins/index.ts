import $get from "./get.js";
import $list from "./list.js";
import $summary from "./summary.js";
import $timeseriesgroups from "./timeseries-groups.js";
import $timeseries from "./timeseries.js";
/**
 * origins command group
 * @generated from apis/overlays/radar.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "origins",
	describe:
		"Cloud and hosting origin providers (e.g. Amazon, by region) and their traffic metrics",

	routes: {
		get: $get,
		list: $list,
		summary: $summary,
		timeseries: $timeseries,
		"timeseries-groups": $timeseriesgroups,
	},
});

export default command;
