import $get from "./get.js";
import $update from "./update.js";
/**
 * status command group
 * @generated from apis/overlays/magic-transit.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "status",
	describe:
		"Operations for advanced-tcp-protection.configs.tcp.protection.status",

	routes: {
		get: $get,
		update: $update,
	},
});

export default command;
