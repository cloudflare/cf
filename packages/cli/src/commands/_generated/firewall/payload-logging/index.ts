import $delete from "./delete.js";
import $get from "./get.js";
import $update from "./update.js";
/**
 * payload-logging command group
 * @generated from apis/overlays/firewall.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "payload-logging",
	describe:
		"Account-level public key that WAF payload logging uses to encrypt matched payloads",

	routes: {
		delete: $delete,
		get: $get,
		update: $update,
	},
});

export default command;
