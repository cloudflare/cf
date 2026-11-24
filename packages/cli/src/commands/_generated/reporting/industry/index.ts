import $get from "./get.js";
import $update from "./update.js";
/**
 * industry command group
 * @generated from apis/overlays/reporting.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "industry",
	describe: "Operations for industry",

	routes: {
		get: $get,
		update: $update,
	},
});

export default command;
