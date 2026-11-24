import $disable from "./disable.js";
import $enable from "./enable.js";
import $get from "./get.js";
/**
 * sippy command group
 * @generated from apis/overlays/r2.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "sippy",
	describe: "Operations for buckets.sippy",

	routes: {
		disable: $disable,
		enable: $enable,
		get: $get,
	},
});

export default command;
