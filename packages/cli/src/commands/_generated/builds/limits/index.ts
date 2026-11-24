import $get from "./get.js";
/**
 * limits command group
 * @generated from apis/overlays/builds.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "limits",
	describe: "View build-minute availability and refresh information.",

	routes: {
		get: $get,
	},
});

export default command;
