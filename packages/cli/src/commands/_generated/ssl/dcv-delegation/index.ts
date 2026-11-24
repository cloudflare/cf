import $get from "./get.js";
/**
 * dcv-delegation command group
 * @generated from apis/overlays/ssl.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "dcv-delegation",
	describe: "Operations for dcv-delegation",

	routes: {
		get: $get,
	},
});

export default command;
