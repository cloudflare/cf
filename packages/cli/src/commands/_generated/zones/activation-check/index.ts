import $activate from "./activate.js";
/**
 * activation-check command group
 * @generated from apis/overlays/zones.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "activation-check",
	describe: "Operations for activation-check",

	routes: {
		activate: $activate,
	},
});

export default command;
