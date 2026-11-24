import $industry from "./industry/index.js";
import $policies from "./policies/index.js";
import $reports from "./reports/index.js";
/**
 * reporting command
 * @generated from apis/overlays/reporting.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "reporting",
	describe: "reporting",

	routes: {
		industry: $industry,
		policies: $policies,
		reports: $reports,
	},
});

export default command;
