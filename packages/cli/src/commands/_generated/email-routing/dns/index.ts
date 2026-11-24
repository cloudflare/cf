import $get from "./get.js";
import $unlock from "./unlock.js";
/**
 * dns command group
 * @generated from apis/overlays/email-routing.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "dns",
	describe: "Inspect or unlock the DNS records required by Email Routing",

	routes: {
		get: $get,
		unlock: $unlock,
	},
});

export default command;
