import $get from "./get.js";
/**
 * quota command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "quota",
	describe: "Operations for requests.quota",

	routes: {
		get: $get,
	},
});

export default command;
