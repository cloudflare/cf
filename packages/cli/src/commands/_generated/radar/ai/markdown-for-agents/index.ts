import $summary from "./summary.js";
import $timeseries from "./timeseries.js";
/**
 * markdown-for-agents command group
 * @generated from apis/overlays/radar.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "markdown-for-agents",
	describe: "Operations for ai.markdown-for-agents",

	routes: {
		summary: $summary,
		timeseries: $timeseries,
	},
});

export default command;
