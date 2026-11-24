import $get from "./get.js";
import $list from "./list.js";
/**
 * slots command group
 * @generated from apis/overlays/network-interconnects.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "slots",
	describe:
		"Available interconnect facility slots showing port capacity at Cloudflare data centers",

	routes: {
		get: $get,
		list: $list,
	},
});

export default command;
