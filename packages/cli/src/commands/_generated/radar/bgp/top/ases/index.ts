import $get from "./get.js";
import $prefixes from "./prefixes.js";
/**
 * ases command group
 * @generated from apis/overlays/radar.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "ases",
	describe: "Operations for bgp.top.ases",

	routes: {
		get: $get,
		prefixes: $prefixes,
	},
});

export default command;
