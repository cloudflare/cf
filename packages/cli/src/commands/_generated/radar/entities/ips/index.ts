import $get from "./get.js";
/**
 * ips command group
 * @generated from apis/overlays/radar.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "ips",
	describe: "Operations for entities.ips",

	routes: {
		get: $get,
	},
});

export default command;
