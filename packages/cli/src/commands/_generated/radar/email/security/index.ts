import $summary from "./summary.js";
import $timeseriesgroups from "./timeseries-groups.js";
import $top from "./top/index.js";
/**
 * security command group
 * @generated from apis/overlays/radar.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "security",
	describe: "Operations for email.security",

	routes: {
		summary: $summary,
		"timeseries-groups": $timeseriesgroups,
		top: $top,
	},
});

export default command;
