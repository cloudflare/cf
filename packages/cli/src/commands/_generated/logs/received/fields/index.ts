import $get from "./get.js";
/**
 * fields command group
 * @generated from apis/overlays/logs.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "fields",
	describe: "Operations for received.fields",

	routes: {
		get: $get,
	},
});

export default command;
