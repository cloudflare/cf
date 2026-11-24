import $accessrules from "./access-rules/index.js";
import $lockdowns from "./lockdowns/index.js";
import $payloadlogging from "./payload-logging/index.js";
import $uarules from "./ua-rules/index.js";
/**
 * firewall command
 * @generated from apis/overlays/firewall.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "firewall",
	describe:
		"Legacy firewall rules, zone lockdowns, access rules, user-agent blocking, and WAF packages",

	routes: {
		"access-rules": $accessrules,
		lockdowns: $lockdowns,
		"payload-logging": $payloadlogging,
		"ua-rules": $uarules,
	},
});

export default command;
