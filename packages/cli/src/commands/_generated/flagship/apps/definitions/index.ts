import $get from "./get.js";
/**
 * definitions command group
 * @generated from apis/overlays/flagship.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "definitions",
	describe: "Operations for apps.definitions",

	routes: {
		get: $get,
	},
});

export default command;
