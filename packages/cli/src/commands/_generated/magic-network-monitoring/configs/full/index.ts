import $get from "./get.js";
/**
 * full command group
 * @generated from apis/overlays/magic-network-monitoring.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "full",
	describe: "Operations for configs.full",

	routes: {
		get: $get,
	},
});

export default command;
