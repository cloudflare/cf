import $dns from "./dns/index.js";
/**
 * configs command group
 * @generated from apis/overlays/magic-transit.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "configs",
	describe: "Operations for advanced-dns-protection.configs",

	routes: {
		dns: $dns,
	},
});

export default command;
