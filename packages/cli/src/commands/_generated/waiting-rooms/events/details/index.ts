import $get from "./get.js";
/**
 * details command group
 * @generated from apis/overlays/waiting-rooms.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "details",
	describe: "Operations for events.details",

	routes: {
		get: $get,
	},
});

export default command;
