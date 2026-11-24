import $update from "./update.js";
/**
 * predefined command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "predefined",
	describe: "Data Loss Prevention - manage predefined profiles",

	routes: {
		update: $update,
	},
});

export default command;
