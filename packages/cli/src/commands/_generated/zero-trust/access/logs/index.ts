import $accessrequests from "./access-requests/index.js";
import $jitrequests from "./jit-requests/index.js";
import $scim from "./scim/index.js";
/**
 * logs command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "logs",
	describe: "Operations for access.logs",

	routes: {
		"access-requests": $accessrequests,
		"jit-requests": $jitrequests,
		scim: $scim,
	},
});

export default command;
