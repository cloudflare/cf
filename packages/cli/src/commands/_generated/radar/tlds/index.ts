import $get from "./get.js";
import $list from "./list.js";
import $performance from "./performance/index.js";
/**
 * tlds command group
 * @generated from apis/overlays/radar.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "tlds",
	describe: "Top-level domain (TLD) metadata and performance trends",

	routes: {
		get: $get,
		list: $list,
		performance: $performance,
	},
});

export default command;
