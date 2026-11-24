import $fields from "./fields/index.js";
import $get from "./get.js";
/**
 * received command group
 * @generated from apis/overlays/logs.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "received",
	describe: "Received log operations",

	routes: {
		get: $get,
		fields: $fields,
	},
});

export default command;
