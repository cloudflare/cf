import $protection from "./protection/index.js";
/**
 * flow command group
 * @generated from apis/overlays/magic-transit.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "flow",
	describe: "Operations for advanced-tcp-protection.configs.tcp.flow",

	routes: {
		protection: $protection,
	},
});

export default command;
