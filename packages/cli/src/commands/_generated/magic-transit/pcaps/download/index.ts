import $get from "./get.js";
/**
 * download command group
 * @generated from apis/overlays/magic-transit.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "download",
	describe: "Operations for pcaps.download",

	routes: {
		get: $get,
	},
});

export default command;
