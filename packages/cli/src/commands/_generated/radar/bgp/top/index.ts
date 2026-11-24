import $ases from "./ases/index.js";
import $prefixes from "./prefixes.js";
/**
 * top command group
 * @generated from apis/overlays/radar.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "top",
	describe: "Operations for bgp.top",

	routes: {
		prefixes: $prefixes,
		ases: $ases,
	},
});

export default command;
