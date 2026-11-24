import $settings from "./settings/index.js";
/**
 * universal command group
 * @generated from apis/overlays/ssl.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "universal",
	describe: "Operations for universal",

	routes: {
		settings: $settings,
	},
});

export default command;
