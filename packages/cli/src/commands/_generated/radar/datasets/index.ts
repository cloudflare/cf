import $download from "./download.js";
import $get from "./get.js";
import $list from "./list.js";
/**
 * datasets command group
 * @generated from apis/overlays/radar.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "datasets",
	describe: "Downloadable Radar datasets for offline analysis and research",

	routes: {
		download: $download,
		get: $get,
		list: $list,
	},
});

export default command;
