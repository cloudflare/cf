import $eligible from "./eligible/index.js";
import $pagerduty from "./pagerduty/index.js";
import $webhooks from "./webhooks/index.js";
/**
 * destinations command group
 * @generated from apis/overlays/alerting.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "destinations",
	describe: "Operations for destinations",

	routes: {
		eligible: $eligible,
		pagerduty: $pagerduty,
		webhooks: $webhooks,
	},
});

export default command;
