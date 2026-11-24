import $crawlers from "./crawlers/index.js";
import $get from "./get.js";
import $list from "./list.js";
import $summary from "./summary.js";
import $timeseriesgroups from "./timeseries-groups.js";
import $timeseries from "./timeseries.js";
/**
 * bots command group
 * @generated from apis/overlays/radar.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "bots",
	describe:
		"Internet-wide bot traffic trends, categories, and distribution statistics",

	routes: {
		get: $get,
		list: $list,
		summary: $summary,
		timeseries: $timeseries,
		"timeseries-groups": $timeseriesgroups,
		crawlers: $crawlers,
	},
});

export default command;
