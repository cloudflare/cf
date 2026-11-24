import $get from "./get.js";
/**
 * over-time command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "over-time",
	describe: "Operations for dex.devices.over-time",

	routes: {
		get: $get,
	},
});

export default command;
