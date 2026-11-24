import $byclass from "./by-class.js";
import $bypartner from "./by-partner.js";
import $byseverity from "./by-severity.js";
import $bytype from "./by-type.js";
/**
 * count command group
 * @generated from apis/overlays/security-insights.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "count",
	describe: "Operations for count",

	routes: {
		"by-class": $byclass,
		"by-partner": $bypartner,
		"by-severity": $byseverity,
		"by-type": $bytype,
	},
});

export default command;
