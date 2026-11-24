import $get from "./get.js";
import $percentiles from "./percentiles/index.js";
/**
 * http command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "http",
	describe: "Operations for dex.test-results.http",

	routes: {
		get: $get,
		percentiles: $percentiles,
	},
});

export default command;
