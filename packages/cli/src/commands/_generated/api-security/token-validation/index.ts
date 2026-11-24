import $configurations from "./configurations/index.js";
import $rules from "./rules/index.js";
/**
 * token-validation command group
 * @generated from apis/overlays/api-security.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "token-validation",
	describe: "Operations for token-validation",

	routes: {
		configurations: $configurations,
		rules: $rules,
	},
});

export default command;
