import $get from "./get.js";
import $update from "./update.js";
/**
 * cps command
 * @generated from apis/overlays/cps.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "cps",
	describe: "cps",

	routes: {
		get: $get,
		update: $update,
	},
});

export default command;
