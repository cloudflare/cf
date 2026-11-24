import $get from "./get.js";
/**
 * configs command group
 * @generated from apis/overlays/zaraz.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "configs",
	describe: "Operations for history.configs",

	routes: {
		get: $get,
	},
});

export default command;
