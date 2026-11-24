import $dayreport from "./day-report.js";
import $fullreport from "./full-report.js";
/**
 * asn command group
 * @generated from apis/overlays/botnet-feed.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "asn",
	describe:
		"ASN-level botnet activity data showing networks with known C2 infrastructure",

	routes: {
		"day-report": $dayreport,
		"full-report": $fullreport,
	},
});

export default command;
