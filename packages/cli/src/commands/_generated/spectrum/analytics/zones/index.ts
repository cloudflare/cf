import $report from "./report/index.js";
/**
 * zones command group
 * @generated from apis/overlays/spectrum.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "zones",
	describe: "Operations for analytics.zones",

	routes: {
		report: $report,
	},
});

export default command;
