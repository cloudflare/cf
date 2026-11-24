import $get from "./get.js";
/**
 * stats command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "stats",
	describe: "Rule statistics operations",

	routes: {
		get: $get,
	},
});

export default command;
