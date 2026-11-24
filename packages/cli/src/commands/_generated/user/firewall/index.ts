import $accessrules from "./access-rules/index.js";
/**
 * firewall command group
 * @generated from apis/overlays/user.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "firewall",
	describe: "Firewall operations",

	routes: {
		"access-rules": $accessrules,
	},
});

export default command;
