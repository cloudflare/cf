import $get from "./get.js";
import $list from "./list.js";
/**
 * authorities command group
 * @generated from apis/overlays/radar.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "authorities",
	describe: "Operations for ct.authorities",

	routes: {
		get: $get,
		list: $list,
	},
});

export default command;
