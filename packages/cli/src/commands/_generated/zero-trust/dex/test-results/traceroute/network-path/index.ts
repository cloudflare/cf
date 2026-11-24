import $get from "./get.js";
/**
 * network-path command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "network-path",
	describe: "Operations for dex.test-results.traceroute.network-path",

	routes: {
		get: $get,
	},
});

export default command;
