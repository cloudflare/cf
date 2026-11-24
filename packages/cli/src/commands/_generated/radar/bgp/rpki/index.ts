import $aspa from "./aspa/index.js";
import $roas from "./roas/index.js";
/**
 * rpki command group
 * @generated from apis/overlays/radar.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "rpki",
	describe: "Operations for bgp.rpki",

	routes: {
		aspa: $aspa,
		roas: $roas,
	},
});

export default command;
