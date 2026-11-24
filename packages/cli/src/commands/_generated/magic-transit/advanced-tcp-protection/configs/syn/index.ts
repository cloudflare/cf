import $protection from "./protection/index.js";
/**
 * syn command group
 * @generated from apis/overlays/magic-transit.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "syn",
	describe: "Operations for advanced-tcp-protection.configs.syn",

	routes: {
		protection: $protection,
	},
});

export default command;
