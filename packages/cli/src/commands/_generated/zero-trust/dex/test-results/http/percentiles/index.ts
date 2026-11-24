import $get from "./get.js";
/**
 * percentiles command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "percentiles",
	describe: "Operations for dex.test-results.http.percentiles",

	routes: {
		get: $get,
	},
});

export default command;
