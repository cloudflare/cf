import $get from "./get.js";
/**
 * whois command group
 * @generated from apis/overlays/intel.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "whois",
	describe:
		"WHOIS registration data for domains including registrant, registrar, and nameservers",

	routes: {
		get: $get,
	},
});

export default command;
