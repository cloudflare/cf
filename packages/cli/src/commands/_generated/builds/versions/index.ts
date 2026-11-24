import $get from "./get.js";
/**
 * versions command group
 * @generated from apis/overlays/builds.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "versions",
	describe: "Find builds associated with Worker versions.",

	routes: {
		get: $get,
	},
});

export default command;
