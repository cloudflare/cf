import $schemas from "./schemas/index.js";
import $settings from "./settings/index.js";
/**
 * schema-validation command group
 * @generated from apis/overlays/api-security.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "schema-validation",
	describe: "Operations for schema-validation",

	routes: {
		schemas: $schemas,
		settings: $settings,
	},
});

export default command;
