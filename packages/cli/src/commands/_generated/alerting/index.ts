import $availablealerts from "./available-alerts/index.js";
import $destinations from "./destinations/index.js";
import $history from "./history/index.js";
import $policies from "./policies/index.js";
import $silences from "./silences/index.js";
/**
 * alerting command
 * @generated from apis/overlays/alerting.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "alerting",
	describe: "alerting",

	routes: {
		"available-alerts": $availablealerts,
		destinations: $destinations,
		history: $history,
		policies: $policies,
		silences: $silences,
	},
});

export default command;
