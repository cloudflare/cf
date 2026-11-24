import $agreements from "./agreements/index.js";
import $enableddomains from "./enabled-domains/index.js";
import $enabledpublishers from "./enabled-publishers/index.js";
import $operator from "./operator/index.js";
import $pricing from "./pricing/index.js";
import $proposals from "./proposals/index.js";
import $usagereports from "./usage-reports/index.js";
import $usagestats from "./usage-stats/index.js";
import $zones from "./zones/index.js";
/**
 * pay-per-use command
 * @generated from apis/overlays/pay-per-use.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "pay-per-use",
	describe: "pay-per-use",

	routes: {
		agreements: $agreements,
		"enabled-domains": $enableddomains,
		"enabled-publishers": $enabledpublishers,
		operator: $operator,
		pricing: $pricing,
		proposals: $proposals,
		"usage-reports": $usagereports,
		"usage-stats": $usagestats,
		zones: $zones,
	},
});

export default command;
