import $protection from "./protection/index.js";
/**
 * dns command group
 * @generated from apis/overlays/magic-transit.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "dns",
	describe: "Operations for advanced-dns-protection.configs.dns",

	routes: {
		protection: $protection,
	},
});

export default command;
