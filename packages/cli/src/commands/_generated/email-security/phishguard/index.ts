import $reports from "./reports/index.js";
/**
 * phishguard command group
 * @generated from apis/overlays/email-security.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "phishguard",
	describe:
		"PhishGuard user-reported phishing reports — view detected threats for a date range",

	routes: {
		reports: $reports,
	},
});

export default command;
