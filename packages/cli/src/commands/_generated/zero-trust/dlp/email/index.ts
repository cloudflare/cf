import $accountmapping from "./account-mapping/index.js";
import $rules from "./rules/index.js";
/**
 * email command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "email",
	describe: "Operations for dlp.email",

	routes: {
		"account-mapping": $accountmapping,
		rules: $rules,
	},
});

export default command;
