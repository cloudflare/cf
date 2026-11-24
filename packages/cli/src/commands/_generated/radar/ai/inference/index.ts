import $summary from "./summary.js";
import $timeseriesgroups from "./timeseries-groups.js";
/**
 * inference command group
 * @generated from apis/overlays/radar.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "inference",
	describe: "Operations for ai.inference",

	routes: {
		summary: $summary,
		"timeseries-groups": $timeseriesgroups,
	},
});

export default command;
