import $rules from "./rules/index.js";
/**
 * protection command group
 * @generated from apis/overlays/magic-transit.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "protection",
	describe: "Operations for advanced-dns-protection.configs.dns.protection",

	routes: {
		rules: $rules,
	},
});

export default command;
