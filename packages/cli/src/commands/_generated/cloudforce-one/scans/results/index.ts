import $getbanners from "./get-banners.js";
import $get from "./get.js";
/**
 * results command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "results",
	describe: "Operations for scans.results",

	routes: {
		get: $get,
		"get-banners": $getbanners,
	},
});

export default command;
