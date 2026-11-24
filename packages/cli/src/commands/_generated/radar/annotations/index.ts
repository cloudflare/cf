import $get from "./get.js";
import $list from "./list.js";
import $outages from "./outages/index.js";
/**
 * annotations command group
 * @generated from apis/overlays/radar.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "annotations",
	describe:
		"Radar annotations marking significant Internet events (outages, cable cuts, etc.)",

	routes: {
		get: $get,
		list: $list,
		outages: $outages,
	},
});

export default command;
