import $monthlyreport from "./monthly-report/index.js";
/**
 * analytics command group
 * @generated from apis/overlays/email-security.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "analytics",
	describe:
		"Analytics and reporting — monthly report and per-day breakdowns of threat activity",

	routes: {
		"monthly-report": $monthlyreport,
	},
});

export default command;
