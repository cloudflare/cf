import $settings from "./settings/index.js";
/**
 * hostnames command group
 * @generated from apis/overlays/zones.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "hostnames",
	describe: "Operations for hostnames",

	routes: {
		settings: $settings,
	},
});

export default command;
