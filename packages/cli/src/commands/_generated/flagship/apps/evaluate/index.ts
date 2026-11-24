import $get from "./get.js";
/**
 * evaluate command group
 * @generated from apis/overlays/flagship.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "evaluate",
	describe: "Operations for apps.evaluate",

	routes: {
		get: $get,
	},
});

export default command;
