import $get from "./get.js";
/**
 * service-provider-config command group
 * @generated from apis/overlays/scim.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "service-provider-config",
	describe: "Service Provider Config operations",

	routes: {
		get: $get,
	},
});

export default command;
