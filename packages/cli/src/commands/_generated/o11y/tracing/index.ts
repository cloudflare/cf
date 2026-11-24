import $rules from "./rules/index.js";
import $settings from "./settings/index.js";
/**
 * tracing command group
 * @generated from apis/overlays/o11y.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "tracing",
	describe: "Operations for tracing",

	routes: {
		rules: $rules,
		settings: $settings,
	},
});

export default command;
