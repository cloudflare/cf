import $get from "./get.js";
/**
 * status command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "status",
	describe: "Data Loss Prevention - retrieve Worker validator status",

	routes: {
		get: $get,
	},
});

export default command;
