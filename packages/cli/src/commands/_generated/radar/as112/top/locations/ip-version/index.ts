import $get from "./get.js";
/**
 * ip-version command group
 * @generated from apis/overlays/radar.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "ip-version",
	describe: "Operations for as112.top.locations.ip-version",

	routes: {
		get: $get,
	},
});

export default command;
