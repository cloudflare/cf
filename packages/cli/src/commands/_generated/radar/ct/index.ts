import $authorities from "./authorities/index.js";
import $logs from "./logs/index.js";
import $summary from "./summary.js";
import $timeseriesgroups from "./timeseries-groups.js";
import $timeseries from "./timeseries.js";
/**
 * ct command group
 * @generated from apis/overlays/radar.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "ct",
	describe:
		"Certificate Transparency log monitoring and newly-issued certificate discovery",

	routes: {
		summary: $summary,
		timeseries: $timeseries,
		"timeseries-groups": $timeseriesgroups,
		authorities: $authorities,
		logs: $logs,
	},
});

export default command;
