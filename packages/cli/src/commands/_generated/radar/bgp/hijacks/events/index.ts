import $list from "./list.js";
/**
 * events command group
 * @generated from apis/overlays/radar.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "events",
	describe: "Operations for bgp.hijacks.events",

	routes: {
		list: $list,
	},
});

export default command;
