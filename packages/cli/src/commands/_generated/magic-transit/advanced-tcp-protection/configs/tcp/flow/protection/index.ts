import $filters from "./filters/index.js";
import $rules from "./rules/index.js";
/**
 * protection command group
 * @generated from apis/overlays/magic-transit.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "protection",
	describe:
		"Operations for advanced-tcp-protection.configs.tcp.flow.protection",

	routes: {
		filters: $filters,
		rules: $rules,
	},
});

export default command;
