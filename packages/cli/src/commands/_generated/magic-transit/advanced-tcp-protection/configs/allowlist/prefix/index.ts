import $delete from "./delete.js";
import $get from "./get.js";
import $update from "./update.js";
/**
 * prefix command group
 * @generated from apis/overlays/magic-transit.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "prefix",
	describe: "Operations for advanced-tcp-protection.configs.allowlist.prefix",

	routes: {
		delete: $delete,
		get: $get,
		update: $update,
	},
});

export default command;
