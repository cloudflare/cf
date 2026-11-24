import $get from "./get.js";
/**
 * live command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "live",
	describe: "Operations for dex.devices.aggregates.live",

	routes: {
		get: $get,
	},
});

export default command;
