import $addresses from "./addresses/index.js";
import $disable from "./disable.js";
import $dns from "./dns/index.js";
import $enable from "./enable.js";
import $rules from "./rules/index.js";
import $settings from "./settings/index.js";
/**
 * email-routing command
 * @generated from apis/overlays/email-routing.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "email-routing",
	describe:
		"Route incoming email to verified destination addresses or Workers with routing rules, catch-all behavior, and managed DNS records",

	routes: {
		disable: $disable,
		enable: $enable,
		addresses: $addresses,
		dns: $dns,
		rules: $rules,
		settings: $settings,
	},
});

export default command;
