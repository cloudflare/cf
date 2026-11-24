import $categories from "./categories.js";
import $timeseriesgroups from "./timeseries-groups.js";
import $top from "./top.js";
/**
 * internet-services command group
 * @generated from apis/overlays/radar.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "internet-services",
	describe: "Operations for ranking.internet-services",

	routes: {
		categories: $categories,
		"timeseries-groups": $timeseriesgroups,
		top: $top,
	},
});

export default command;
