import $get from "./get.js";
import $networkpath from "./network-path/index.js";
import $percentiles from "./percentiles/index.js";
/**
 * traceroute command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "traceroute",
	describe: "Operations for dex.test-results.traceroute",

	routes: {
		get: $get,
		"network-path": $networkpath,
		percentiles: $percentiles,
	},
});

export default command;
