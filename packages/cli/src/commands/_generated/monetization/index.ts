import $accounteligibility from "./account-eligibility/index.js";
import $rules from "./rules/index.js";
/**
 * monetization command
 * @generated from apis/overlays/monetization.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "monetization",
	describe: "monetization",

	routes: {
		"account-eligibility": $accounteligibility,
		rules: $rules,
	},
});

export default command;
