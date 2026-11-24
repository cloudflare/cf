import $get from "./get.js";
/**
 * downloads command group
 * @generated from apis/overlays/intel.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "downloads",
	describe: "Operations for indicator-feeds.downloads",

	routes: {
		get: $get,
	},
});

export default command;
