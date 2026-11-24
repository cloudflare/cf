import $accesscheck from "./access-check.js";
/**
 * legal-response command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "legal-response",
	describe: "Operations for requests.legal-response",

	routes: {
		"access-check": $accesscheck,
	},
});

export default command;
