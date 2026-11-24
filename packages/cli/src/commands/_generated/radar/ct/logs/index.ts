import $get from "./get.js";
import $list from "./list.js";
/**
 * logs command group
 * @generated from apis/overlays/radar.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "logs",
	describe: "Operations for ct.logs",

	routes: {
		get: $get,
		list: $list,
	},
});

export default command;
