import $list from "./list.js";
/**
 * paths command group
 * @generated from apis/overlays/radar.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "paths",
	describe: "Operations for bgp.routes.paths",

	routes: {
		list: $list,
	},
});

export default command;
