import $flow from "./flow/index.js";
import $protection from "./protection/index.js";
/**
 * tcp command group
 * @generated from apis/overlays/magic-transit.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "tcp",
	describe: "Operations for advanced-tcp-protection.configs.tcp",

	routes: {
		flow: $flow,
		protection: $protection,
	},
});

export default command;
