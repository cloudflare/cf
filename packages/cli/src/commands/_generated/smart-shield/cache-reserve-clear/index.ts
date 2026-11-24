import $clear from "./clear.js";
import $status from "./status.js";
/**
 * cache-reserve-clear command group
 * @generated from apis/overlays/smart-shield.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "cache-reserve-clear",
	describe: "Cache Reserve Clear operations",

	routes: {
		clear: $clear,
		status: $status,
	},
});

export default command;
