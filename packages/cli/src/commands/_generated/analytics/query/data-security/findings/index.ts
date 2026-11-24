import $summary from "./summary.js";
import $timeseries from "./timeseries.js";
/**
 * findings command group
 * @generated from apis/overlays/analytics.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "findings",
	describe: "Operations for query.data-security.findings",

	routes: {
		summary: $summary,
		timeseries: $timeseries,
	},
});

export default command;
