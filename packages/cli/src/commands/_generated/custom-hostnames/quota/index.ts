import $get from "./get.js";
/**
 * quota command group
 * @generated from apis/overlays/custom-hostnames.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "quota",
	describe: "Operations for quota",

	routes: {
		get: $get,
	},
});

export default command;
