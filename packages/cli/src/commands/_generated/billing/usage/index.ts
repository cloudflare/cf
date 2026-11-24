import $getaccountbillablemetrics from "./get-account-billable-metrics.js";
import $getaccountusagev2 from "./get-account-usage-v2.js";
import $getinfov1 from "./get-info-v1.js";
import $getv1 from "./get-v1.js";
import $query from "./query.js";
/**
 * usage command group
 * @generated from apis/overlays/billing.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "usage",
	describe:
		"Metered usage data for billed services — requests, bandwidth, and feature consumption",

	routes: {
		"get-account-billable-metrics": $getaccountbillablemetrics,
		"get-account-usage-v2": $getaccountusagev2,
		"get-info-v1": $getinfov1,
		"get-v1": $getv1,
		query: $query,
	},
});

export default command;
