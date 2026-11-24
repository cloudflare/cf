import $get from "./get.js";
import $update from "./update.js";
/**
 * fraud command
 * @generated from apis/overlays/fraud.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "fraud",
	describe: "fraud",

	routes: {
		get: $get,
		update: $update,
	},
});

export default command;
