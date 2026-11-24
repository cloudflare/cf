import $datasecurity from "./data-security/index.js";
import $summary from "./summary.js";
import $timeseries from "./timeseries.js";
import $topn from "./top-n.js";
/**
 * query command group
 * @generated from apis/overlays/analytics.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "query",
	describe: "Operations for query",

	routes: {
		summary: $summary,
		timeseries: $timeseries,
		"top-n": $topn,
		"data-security": $datasecurity,
	},
});

export default command;
