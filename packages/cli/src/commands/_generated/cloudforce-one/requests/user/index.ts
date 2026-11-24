import $get from "./get.js";
/**
 * user command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "user",
	describe: "Operations for requests.user",

	routes: {
		get: $get,
	},
});

export default command;
