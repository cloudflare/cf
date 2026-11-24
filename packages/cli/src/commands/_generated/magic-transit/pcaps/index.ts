import $create from "./create.js";
import $download from "./download/index.js";
import $get from "./get.js";
import $list from "./list.js";
import $ownership from "./ownership/index.js";
import $stop from "./stop.js";
/**
 * pcaps command group
 * @generated from apis/overlays/magic-transit.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "pcaps",
	describe:
		"Packet capture requests for debugging traffic flowing through Magic Transit tunnels",

	routes: {
		create: $create,
		get: $get,
		list: $list,
		stop: $stop,
		download: $download,
		ownership: $ownership,
	},
});

export default command;
