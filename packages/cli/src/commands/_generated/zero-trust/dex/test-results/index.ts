import $http from "./http/index.js";
import $traceroute from "./traceroute/index.js";
/**
 * test-results command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "test-results",
	describe: "Operations for dex.test-results",

	routes: {
		http: $http,
		traceroute: $traceroute,
	},
});

export default command;
