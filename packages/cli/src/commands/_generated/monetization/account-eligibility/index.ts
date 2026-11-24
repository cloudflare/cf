import $check from "./check.js";
import $get from "./get.js";
/**
 * account-eligibility command group
 * @generated from apis/overlays/monetization.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "account-eligibility",
	describe: "Operations for account-eligibility",

	routes: {
		check: $check,
		get: $get,
	},
});

export default command;
